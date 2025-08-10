'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const formatPhoneNumber = (inputValue: string) => {
      // Remove todos os caracteres não numéricos
      const numbers = inputValue.replace(/\D/g, '')
      
      // Limita a 11 dígitos (DDD + 9 dígitos)
      const limitedNumbers = numbers.slice(0, 11)
      
      // Aplica a máscara (99) 99999-9999
      if (limitedNumbers.length <= 2) {
        return limitedNumbers
      } else if (limitedNumbers.length <= 7) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
      } else {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const formatted = formatPhoneNumber(rawValue)
      
      // Cria um novo evento com o valor formatado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted,
          name: props.name || ''
        }
      } as React.ChangeEvent<HTMLInputElement>
      
      if (onChange) {
        onChange(syntheticEvent)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite: backspace, delete, tab, escape, enter, home, end, left, right
      if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
          // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return
      }
      // Permite apenas números (0-9)
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    }

    return (
      <input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={15} // (99) 99999-9999
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
