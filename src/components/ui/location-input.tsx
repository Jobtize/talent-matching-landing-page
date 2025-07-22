'use client'

import * as React from "react"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const LocationInput = React.forwardRef<HTMLDivElement, LocationInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const [inputValue, setInputValue] = React.useState(value)
    const [suggestions, setSuggestions] = React.useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Simulação de busca de endereços (pode ser substituído por API real)
    const searchLocations = React.useCallback(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      
      // Simulação de delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Sugestões simuladas baseadas no input
      const mockSuggestions = [
        `${query}, São Paulo - SP, Brasil`,
        `${query}, Rio de Janeiro - RJ, Brasil`,
        `${query}, Belo Horizonte - MG, Brasil`,
        `${query}, Brasília - DF, Brasil`,
        `${query}, Salvador - BA, Brasil`,
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )

      setSuggestions(mockSuggestions.slice(0, 5))
      setIsLoading(false)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowSuggestions(true)
      searchLocations(newValue)
    }

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion)
      onChange(suggestion)
      setShowSuggestions(false)
      setSuggestions([])
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
        onChange(inputValue)
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

LocationInput.displayName = "LocationInput"

export { LocationInput }

