'use client'

import { useCallback } from 'react'

type EventParams = {
  [key: string]: string | number | boolean
}

/**
 * Hook para facilitar o uso do Google Analytics
 * @returns Funções para interagir com o Google Analytics
 */
export function useGoogleAnalytics() {
  /**
   * Envia um evento personalizado para o Google Analytics
   * @param eventName Nome do evento
   * @param params Parâmetros adicionais do evento
   */
  const sendEvent = useCallback((eventName: string, params?: EventParams) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', eventName, params)
    
    // Também envia para o Vercel Analytics se disponível
    if (typeof window !== 'undefined' && window.va) {
      try {
        // @ts-ignore - Vercel Analytics não tem tipagem oficial
        window.va.track(eventName, params)
      } catch (error) {
        console.error('Erro ao enviar evento para Vercel Analytics:', error)
      }
    }
  }, [])

  return { sendEvent }
}

// Adicione tipagem para o Vercel Analytics
declare global {
  interface Window {
    va?: {
      track: (eventName: string, params?: EventParams) => void
    }
    gtag: (command: string, ...args: any[]) => void
  }
}

