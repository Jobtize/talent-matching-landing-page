import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Obrigado | Jobtize',
  description: 'Agradecemos pelo seu cadastro na plataforma Jobtize',
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
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
            >
              Acessar Dashboard
            </Link>
            
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

