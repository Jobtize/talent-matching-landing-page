'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const formatPhoneNumber = (value: string) => {
      // Remove todos os caracteres não numéricos
      const numbers = value.replace(/\D/g, '')
      
      // Aplica a máscara (99) 99999-9999
      if (numbers.length <= 2) {
        return numbers
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      
      // Cria um novo evento com o valor formatado
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted
        }
      }
      
      if (onChange) {
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>)
      }
    }

    return (
      <input
        {...props}
        ref={ref}
        onChange={handleChange}
        maxLength={15} // (99) 99999-9999
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
