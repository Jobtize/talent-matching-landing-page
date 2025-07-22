'use client'

import * as React from "react"
import { MapPin, Loader2, Navigation, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { Loader } from "@googlemaps/js-api-loader"

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
    const [selectedLocation, setSelectedLocation] = React.useState<{lat: number, lng: number} | null>(null)
    const [googleMapsLoaded, setGoogleMapsLoaded] = React.useState(false)
    
    const inputRef = React.useRef<HTMLInputElement>(null)
    const mapRef = React.useRef<HTMLDivElement>(null)
    const autocompleteService = React.useRef<google.maps.places.AutocompleteService | null>(null)
    const placesService = React.useRef<google.maps.places.PlacesService | null>(null)
    const mapInstance = React.useRef<google.maps.Map | null>(null)

    // Inicializar Google Maps
    React.useEffect(() => {
      const initGoogleMaps = async () => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        if (!apiKey) {
          console.warn('Google Maps API key not found. Using fallback mode.')
          return
        }

        try {
          const loader = new Loader({
            apiKey,
            version: "weekly",
            libraries: ["places", "geometry"]
          })

          await loader.load()
          
          // Inicializar serviços
          autocompleteService.current = new google.maps.places.AutocompleteService()
          
          // Criar um div temporário para o PlacesService
          const tempDiv = document.createElement('div')
          placesService.current = new google.maps.places.PlacesService(tempDiv)
          
          setGoogleMapsLoaded(true)
        } catch (error) {
          console.error('Error loading Google Maps:', error)
        }
      }

      initGoogleMaps()
    }, [])

    // Busca de localizações usando Google Places API
    const searchLocations = React.useCallback(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)

      if (googleMapsLoaded && autocompleteService.current) {
        try {
          const request = {
            input: query,
            componentRestrictions: { country: 'br' }, // Restringir ao Brasil
            types: ['(cities)'] // Focar em cidades
          }

          autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions.slice(0, 8))
            } else {
              setSuggestions([])
            }
            setIsLoading(false)
          })
        } catch (error) {
          console.error('Error fetching places:', error)
          setSuggestions([])
          setIsLoading(false)
        }
      } else {
        // Fallback para quando Google Maps não está disponível
        await new Promise(resolve => setTimeout(resolve, 300))
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

    const handleSuggestionClick = (suggestion: PlacePrediction) => {
      const selectedText = suggestion.description
      setInputValue(selectedText)
      setShowSuggestions(false)
      setSuggestions([])
      
      // Obter coordenadas do local selecionado
      if (googleMapsLoaded && placesService.current) {
        const request = {
          placeId: suggestion.place_id,
          fields: ['geometry', 'formatted_address']
        }
        
        placesService.current.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
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
        })
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
      if (!mapRef.current || !googleMapsLoaded) return

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })

      new google.maps.Marker({
        position: center,
        map: mapInstance.current,
        title: inputValue
      })
    }

    // Obter localização atual
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador')
        return
      }

      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setSelectedLocation(location)
          
          // Reverse geocoding para obter o endereço
          if (googleMapsLoaded) {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                const address = results[0].formatted_address
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
              }
              setIsLoading(false)
            })
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Mostrar/ocultar mapa"
                >
                  <Map className="w-4 h-4" />
                </button>
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

        {showMap && selectedLocation && googleMapsLoaded && (
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
