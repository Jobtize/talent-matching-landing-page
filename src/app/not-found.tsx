'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Componente que usa useSearchParams dentro de um Suspense
function SearchParamsComponent() {
  const searchParams = useSearchParams()
  const query = searchParams?.toString() ? `?${searchParams.toString()}` : ''
  
  return <p className="text-gray-500 mb-6">URL não encontrada: {query}</p>
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
        
        <Suspense fallback={<p className="text-gray-500 mb-6">Carregando detalhes...</p>}>
          <SearchParamsComponent />
        </Suspense>
        
        <Link 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}

