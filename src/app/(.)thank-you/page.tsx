'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ThankYouModal() {
  const router = useRouter()

  // Fechar o modal ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={() => router.back()}
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center relative z-10 animate-fade-in">
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Obrigado pelo seu cadastro!</h1>
        
        <p className="text-gray-600 mb-6">
          Recebemos suas informações e entraremos em contato em breve com oportunidades que correspondam ao seu perfil.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Enquanto isso, você pode completar seu perfil para aumentar suas chances de match.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                router.push('/dashboard')
              }}
            >
              Acessar Dashboard
            </Link>
            
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

