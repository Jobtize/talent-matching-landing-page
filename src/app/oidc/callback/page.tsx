'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LinkedInCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Obter código e estado da URL
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        
        if (!code) {
          setError('Código de autorização não encontrado')
          setIsProcessing(false)
          return
        }
        
        // Redirecionar para o endpoint de callback da API
        const callbackUrl = `/api/auth/linkedin/callback?code=${code}${state ? `&state=${state}` : ''}`
        router.push(callbackUrl)
      } catch (error) {
        console.error('Erro ao processar callback:', error)
        setError('Ocorreu um erro ao processar a autenticação')
        setIsProcessing(false)
      }
    }
    
    processCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Autenticação LinkedIn</h1>
          
          {isProcessing ? (
            <div className="mt-6 flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="mt-4 text-gray-600">Processando autenticação...</p>
            </div>
          ) : error ? (
            <div className="mt-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Voltar para a página inicial
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

