import * as React from "react";
import { cn } from "@/lib/utils";
import { SuggestionItem } from "./suggestion-item";

export interface SuggestionData {
  /** ID único da sugestão */
  id: string;
  /** Texto principal da sugestão */
  mainText: string;
  /** Texto secundário da sugestão */
  secondaryText: string;
}

export interface SuggestionsListProps {
  /** Lista de sugestões para exibir */
  suggestions: SuggestionData[];
  /** Função chamada quando uma sugestão é selecionada */
  onSuggestionSelect: (suggestion: SuggestionData) => void;
  /** Se a lista está visível */
  isVisible: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Altura máxima da lista (padrão: max-h-48) */
  maxHeight?: string;
  /** Índice do item destacado para navegação por teclado */
  highlightedIndex?: number;
  /** Mensagem exibida quando não há sugestões */
  emptyMessage?: string;
  /** Se deve mostrar a mensagem de vazio quando não há sugestões */
  showEmptyMessage?: boolean;
}

/**
 * Componente para renderizar uma lista de sugestões de localização
 * 
 * @example
 * ```tsx
 * const suggestions = [
 *   {
 *     id: 'place_1',
 *     mainText: 'São Paulo',
 *     secondaryText: 'São Paulo, SP, Brasil'
 *   },
 *   {
 *     id: 'place_2', 
 *     mainText: 'Rio de Janeiro',
 *     secondaryText: 'Rio de Janeiro, RJ, Brasil'
 *   }
 * ];
 * 
 * <SuggestionsList
 *   suggestions={suggestions}
 *   isVisible={showSuggestions}
 *   onSuggestionSelect={(suggestion) => handleSelect(suggestion)}
 *   highlightedIndex={selectedIndex}
 * />
 * ```
 */
export const SuggestionsList = React.forwardRef<HTMLDivElement, SuggestionsListProps>(
  ({ 
    suggestions, 
    onSuggestionSelect, 
    isVisible, 
    className,
    maxHeight = "max-h-48",
    highlightedIndex = -1,
    emptyMessage = "Nenhuma localização encontrada",
    showEmptyMessage = false
  }, ref) => {
    if (!isVisible) {
      return null;
    }

    const hasSuggestions = suggestions.length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto",
          maxHeight,
          className
        )}
        role="listbox"
        aria-label="Sugestões de localização"
      >
        {hasSuggestions ? (
          suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion.id}
              mainText={suggestion.mainText}
              secondaryText={suggestion.secondaryText}
              onClick={() => onSuggestionSelect(suggestion)}
              isHighlighted={index === highlightedIndex}
            />
          ))
        ) : showEmptyMessage ? (
          <div className="px-3 py-2 text-sm text-gray-500 text-center">
            {emptyMessage}
          </div>
        ) : null}
      </div>
    );
  }
);

SuggestionsList.displayName = "SuggestionsList";

/**
 * Hook para gerenciar navegação por teclado na lista de sugestões
 * 
 * @example
 * ```tsx
 * const { highlightedIndex, handleKeyDown, resetHighlight } = useSuggestionsNavigation({
 *   suggestions,
 *   onSelect: handleSuggestionSelect,
 *   onClose: () => setShowSuggestions(false)
 * });
 * 
 * <input onKeyDown={handleKeyDown} />
 * <SuggestionsList highlightedIndex={highlightedIndex} />
 * ```
 */
export function useSuggestionsNavigation({
  suggestions,
  onSelect,
  onClose
}: {
  suggestions: SuggestionData[];
  onSelect: (suggestion: SuggestionData) => void;
  onClose: () => void;
}) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onSelect(suggestions[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        onClose();
        setHighlightedIndex(-1);
        break;
    }
  }, [suggestions, highlightedIndex, onSelect, onClose]);

  const resetHighlight = React.useCallback(() => {
    setHighlightedIndex(-1);
  }, []);

  // Reset highlight quando as sugestões mudam
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  return {
    highlightedIndex,
    handleKeyDown,
    resetHighlight
  };
}
