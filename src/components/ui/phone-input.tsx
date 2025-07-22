'use client'

import * as React from "react"
import InputMask from "react-input-mask"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputMask
        mask="(99) 99999-9999"
        maskChar=" "
        {...props}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <input
            {...inputProps}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          />
        )}
      </InputMask>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
