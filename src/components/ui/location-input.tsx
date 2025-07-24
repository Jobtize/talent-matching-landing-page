'use client'

import * as React from "react"
import { MapPin, Loader2, Navigation, Map } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

const LocationInput = React.forwardRef<HTMLDivElement, LocationInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const [inputValue, setInputValue] = React.useState(value)
    const [suggestions, setSuggestions] = React.useState<PlacePrediction[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showMap, setShowMap] = React.useState(false)
    const [autoShowMap, setAutoShowMap] = React.useState(true) // Controla se deve mostrar automaticamente
    const [selectedLocation, setSelectedLocation] = React.useState<{lat: number, lng: number} | null>(null)
    const [googleMapsLoaded, setGoogleMapsLoaded] = React.useState(false)
    
    const inputRef = React.useRef<HTMLInputElement>(null)
    const mapRef = React.useRef<HTMLDivElement>(null)
    const mapInstance = React.useRef<google.maps.Map | null>(null)

    // Inicializar Google Maps com Places API (New)
    React.useEffect(() => {
      const initGoogleMaps = async () => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        if (!apiKey) {
          console.warn('Google Maps API key not found. Using fallback mode.')
          return
        }

        try {
          // Carregar Google Maps dinamicamente (apenas uma vez)
          if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly`
            script.async = true
            script.defer = true
            
            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve()
              script.onerror = reject
              document.head.appendChild(script)
            })
          }
          
          // Aguardar o Google Maps estar totalmente carregado
          if (window.google && window.google.maps) {
            setGoogleMapsLoaded(true)
          } else {
            // Aguardar um pouco mais se ainda não carregou
            setTimeout(() => {
              if (window.google && window.google.maps) {
                setGoogleMapsLoaded(true)
              }
            }, 1000)
          }
        } catch (error) {
          console.error('Error loading Google Maps:', error)
        }
      }

      initGoogleMaps()
    }, [])

    // Busca de localizações usando Places API (New) apenas
    const searchLocations = React.useCallback(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)

      if (googleMapsLoaded && window.google) {
        try {
          // Usar Places API (New) - Text Search
          const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
          
          const request = {
            textQuery: query,
            fields: ['displayName', 'formattedAddress', 'location', 'id'],
            locationBias: {
              center: { lat: -14.235, lng: -51.9253 }, // Centro do Brasil
              radius: 50000 // 50km (máximo permitido)
            },
            maxResultCount: 8
          }

          // @ts-expect-error - Places API (New) ainda não tem tipos completos
          const { places } = await Place.searchByText(request)

          if (places && places.length > 0) {
            const formattedSuggestions = places.map((place: unknown, index: number) => {
              const p = place as { formattedAddress?: string; displayName?: string; id?: string }
              return {
                description: p.formattedAddress || p.displayName || '',
                place_id: p.id || `place_${index}`,
                structured_formatting: {
                  main_text: p.displayName || '',
                  secondary_text: p.formattedAddress || ''
                }
              }
            })

            setSuggestions(formattedSuggestions)
          } else {
            setSuggestions([])
          }
          
          setIsLoading(false)
        } catch (error) {
          console.error('Error with Places API (New):', error)
          setSuggestions([])
          setIsLoading(false)
        }
      } else {
        // Quando Google Maps não está disponível
        setSuggestions([])
        setIsLoading(false)
      }
    }, [googleMapsLoaded])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowSuggestions(true)
      searchLocations(newValue)
    }

    const handleSuggestionClick = async (suggestion: PlacePrediction) => {
      const selectedText = suggestion.description
      setInputValue(selectedText)
      setShowSuggestions(false)
      setSuggestions([])
      
      // Obter coordenadas usando Places API (New)
      if (googleMapsLoaded && window.google) {
        try {
          const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
          
          const place = new Place({
            id: suggestion.place_id,
            requestedLanguage: 'pt-BR'
          })

          await (place as any).fetchFields({
            fields: ['location', 'formattedAddress']
          })

          if ((place as any).location) {
            const location = {
              lat: (place as any).location.lat(),
              lng: (place as any).location.lng()
            }
            setSelectedLocation(location)
            
            // Inicializar mapa se ainda não foi criado
            if (mapRef.current && !mapInstance.current) {
              initializeMap(location)
            } else if (mapInstance.current) {
              // Atualizar mapa existente
              mapInstance.current.setCenter(location)
              new google.maps.Marker({
                position: location,
                map: mapInstance.current,
                title: selectedText
              })
            }
          }
        } catch (error) {
          console.error('Error getting place details with Places API (New):', error)
        }
      }
      
      onChange(selectedText)
      
      // Foca no input após seleção
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }

    // Inicializar mapa
    const initializeMap = (center: {lat: number, lng: number}) => {
      if (!mapRef.current || !googleMapsLoaded || !window.google?.maps) {
        console.log('Map initialization failed - missing requirements')
        return
      }

      try {
        console.log('Initializing map with center:', center)
        
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
          if (!mapRef.current) {
            console.log('mapRef.current is null, aborting')
            return
          }
          
          // Limpar qualquer instância anterior
          if (mapInstance.current) {
            console.log('Clearing previous map instance')
            mapInstance.current = null
          }
          
          mapInstance.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: selectedLocation ? 13 : 5, // Zoom menor se não há localização específica
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          })

          // Aguardar o mapa carregar antes de adicionar marker
          google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
            console.log('Map loaded successfully')
            
            // Só adicionar marker se há uma localização específica
            if (selectedLocation && mapInstance.current) {
              new google.maps.Marker({
                position: center,
                map: mapInstance.current,
                title: inputValue || 'Localização'
              })
            }
          })
          
          // Timeout de segurança caso o mapa não carregue
          setTimeout(() => {
            if (mapInstance.current) {
              try {
                const currentCenter = mapInstance.current.getCenter()
                if (!currentCenter) {
                  console.log('Map loading timeout, forcing center')
                  mapInstance.current.setCenter(center)
                }
              } catch (e) {
                console.log('Error checking map center, forcing center')
                mapInstance.current.setCenter(center)
              }
            }
          }, 3000)
        }, 200) // Aumentei o timeout para 200ms
        
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    // Obter localização atual
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador')
        return
      }

      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setSelectedLocation(location)
          
          // Usar Places API (New) para encontrar o lugar mais próximo
          if (googleMapsLoaded && window.google && window.google.maps) {
            try {
              // Verificar se importLibrary está disponível
              if (!google.maps.importLibrary) {
                console.error('importLibrary not available. Using fallback.')
                const address = 'Minha localização atual'
                setInputValue(address)
                onChange(address)
                
                if (mapRef.current && !mapInstance.current) {
                  initializeMap(location)
                } else if (mapInstance.current) {
                  mapInstance.current.setCenter(location)
                  new google.maps.Marker({
                    position: location,
                    map: mapInstance.current,
                    title: address
                  })
                }
                setIsLoading(false)
                return
              }

              const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary
              
              // Buscar apenas bairro/região e cidade
              const request = {
                locationRestriction: {
                  center: location,
                  radius: 1000 // 1km de raio para pegar bairro/cidade
                },
                includedTypes: ['locality', 'administrative_area_level_2', 'administrative_area_level_1'],
                maxResultCount: 3, // Pegar mais opções para escolher a melhor
                fields: ['displayName', 'formattedAddress', 'location', 'id', 'types']
              }

              const result = await (Place as any).searchNearby(request)
              console.log('searchNearby result:', result)
              console.log('searchNearby result.places length:', result?.places?.length)
              console.log('searchNearby result details:', JSON.stringify(result, null, 2))

              let address = 'Minha localização atual'

              // A API retorna {places: Array} não um array diretamente
              const places = result?.places
              if (places && Array.isArray(places) && places.length > 0) {
                console.log('Processing places results...')
                
                // Procurar por locality (cidade) e administrative areas
                const locality = places.find((place: any) => {
                  console.log('Checking place types:', place.types, 'for locality')
                  return place.types?.includes('locality')
                })
                const adminLevel2 = places.find((place: any) => {
                  console.log('Checking place types:', place.types, 'for admin_level_2')
                  return place.types?.includes('administrative_area_level_2')
                })
                
                console.log('Found locality:', locality?.displayName)
                console.log('Found adminLevel2:', adminLevel2?.displayName)
                
                if (locality) {
                  // Usar cidade
                  address = locality.displayName
                  console.log('Using locality:', address)
                } else if (adminLevel2) {
                  // Usar área administrativa (região)
                  address = adminLevel2.displayName
                  console.log('Using adminLevel2:', address)
                } else {
                  // Usar o primeiro resultado disponível
                  const firstPlace = places[0] as { formattedAddress?: string; displayName?: string; types?: string[] }
                  address = firstPlace.displayName || firstPlace.formattedAddress || 'Minha localização atual'
                  console.log('Using first place:', address, 'types:', firstPlace.types)
                }
              } else {
                console.log('No places found, using fallback')
              }

              setInputValue(address)
              onChange(address)
              
              if (mapRef.current && !mapInstance.current) {
                initializeMap(location)
              } else if (mapInstance.current) {
                mapInstance.current.setCenter(location)
                new google.maps.Marker({
                  position: location,
                  map: mapInstance.current,
                  title: address
                })
              }
              
              setIsLoading(false)
            } catch (error) {
              console.error('Error with Places API (New) searchNearby:', error)
              // Fallback amigável se a API falhar
              const address = 'Minha localização atual'
              setInputValue(address)
              onChange(address)
              
              if (mapRef.current && !mapInstance.current) {
                initializeMap(location)
              } else if (mapInstance.current) {
                mapInstance.current.setCenter(location)
                new google.maps.Marker({
                  position: location,
                  map: mapInstance.current,
                  title: 'Minha localização'
                })
              }
              
              setIsLoading(false)
            }
          } else {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Erro ao obter localização')
          setIsLoading(false)
        }
      )
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        onChange(inputValue)
        setShowSuggestions(false)
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }

    const handleBlur = () => {
      // Delay para permitir clique nas sugestões
      setTimeout(() => {
        setShowSuggestions(false)
        // Só atualiza se o valor mudou
        if (inputValue !== value) {
          onChange(inputValue)
        }
      }, 200)
    }

    React.useEffect(() => {
      setInputValue(value)
    }, [value])

    // Controlar exibição automática do mapa baseado na localização
    React.useEffect(() => {
      if (autoShowMap) {
        // Mostrar mapa se há localização ou valor no input
        const hasLocation = selectedLocation || (inputValue && inputValue.trim() !== '')
        setShowMap(hasLocation)
      }
    }, [selectedLocation, inputValue, autoShowMap])

    // Inicializar mapa quando showMap for true
    React.useEffect(() => {
      if (showMap && googleMapsLoaded && mapRef.current && !mapInstance.current) {
        console.log('Initializing map from useEffect')
        // Usar localização selecionada ou centro do Brasil como fallback
        const defaultCenter = selectedLocation || { lat: -14.235, lng: -51.9253 }
        initializeMap(defaultCenter)
      }
    }, [showMap, googleMapsLoaded, selectedLocation])

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
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {googleMapsLoaded && (
              <>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Usar localização atual"
                >
                  <Navigation className="w-4 h-4" />
                </button>
                
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (autoShowMap) {
                        // Se está em modo automático, desabilitar e alternar manualmente
                        setAutoShowMap(false)
                        setShowMap(!showMap)
                      } else {
                        // Se está em modo manual, apenas alternar
                        setShowMap(!showMap)
                      }
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
                        const hasLocation = selectedLocation || (inputValue && inputValue.trim() !== '')
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
            
            {isLoading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id || index}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSuggestionClick(suggestion)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showMap && googleMapsLoaded && (
          <div className="mt-2 border border-input rounded-md overflow-hidden">
            <div 
              ref={mapRef} 
              className="w-full h-64"
              style={{ minHeight: '256px' }}
            />
          </div>
        )}

        {!googleMapsLoaded && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            ⚠️ Para usar o autocomplete inteligente e o mapa, configure a chave da API do Google Maps.
          </div>
        )}
      </div>
    )
  }
)

LocationInput.displayName = "LocationInput"

export { LocationInput }
