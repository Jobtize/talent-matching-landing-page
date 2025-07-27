import * as React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuggestionItemProps {
  /** Texto principal da sugestão */
  mainText: string;
  /** Texto secundário da sugestão */
  secondaryText: string;
  /** Função chamada quando o item é clicado */
  onClick: () => void;
  /** Classes CSS adicionais */
  className?: string;
  /** Se o item está destacado/selecionado */
  isHighlighted?: boolean;
  /** Ícone customizado (padrão: MapPin) */
  icon?: React.ReactNode;
}

/**
 * Componente para renderizar um item individual de sugestão de localização
 * 
 * @example
 * ```tsx
 * <SuggestionItem
 *   mainText="São Paulo"
 *   secondaryText="São Paulo, SP, Brasil"
 *   onClick={() => handleSelectLocation('place_id_123')}
 *   isHighlighted={selectedIndex === 0}
 * />
 * ```
 */
export const SuggestionItem = React.forwardRef<HTMLDivElement, SuggestionItemProps>(
  ({ 
    mainText, 
    secondaryText, 
    onClick, 
    className, 
    isHighlighted = false,
    icon = <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
  }, ref) => {
    return (
      <div
        ref={ref}
        onMouseDown={(e) => {
          // Prevenir blur do input
          e.preventDefault();
          onClick();
        }}
        className={cn(
          "w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          isHighlighted && "bg-accent text-accent-foreground",
          className
        )}
        role="option"
        aria-selected={isHighlighted}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate" title={mainText}>
            {mainText}
          </div>
          {secondaryText && (
            <div className="text-xs text-muted-foreground truncate" title={secondaryText}>
              {secondaryText}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SuggestionItem.displayName = "SuggestionItem";
