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

    // Base de dados de cidades brasileiras (simulação mais realista)
    const brazilianCities = React.useMemo(() => [
      // Capitais
      'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Salvador - BA',
      'Fortaleza - CE', 'Brasília - DF', 'Curitiba - PR', 'Recife - PE', 'Porto Alegre - RS',
      'Manaus - AM', 'Belém - PA', 'Goiânia - GO', 'Guarulhos - SP', 'Campinas - SP',
      'São Luís - MA', 'São Gonçalo - RJ', 'Maceió - AL', 'Duque de Caxias - RJ',
      'Natal - RN', 'Teresina - PI', 'Campo Grande - MS', 'Nova Iguaçu - RJ',
      'São Bernardo do Campo - SP', 'João Pessoa - PB', 'Santo André - SP',
      
      // Cidades do interior populares
      'Ribeirão Preto - SP', 'Sorocaba - SP', 'Santos - SP', 'Osasco - SP',
      'São José dos Campos - SP', 'Jundiaí - SP', 'Piracicaba - SP', 'Bauru - SP',
      'Franca - SP', 'Limeira - SP', 'Suzano - SP', 'Taubaté - SP', 'Carapicuíba - SP',
      'Volta Redonda - RJ', 'Magé - RJ', 'Itaboraí - RJ', 'Nova Friburgo - RJ',
      'Barra Mansa - RJ', 'Angra dos Reis - RJ', 'Resende - RJ',
      'Juiz de Fora - MG', 'Uberlândia - MG', 'Contagem - MG', 'Montes Claros - MG',
      'Betim - MG', 'Uberaba - MG', 'Governador Valadares - MG', 'Ipatinga - MG',
      'Londrina - PR', 'Maringá - PR', 'Ponta Grossa - PR', 'Cascavel - PR',
      'São José dos Pinhais - PR', 'Foz do Iguaçu - PR', 'Colombo - PR',
      'Caxias do Sul - RS', 'Pelotas - RS', 'Canoas - RS', 'Santa Maria - RS',
      'Gravataí - RS', 'Viamão - RS', 'Novo Hamburgo - RS', 'São Leopoldo - RS',
      'Joinville - SC', 'Florianópolis - SC', 'Blumenau - SC', 'São José - SC',
      'Criciúma - SC', 'Chapecó - SC', 'Itajaí - SC', 'Jaraguá do Sul - SC',
      'Feira de Santana - BA', 'Vitória da Conquista - BA', 'Camaçari - BA',
      'Itabuna - BA', 'Juazeiro - BA', 'Lauro de Freitas - BA', 'Ilhéus - BA',
      'Jequié - BA', 'Teixeira de Freitas - BA', 'Alagoinhas - BA',
      'Caucaia - CE', 'Juazeiro do Norte - CE', 'Maracanaú - CE', 'Sobral - CE',
      'Crato - CE', 'Itapipoca - CE', 'Maranguape - CE', 'Iguatu - CE',
      'Jaboatão dos Guararapes - PE', 'Olinda - PE', 'Caruaru - PE', 'Petrolina - PE',
      'Paulista - PE', 'Cabo de Santo Agostinho - PE', 'Camaragibe - PE',
      'Aparecida de Goiânia - GO', 'Anápolis - GO', 'Rio Verde - GO', 'Luziânia - GO',
      'Águas Lindas de Goiás - GO', 'Valparaíso de Goiás - GO', 'Trindade - GO'
    ], [])

    // Simulação de busca de endereços mais realista
    const searchLocations = React.useCallback(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      
      // Simulação de delay de API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Busca inteligente baseada no input do usuário
      const filteredCities = brazilianCities.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      )

      // Se não encontrou nenhuma cidade, sugere algumas opções genéricas
      const suggestions = filteredCities.length > 0 
        ? filteredCities.slice(0, 8)
        : [
            `${query} - SP, Brasil`,
            `${query} - RJ, Brasil`,
            `${query} - MG, Brasil`,
            `${query} - PR, Brasil`,
            `${query} - RS, Brasil`
          ]

      setSuggestions(suggestions)
      setIsLoading(false)
    }, [brazilianCities])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowSuggestions(true)
      searchLocations(newValue)
    }

    const handleSuggestionClick = (suggestion: string) => {
      console.log('Suggestion clicked:', suggestion) // Debug
      setInputValue(suggestion)
      setShowSuggestions(false)
      setSuggestions([])
      
      // Chama onChange após um pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        onChange(suggestion)
        console.log('onChange called with:', suggestion) // Debug
      }, 0)
      
      // Foca no input após seleção
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault() // Previne o blur do input
                  handleSuggestionClick(suggestion)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

LocationInput.displayName = "LocationInput"

export { LocationInput }
