'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jobtize_form_data'

export interface FormStorageData {
  nome: string
  email: string
  telefone?: string
  cargo?: string
  experiencia?: string
  localizacao?: string
  areas?: string
  tecnologias?: string[]
}

export function useFormStorage() {
  const [formData, setFormData] = useState<FormStorageData | null>(null)

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        try {
          setFormData(JSON.parse(storedData))
        } catch (error) {
          console.error('Erro ao carregar dados do formulário:', error)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }, [])

  // Salvar dados no localStorage
  const saveFormData = (data: FormStorageData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setFormData(data)
    }
  }

  // Limpar dados do localStorage
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      setFormData(null)
    }
  }

  return { formData, saveFormData, clearFormData }
}

