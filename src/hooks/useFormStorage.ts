'use client'

import { useState, useEffect } from 'react'

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

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const storedData = localStorage.getItem('formData')
    if (storedData) {
      try {
        setFormData(JSON.parse(storedData))
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error)
        localStorage.removeItem('formData')
      }
    }
  }, [])

  // Função para salvar dados do formulário
  const saveFormData = (data: FormStorageData) => {
    setFormData(data)
    localStorage.setItem('formData', JSON.stringify(data))
  }

  // Função para limpar dados do formulário
  const clearFormData = () => {
    setFormData(null)
    localStorage.removeItem('formData')
  }

  return { formData, saveFormData, clearFormData }
}

