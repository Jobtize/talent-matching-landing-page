import { useState, useCallback } from 'react';

export interface GeolocationState {
  /** Coordenadas da localização atual */
  coordinates: { lat: number; lng: number } | null;
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro ocorrido durante a obtenção da localização */
  error: string | null;
  /** Se a geolocalização é suportada pelo navegador */
  isSupported: boolean;
}

export interface UseGeolocationReturn extends GeolocationState {
  /** Função para obter a localização atual */
  getCurrentLocation: () => Promise<void>;
  /** Função para limpar o estado */
  clearLocation: () => void;
}

/**
 * Hook customizado para gerenciar geolocalização do usuário
 * 
 * @example
 * ```tsx
 * const { coordinates, isLoading, error, getCurrentLocation } = useGeolocation();
 * 
 * const handleGetLocation = async () => {
 *   await getCurrentLocation();
 *   if (coordinates) {
 *     console.log('Localização:', coordinates);
 *   }
 * };
 * ```
 */
export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCoordinates(coords);
          setIsLoading(false);
          setError(null);
          resolve();
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada pelo usuário';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informações de localização não disponíveis';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite para obter localização excedido';
              break;
            default:
              errorMessage = `Erro desconhecido: ${error.message}`;
              break;
          }
          
          setError(errorMessage);
          setIsLoading(false);
          setCoordinates(null);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }, [isSupported]);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    coordinates,
    isLoading,
    error,
    isSupported,
    getCurrentLocation,
    clearLocation
  };
}
