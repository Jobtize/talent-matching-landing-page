import { useState, useCallback, useRef, useEffect } from 'react';

export interface MapState {
  /** Se o Google Maps está carregado e pronto para uso */
  isLoaded: boolean;
  /** Se o mapa está sendo inicializado */
  isInitializing: boolean;
  /** Erro ocorrido durante o carregamento ou inicialização */
  error: string | null;
  /** Instância atual do mapa */
  mapInstance: google.maps.Map | null;
  /** Marcador atual no mapa */
  currentMarker: google.maps.Marker | null;
}

export interface UseMapIntegrationOptions {
  /** Chave da API do Google Maps */
  apiKey?: string;
  /** Bibliotecas do Google Maps a serem carregadas */
  libraries?: string[];
  /** Configurações padrão do mapa */
  defaultMapOptions?: Partial<google.maps.MapOptions>;
}

export interface UseMapIntegrationReturn extends MapState {
  /** Função para inicializar o mapa em um elemento DOM */
  initializeMap: (element: HTMLElement, center: { lat: number; lng: number }) => Promise<google.maps.Map | null>;
  /** Função para adicionar um marcador no mapa */
  addMarker: (position: { lat: number; lng: number }, title?: string) => void;
  /** Função para remover o marcador atual */
  clearMarker: () => void;
  /** Função para centralizar o mapa em uma posição */
  centerMap: (position: { lat: number; lng: number }) => void;
  /** Função para limpar a instância do mapa */
  clearMap: () => void;
  /** Função para carregar o Google Maps dinamicamente */
  loadGoogleMaps: () => Promise<void>;
}

/**
 * Hook customizado para integração com Google Maps
 * 
 * @example
 * ```tsx
 * const { 
 *   isLoaded, 
 *   mapInstance, 
 *   initializeMap, 
 *   addMarker, 
 *   centerMap 
 * } = useMapIntegration({
 *   apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * });
 * 
 * const mapRef = useRef<HTMLDivElement>(null);
 * 
 * const handleInitMap = async () => {
 *   if (mapRef.current && isLoaded) {
 *     await initializeMap(mapRef.current, { lat: -23.5505, lng: -46.6333 });
 *     addMarker({ lat: -23.5505, lng: -46.6333 }, 'São Paulo');
 *   }
 * };
 * ```
 */
export function useMapIntegration(options: UseMapIntegrationOptions = {}): UseMapIntegrationReturn {
  const {
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries = ['places', 'geometry'],
    defaultMapOptions = {
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative'
    }
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null);

  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Verificar se Google Maps já está carregado
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
    }
  }, []);

  const loadGoogleMaps = useCallback(async (): Promise<void> => {
    // Se já está carregado, não fazer nada
    if (isLoaded || (typeof window !== 'undefined' && window.google && window.google.maps)) {
      setIsLoaded(true);
      return;
    }

    // Se já está carregando, retornar a promise existente
    if (loadingPromiseRef.current) {
      return loadingPromiseRef.current;
    }

    // Verificar se a API key está disponível
    if (!apiKey) {
      const errorMsg = 'Google Maps API key não encontrada';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // Verificar se o script já existe
    if (typeof document !== 'undefined' && document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script já existe, aguardar carregamento
      const checkLoaded = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(interval);
              setIsLoaded(true);
              resolve();
            }
          }, 100);
        });
      };
      
      loadingPromiseRef.current = checkLoaded();
      return loadingPromiseRef.current;
    }

    // Criar e carregar o script
    const loadScript = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}&v=weekly&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          setError(null);
          resolve();
        };
        
        script.onerror = () => {
          const errorMsg = 'Erro ao carregar Google Maps';
          setError(errorMsg);
          reject(new Error(errorMsg));
        };
        
        document.head.appendChild(script);
      });
    };

    try {
      loadingPromiseRef.current = loadScript();
      await loadingPromiseRef.current;
    } catch (error) {
      loadingPromiseRef.current = null;
      throw error;
    } finally {
      loadingPromiseRef.current = null;
    }
  }, [apiKey, libraries, isLoaded]);

  const initializeMap = useCallback(async (
    element: HTMLElement, 
    center: { lat: number; lng: number }
  ): Promise<google.maps.Map | null> => {
    // Verificar se o Google Maps já está carregado
    if (!isLoaded) {
      await loadGoogleMaps();
    }

    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps não está disponível');
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Limpar qualquer instância anterior
      if (mapRef.current) {
        mapRef.current = null;
        setMapInstance(null);
      }

      // Configurar opções do mapa
      const mapOptions: google.maps.MapOptions = {
        ...defaultMapOptions,
        center,
        zoom: 15
      };
      
      // Criar nova instância do mapa
      const map = new google.maps.Map(element, mapOptions);
      
      // Aguardar o mapa estar pronto usando o evento 'idle'
      await new Promise<void>((resolve) => {
        const idleListener = map.addListener('idle', () => {
          google.maps.event.removeListener(idleListener);
          resolve();
        });
        
        // Timeout de segurança (3 segundos)
        setTimeout(() => {
          google.maps.event.removeListener(idleListener);
          resolve();
        }, 3000);
      });
      
      // Garantir que o centro e zoom estão corretos
      map.setCenter(center);
      map.setZoom(15);
      
      // Atualizar referências
      mapRef.current = map;
      setMapInstance(map);
      setIsInitializing(false);
      
      return map;
    } catch (error) {
      setError('Erro ao inicializar o mapa');
      setIsInitializing(false);
      return null;
    }
  }, [isLoaded, loadGoogleMaps, defaultMapOptions]);

  const addMarker = useCallback((
    position: { lat: number; lng: number }, 
    title?: string
  ) => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    // Limpar o anterior de forma segura usando setter com função
    setCurrentMarker(prev => {
      if (prev) prev.setMap(null);
      return prev;
    });

    const marker = new google.maps.Marker({
      position,
      map,
      title,
      animation: google.maps.Animation.DROP,
    });

    setCurrentMarker(marker);
  }, []);

  const clearMarker = useCallback(() => {
    if (currentMarker) {
      currentMarker.setMap(null);
      setCurrentMarker(null);
    }
  }, []);

  const centerMap = useCallback((position: { lat: number; lng: number }) => {
    const map = mapRef.current;
    if (!map) return;
    // Usar panTo se projeção estiver pronta, senão setCenter
    if (map.getProjection()) map.panTo(position); 
    else map.setCenter(position);
  }, []);

  const clearMap = useCallback(() => {
    // Limpar marcador
    if (currentMarker) {
      currentMarker.setMap(null);
      setCurrentMarker(null);
    }
    
    // Limpar instância do mapa
    if (mapRef.current) {
      // Remover todos os listeners para evitar memory leaks
      if (window.google && window.google.maps) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      
      // Limpar referências
      mapRef.current = null;
      setMapInstance(null);
    }
  }, []);

  // Auto-carregar Google Maps se a API key estiver disponível
  useEffect(() => {
    if (apiKey && !isLoaded && typeof window !== 'undefined') {
      loadGoogleMaps().catch((error) => {
        console.error('Erro ao carregar Google Maps automaticamente:', error);
      });
    }
  }, [apiKey, isLoaded, loadGoogleMaps]);

  return {
    isLoaded,
    isInitializing,
    error,
    mapInstance,
    currentMarker,
    initializeMap,
    addMarker,
    clearMarker,
    centerMap,
    clearMap,
    loadGoogleMaps
  };
}
