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
  initializeMap: (element: HTMLElement, center: { lat: number; lng: number }) => Promise<void>;
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
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}&v=weekly`;
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
  ): Promise<void> => {
    console.log('🗺️ [HOOK] initializeMap chamado')
    console.log('🗺️ [HOOK] isLoaded:', isLoaded)
    console.log('🗺️ [HOOK] element:', element)
    console.log('🗺️ [HOOK] center:', center)
    
    if (!isLoaded) {
      console.log('🗺️ [HOOK] Google Maps não carregado, carregando...')
      await loadGoogleMaps();
    }

    if (!window.google || !window.google.maps) {
      console.error('🗺️ [HOOK] Google Maps não está disponível após carregamento')
      throw new Error('Google Maps não está disponível');
    }

    console.log('🗺️ [HOOK] Iniciando criação do mapa...')
    setIsInitializing(true);
    setError(null);

    try {
      const mapOptions: google.maps.MapOptions = {
        ...defaultMapOptions,
        center,
      };

      console.log('🗺️ [HOOK] Criando instância do Google Maps...')
      console.log('🗺️ [HOOK] mapOptions:', mapOptions)
      
      const map = new google.maps.Map(element, mapOptions);
      console.log('🗺️ [HOOK] Mapa criado com sucesso:', map)
      
      setMapInstance(map);
      console.log('🗺️ [HOOK] setMapInstance chamado')
      
      setIsInitializing(false);
      console.log('🗺️ [HOOK] initializeMap concluído com sucesso')
    } catch (error) {
      console.error('🗺️ [HOOK] Erro ao criar mapa:', error)
      const errorMsg = 'Erro ao inicializar o mapa';
      setError(errorMsg);
      setIsInitializing(false);
      throw new Error(errorMsg);
    }
  }, [isLoaded, loadGoogleMaps, defaultMapOptions]);

  const addMarker = useCallback((
    position: { lat: number; lng: number }, 
    title?: string
  ) => {
    console.log('📍 addMarker chamado com:', { position, title })
    console.log('📍 mapInstance:', !!mapInstance)
    console.log('📍 window.google:', !!window.google)
    console.log('📍 currentMarker:', !!currentMarker)
    
    if (!mapInstance || !window.google) {
      console.warn('❌ Mapa não está inicializado - mapInstance:', !!mapInstance, 'google:', !!window.google);
      return;
    }

    // Remover marcador anterior se existir
    if (currentMarker) {
      console.log('📍 Removendo marcador anterior')
      currentMarker.setMap(null);
    }

    // Criar novo marcador
    console.log('📍 Criando novo marcador...')
    console.log('📍 Posição do marcador:', position)
    console.log('📍 Mapa de destino:', mapInstance)
    console.log('📍 Título:', title)
    
    const marker = new google.maps.Marker({
      position,
      map: mapInstance,
      title,
      animation: google.maps.Animation.DROP
    });

    console.log('📍 Marcador criado com sucesso:', marker)
    console.log('📍 Marcador visível:', marker.getVisible())
    console.log('📍 Marcador posição:', marker.getPosition())
    console.log('📍 Marcador mapa:', marker.getMap())
    
    setCurrentMarker(marker);
  }, [mapInstance, currentMarker]);

  const clearMarker = useCallback(() => {
    if (currentMarker) {
      currentMarker.setMap(null);
      setCurrentMarker(null);
    }
  }, [currentMarker]);

  const centerMap = useCallback((position: { lat: number; lng: number }) => {
    if (mapInstance) {
      mapInstance.setCenter(position);
    }
  }, [mapInstance]);

  const clearMap = useCallback(() => {
    if (currentMarker) {
      currentMarker.setMap(null);
      setCurrentMarker(null);
    }
    
    setMapInstance(null);
  }, [currentMarker]);

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
