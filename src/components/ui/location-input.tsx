'use client'

import * as React from "react"
import { MapPin, Loader2, Navigation, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useLocationSearch } from "@/hooks/useLocationSearch"
import { useMapIntegration } from "@/hooks/useMapIntegration"
import { SuggestionsList, useSuggestionsNavigation, type SuggestionData } from "./suggestions-list"
import { validateGoogleMapsApiKey } from "@/lib/env-validation"

export interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Interfaces para tipos do Google Maps (mantidas para compatibilidade)
interface GooglePlaceResult {
  types?: string[]
  displayName?: string
  formattedAddress?: string
}

interface SearchNearbyResult {
  places?: GooglePlaceResult[]
}

// Coordenadas do centro de São Paulo (Praça da Sé)
const SAO_PAULO_CENTER = { lat: -23.5505, lng: -46.6333 }

const LocationInput = React.forwardRef<HTMLDivElement, LocationInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    // Estados locais
    const [inputValue, setInputValue] = React.useState(value)
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [showMap, setShowMap] = React.useState(false)
    const [autoShowMap, setAutoShowMap] = React.useState(true)
    const [selectedLocation, setSelectedLocation] = React.useState<{lat: number, lng: number} | null>(null)
    const [lastMapLocation, setLastMapLocation] = React.useState<{lat: number, lng: number} | null>(null)
    
    // Refs
    const inputRef = React.useRef<HTMLInputElement>(null)
    const mapRef = React.useRef<HTMLDivElement>(null)

    // Validação da API key
    const googleMapsValidation = React.useMemo(() => validateGoogleMapsApiKey(), [])
    
    // Custom hooks
    const geolocation = useGeolocation()
    const locationSearch = useLocationSearch({
      debounceMs: 300,
      maxResults: 8
    })
    const mapIntegration = useMapIntegration({
      apiKey: googleMapsValidation.apiKey
    })

    // Converter sugestões para o formato esperado pelo SuggestionsList
    const suggestionData: SuggestionData[] = React.useMemo(() => 
      locationSearch.suggestions.map(suggestion => ({
        id: suggestion.place_id,
        mainText: suggestion.structured_formatting.main_text,
        secondaryText: suggestion.structured_formatting.secondary_text
      })), [locationSearch.suggestions]
    )

    // Função para lidar com seleção de sugestão
    const handleSuggestionSelect = React.useCallback(async (suggestion: SuggestionData) => {
      const selectedText = suggestion.mainText + (suggestion.secondaryText ? `, ${suggestion.secondaryText}` : '')
      setInputValue(selectedText)
      setShowSuggestions(false)
      onChange(selectedText)
      
      // Obter detalhes do local usando o hook de busca
      const placeDetails = await locationSearch.getPlaceDetails(suggestion.id)
      
      if (placeDetails) {
        setSelectedLocation(placeDetails.location)
        
        // Abrir mapa automaticamente se estiver em modo automático
        if (autoShowMap) {
          setShowMap(true)
        }
        
        // Inicializar ou atualizar mapa
        if (mapRef.current) {
          if (!mapIntegration.mapInstance) {
            await mapIntegration.initializeMap(mapRef.current, placeDetails.location)
          } else {
            mapIntegration.centerMap(placeDetails.location)
          }
          mapIntegration.addMarker(placeDetails.location, selectedText)
        }
      }
      
      // Focar no input após seleção
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }, [locationSearch, onChange, autoShowMap, mapIntegration])

    // Hook para navegação por teclado
    const suggestionsNavigation = useSuggestionsNavigation({
      suggestions: suggestionData,
      onSelect: handleSuggestionSelect,
      onClose: () => setShowSuggestions(false)
    })

    // Função para verificar se há localização válida
    const hasValidLocation = React.useCallback(() => {
      return Boolean(
        selectedLocation || 
        (inputValue && inputValue.trim() !== '' && inputValue !== placeholder)
      )
    }, [selectedLocation, inputValue, placeholder])

    // Debug: log da chave da API (apenas primeiros caracteres por segurança)
    React.useEffect(() => {
      if (googleMapsValidation.isValid) {
        console.log('🗺️ Google Maps API Key status:', {
          hasKey: true,
          keyPreview: `${googleMapsValidation.apiKey!.substring(0, 10)}...`,
          nodeEnv: process.env.NODE_ENV,
          buildTime: 'Rebuild triggered to include environment variables'
        });
      } else {
        console.log('🗺️ Google Maps API Key status:', {
          hasKey: false,
          error: googleMapsValidation.error,
          nodeEnv: process.env.NODE_ENV
        });
      }
    }, [googleMapsValidation])

    // Sincronizar valor do input com prop value
    React.useEffect(() => {
      setInputValue(value)
    }, [value])

    // Gerenciar mapa: inicialização e atualizações de localização
    React.useEffect(() => {
      const initializeMap = async () => {
        if (showMap && mapRef.current && mapIntegration.isLoaded) {
          console.log('🗺️ === INICIANDO MAPA ===')
          console.log('🗺️ MapRef atual:', mapRef.current)
          console.log('🗺️ MapIntegration isLoaded:', mapIntegration.isLoaded)
          console.log('🗺️ MapInstance existe:', !!mapIntegration.mapInstance)
          console.log('🗺️ SelectedLocation:', selectedLocation)
          console.log('🗺️ LastMapLocation:', lastMapLocation)
          
          try {
            // SEMPRE recriar o mapa quando o elemento DOM for recriado
            console.log('🗺️ Limpando instância anterior e criando nova...')
            mapIntegration.clearMap()
            
            // Determinar qual localização usar
            let locationToUse = selectedLocation || SAO_PAULO_CENTER
            let markerTitle = selectedLocation?.address || 'São Paulo - SP, Brasil'
            
            console.log('🗺️ Localização escolhida:', locationToUse)
            console.log('🗺️ Título do marcador:', markerTitle)
            
            // Inicializar mapa
            await mapIntegration.initializeMap(mapRef.current, locationToUse)
            
            // Atualizar última localização
            setLastMapLocation(locationToUse)
            
            // Aguardar e adicionar marcador
            setTimeout(() => {
              console.log('📍 === ADICIONANDO MARCADOR ===')
              console.log('📍 Posição:', locationToUse)
              console.log('📍 Título:', markerTitle)
              console.log('📍 MapInstance existe:', !!mapIntegration.mapInstance)
              console.log('📍 Google Maps disponível:', !!window.google)
              
              mapIntegration.addMarker(locationToUse, markerTitle)
              console.log('📍 Marcador adicionado!')
            }, 200) // Aumentar timeout para garantir que o mapa esteja pronto
            
            console.log('🗺️ Mapa inicializado com sucesso!')
          } catch (error) {
            console.error('❌ Error initializing map:', error)
          }
        }
      }

      initializeMap()
    }, [showMap, mapIntegration.isLoaded, selectedLocation]) // Incluir selectedLocation nas dependências

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange(newValue)
      
      // Se o campo foi limpo, resetar tudo
      if (newValue.trim() === '') {
        console.log('Input cleared, resetting location and closing map')
        setSelectedLocation(null)
        mapIntegration.clearMarker()
        setShowMap(false)
        locationSearch.clearSuggestions()
        setShowSuggestions(false)
        return
      }
      
      // Mostrar sugestões e buscar localizações
      setShowSuggestions(true)
      locationSearch.searchLocations(newValue)
    }, [onChange, mapIntegration, locationSearch])





    // Obter localização atual usando o hook
    const handleGetCurrentLocation = React.useCallback(async () => {
      try {
        await geolocation.getCurrentLocation()
        
        if (geolocation.coordinates) {
          setSelectedLocation(geolocation.coordinates)
          
          // Tentar obter endereço próximo usando Places API
          if (locationSearch.isGoogleMapsReady && window.google) {
            try {
              const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
              
              const request = {
                locationRestriction: {
                  center: geolocation.coordinates,
                  radius: 5000 // 5km de raio
                },
                includedTypes: ['locality', 'administrative_area_level_2', 'administrative_area_level_1', 'country'],
                maxResultCount: 10,
                fields: ['displayName', 'formattedAddress', 'location', 'id', 'types']
              }

              const result = await (Place as unknown as { 
                searchNearby: (request: unknown) => Promise<SearchNearbyResult> 
              }).searchNearby(request)

              let address = 'Minha localização atual'
              const places = result?.places

              if (places && Array.isArray(places) && places.length > 0) {
                // Procurar por diferentes tipos de localização
                const locality = places.find((place: GooglePlaceResult) => 
                  place.types?.includes('locality')
                )
                const adminLevel1 = places.find((place: GooglePlaceResult) => 
                  place.types?.includes('administrative_area_level_1')
                )
                const adminLevel2 = places.find((place: GooglePlaceResult) => 
                  place.types?.includes('administrative_area_level_2')
                )
                const country = places.find((place: GooglePlaceResult) => 
                  place.types?.includes('country')
                )
                
                // Montar endereço no formato "Cidade, Estado, País"
                const addressParts = []
                
                if (locality) {
                  addressParts.push(locality.displayName)
                } else if (adminLevel2) {
                  addressParts.push(adminLevel2.displayName)
                }
                
                if (adminLevel1) {
                  addressParts.push(adminLevel1.displayName)
                }
                
                if (country) {
                  addressParts.push(country.displayName)
                }
                
                if (addressParts.length > 0) {
                  address = addressParts.join(', ')
                } else {
                  // Usar o primeiro resultado disponível como fallback
                  const firstPlace = places[0] as { formattedAddress?: string; displayName?: string }
                  address = firstPlace.displayName || firstPlace.formattedAddress || 'Minha localização atual'
                }
              }

              setInputValue(address)
              onChange(address)
            } catch (error) {
              console.error('Error with Places API searchNearby:', error)
              const address = 'Minha localização atual'
              setInputValue(address)
              onChange(address)
            }
          } else {
            const address = 'Minha localização atual'
            setInputValue(address)
            onChange(address)
          }
          
          // Abrir mapa automaticamente se estiver em modo automático
          if (autoShowMap) {
            setShowMap(true)
          }
          
          // Inicializar ou atualizar mapa
          if (mapRef.current) {
            if (!mapIntegration.mapInstance) {
              await mapIntegration.initializeMap(mapRef.current, geolocation.coordinates)
            } else {
              mapIntegration.centerMap(geolocation.coordinates)
            }
            mapIntegration.addMarker(geolocation.coordinates, 'Minha localização')
          }
        }
      } catch (error) {
        console.error('Error getting location:', error)
        alert(geolocation.error || 'Erro ao obter localização')
      }
    }, [geolocation, locationSearch.isGoogleMapsReady, onChange, autoShowMap, mapIntegration])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      // Usar navegação por teclado do hook
      suggestionsNavigation.handleKeyDown(e)
      
      // Manter comportamento original para Enter quando não há sugestões
      if (e.key === "Enter" && suggestionData.length === 0) {
        e.preventDefault()
        onChange(inputValue)
        setShowSuggestions(false)
      }
    }, [suggestionsNavigation, suggestionData.length, onChange, inputValue])

    const handleBlur = React.useCallback(() => {
      // Delay para permitir clique nas sugestões
      setTimeout(() => {
        setShowSuggestions(false)
        suggestionsNavigation.resetHighlight()
        // Só atualiza se o valor mudou
        if (inputValue !== value) {
          onChange(inputValue)
        }
      }, 200)
    }, [suggestionsNavigation, inputValue, value, onChange])

    // Controlar exibição automática do mapa baseado na localização
    React.useEffect(() => {
      if (autoShowMap) {
        // Só mostrar mapa automaticamente se há localização válida
        const hasLocation = hasValidLocation()
        console.log('Auto map control:', { hasLocation, selectedLocation, inputValue, autoShowMap })
        setShowMap(hasLocation)
      }
    }, [selectedLocation, inputValue, autoShowMap, hasValidLocation])

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestionData.length > 0)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {mapIntegration.isLoaded && (
              <>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={geolocation.isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Usar localização atual"
                >
                  <Navigation className="w-4 h-4" />
                </button>
                
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={async () => {
                      console.log('🔘 Botão do mapa clicado!')
                      console.log('🔘 Estado atual - showMap:', showMap, 'autoShowMap:', autoShowMap)
                      console.log('🔘 hasValidLocation():', hasValidLocation())
                      console.log('🔘 mapRef.current:', !!mapRef.current)
                      
                      if (autoShowMap) {
                        // Se está em modo automático, desabilitar e alternar manualmente
                        setAutoShowMap(false)
                        setShowMap(!showMap)
                      } else {
                        // Se está em modo manual, apenas alternar
                        setShowMap(!showMap)
                      }
                      
                      console.log('🔘 Após alternar - showMap será:', !showMap)
                      console.log('🔘 Inicialização será feita via useEffect quando mapa for renderizado')
                    }}
                    className={`p-1 transition-colors ${
                      showMap 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={
                      autoShowMap 
                        ? "Mapa automático (clique para controle manual)" 
                        : showMap 
                          ? "Ocultar mapa" 
                          : "Mostrar mapa"
                    }
                  >
                    <Map className="w-4 h-4" />
                  </button>
                  
                  {!autoShowMap && (
                    <button
                      type="button"
                      onClick={() => {
                        setAutoShowMap(true)
                        // Reativar comportamento automático
                        const hasLocation = hasValidLocation()
                        setShowMap(hasLocation)
                      }}
                      className="p-1 text-xs text-gray-400 hover:text-blue-600 transition-colors ml-1"
                      title="Reativar mapa automático"
                    >
                      🔄
                    </button>
                  )}
                </div>
              </>
            )}
            
            {(geolocation.isLoading || locationSearch.isLoading) && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        <SuggestionsList
          suggestions={suggestionData}
          isVisible={showSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
          highlightedIndex={suggestionsNavigation.highlightedIndex}
          showEmptyMessage={locationSearch.isLoading}
          emptyMessage={locationSearch.isLoading ? "Buscando..." : "Nenhuma localização encontrada"}
        />

        {showMap && mapIntegration.isLoaded && (
          <div className="mt-2 border border-input rounded-md overflow-hidden">
            <div 
              ref={mapRef} 
              className="w-full h-64"
              style={{ minHeight: '256px' }}
            />
          </div>
        )}

        {!googleMapsValidation.isValid && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            ⚠️ {googleMapsValidation.error || 'Para usar o autocomplete inteligente e o mapa, configure a chave da API do Google Maps.'}
          </div>
        )}

        {mapIntegration.error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            ❌ Erro ao carregar o mapa: {mapIntegration.error}
          </div>
        )}

        {geolocation.error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            ❌ Erro de geolocalização: {geolocation.error}
          </div>
        )}
      </div>
    )
  }
)

LocationInput.displayName = "LocationInput"

export { LocationInput }
