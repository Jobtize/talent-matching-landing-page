import { useState, useCallback, useRef, useEffect } from 'react';

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface LocationSearchState {
  /** Lista de sugestões de localizações */
  suggestions: PlacePrediction[];
  /** Estado de carregamento da busca */
  isLoading: boolean;
  /** Erro ocorrido durante a busca */
  error: string | null;
  /** Se o Google Maps está carregado e disponível */
  isGoogleMapsReady: boolean;
}

export interface UseLocationSearchOptions {
  /** Tempo de debounce em milissegundos (padrão: 300ms) */
  debounceMs?: number;
  /** Número mínimo de caracteres para iniciar a busca (padrão: 2) */
  minQueryLength?: number;
  /** Número máximo de resultados (padrão: 8) */
  maxResults?: number;
  /** Centro de bias para a busca (padrão: centro do Brasil) */
  locationBias?: {
    center: { lat: number; lng: number };
    radius: number;
  };
}

export interface UseLocationSearchReturn extends LocationSearchState {
  /** Função para buscar localizações */
  searchLocations: (query: string) => void;
  /** Função para limpar as sugestões */
  clearSuggestions: () => void;
  /** Função para obter detalhes de um local específico */
  getPlaceDetails: (placeId: string) => Promise<{
    location: { lat: number; lng: number };
    formattedAddress: string;
  } | null>;
}

/**
 * Hook customizado para busca de localizações com debounce
 * 
 * @example
 * ```tsx
 * const { suggestions, isLoading, searchLocations, getPlaceDetails } = useLocationSearch({
 *   debounceMs: 300,
 *   maxResults: 5
 * });
 * 
 * const handleSearch = (query: string) => {
 *   searchLocations(query);
 * };
 * 
 * const handleSelectPlace = async (placeId: string) => {
 *   const details = await getPlaceDetails(placeId);
 *   if (details) {
 *     console.log('Local selecionado:', details);
 *   }
 * };
 * ```
 */
export function useLocationSearch(options: UseLocationSearchOptions = {}): UseLocationSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 8,
    locationBias = {
      center: { lat: -14.235, lng: -51.9253 }, // Centro do Brasil
      radius: 50000 // 50km
    }
  } = options;

  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetAbortController = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  };
  // Verificar se Google Maps está carregado
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsReady(true);
      }
    };

    checkGoogleMaps();
    
    // Verificar periodicamente se ainda não carregou
    const interval = setInterval(() => {
      if (!isGoogleMapsReady) {
        checkGoogleMaps();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGoogleMapsReady]);

  const performSearch = useCallback(async (query: string) => {
    if (!isGoogleMapsReady || !window.google) {
      setError('Google Maps não está disponível');
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController para esta busca
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      
      // Usar Places API (New) - Text Search
      const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const request = {
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
        locationBias: locationBias,
        maxResultCount: maxResults
      };

      const { places } = await (Place as unknown as { 
        searchByText: (request: unknown) => Promise<{ places: unknown[] }> 
      }).searchByText(request);

      // Verificar se a busca foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (places && places.length > 0) {
        const formattedSuggestions = places.map((place: unknown, index: number) => {
          const p = place as { 
            formattedAddress?: string; 
            displayName?: string; 
            id?: string 
          };
          
          return {
            description: p.formattedAddress || p.displayName || '',
            place_id: p.id || `place_${index}`,
            structured_formatting: {
              main_text: p.displayName || '',
              secondary_text: p.formattedAddress || ''
            }
          };
        });

        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      // Não mostrar erro se foi cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('Error with Places API (New):', error);
      setError('Erro ao buscar localizações');
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [isGoogleMapsReady, locationBias, maxResults]);

  const searchLocations = useCallback((query: string) => {
    // Limpar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cancelar busca anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validar query
    if (query.length < minQueryLength) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Aplicar debounce
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs, minQueryLength]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    
    // Cancelar busca pendente
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<{
    location: { lat: number; lng: number };
    formattedAddress: string;
  } | null> => {
    if (!isGoogleMapsReady || !window.google) {
      console.error('Google Maps não está disponível');
      return null;
    }

    try {
      const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const place = new Place({
        id: placeId,
        requestedLanguage: 'pt-BR'
      });

      await (place as unknown as {
        fetchFields: (options: { fields: string[] }) => Promise<void>;
      }).fetchFields({
        fields: ['location', 'formattedAddress']
      });

      const placeData = place as unknown as {
        location?: {
          lat: () => number;
          lng: () => number;
        };
        formattedAddress?: string;
      };

      if (placeData.location) {
        return {
          location: {
            lat: placeData.location.lat(),
            lng: placeData.location.lng()
          },
          formattedAddress: placeData.formattedAddress || ''
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }, [isGoogleMapsReady]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    isGoogleMapsReady,
    searchLocations,
    clearSuggestions,
    getPlaceDetails
  };
}
