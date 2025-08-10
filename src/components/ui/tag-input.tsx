'use client'

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"



export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  suggestions?: string[]
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  ({ value = [], onChange, placeholder, className, suggestions = [] }, ref) => {
    const [inputValue, setInputValue] = React.useState("")
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Sugestões padrão de tecnologias populares
    const defaultSuggestions = [
      "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "C#", "PHP",
      "Vue.js", "Angular", "Next.js", "Express", "Django", "Spring Boot", "Laravel",
      "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS",
      "Azure", "Google Cloud", "Git", "GitHub", "GitLab", "Figma", "Adobe XD",
      "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap", "Material-UI", "Ant Design",
      "GraphQL", "REST API", "Microservices", "DevOps", "CI/CD", "Jenkins", "Terraform"
    ]

    const allSuggestions = [...new Set([...defaultSuggestions, ...suggestions])]

    const filteredSuggestions = allSuggestions.filter(
      suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(suggestion) &&
        inputValue.length > 0
    )

    const addTag = (tagText: string) => {
      const trimmedText = tagText.trim()
      if (trimmedText && !value.includes(trimmedText)) {
        onChange([...value, trimmedText])
      }
      setInputValue("")
      setShowSuggestions(false)
    }

    const removeTag = (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (inputValue.trim()) {
          addTag(inputValue.trim())
        }
      } else if (e.key === ",") {
        e.preventDefault()
        if (inputValue.trim()) {
          addTag(inputValue.trim())
        }
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1)
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
        if (inputRef.current) {
          inputRef.current.blur()
        }
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0)
    }

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex flex-wrap gap-2 flex-1">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(index)
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={value.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  addTag(suggestion)
                  // Foca no input após adicionar tag
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
