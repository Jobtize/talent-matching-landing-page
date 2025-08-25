'use client'

import React from 'react'
import { track } from '@vercel/analytics'
import { X, CheckCircle, MessageCircle, Linkedin } from 'lucide-react'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FormStorageData } from '@/hooks/useFormStorage'

interface ThankYouModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  whatsappUrl?: string
  ctaText?: string
  formData?: FormStorageData
}

export function ThankYouModal({
  isOpen,
  onClose,
  title = "Cadastro Recebido!",
  message = "O primeiro passo para sua próxima grande oportunidade de carreira foi dado.",
  whatsappUrl = "https://chat.whatsapp.com/your-community-link",
  ctaText = "Entrar na Comunidade WhatsApp",
  formData
}: ThankYouModalProps) {
  // Hook do Google Analytics
  const { sendEvent } = useGoogleAnalytics()
  const router = useRouter()
  
  // Efeito para disparar o evento de visualização do modal quando ele é aberto
  React.useEffect(() => {
    if (isOpen) {
      // Enviar evento para o Google Analytics quando o modal for aberto
      sendEvent('thank_you_modal_view', {
        source: 'landing_page',
        form_submitted: true,
        user_type: 'lead'
      })
      
      console.log('Evento GA4 disparado: thank_you_modal_view')
    }
  }, [isOpen, sendEvent])
  
  if (!isOpen) return null

  const handleWhatsAppClick = () => {
    // Tracking do clique no WhatsApp (Vercel Analytics)
    track('whatsapp_click', {
      source: 'thank_you_modal',
      url: whatsappUrl
    })
    
    // Tracking do clique no WhatsApp (Google Analytics)
    sendEvent('whatsapp_click', {
      source: 'thank_you_modal',
      url: whatsappUrl
    })
    
    // Abrir o WhatsApp
    
    window.open(whatsappUrl, '_blank')
  }

  // Função removida: handleCompleteRegistration

  const handleLinkedInLogin = async () => {
    // Tracking do clique em login com LinkedIn
    track('linkedin_login_click', {
      source: 'thank_you_modal'
    })
    
    // Tracking do Google Analytics
    sendEvent('linkedin_login_click', {
      source: 'thank_you_modal'
    })
    
    try {
      // Usar signIn do NextAuth com redirecionamento forçado para /profile
      const { signIn } = await import('next-auth/react')
      
      // Usar redirecionamento forçado para /profile
      window.sessionStorage.setItem('nextauth_callback', '/profile')
      
      // Chamar signIn com redirecionamento
      await signIn('linkedin', { 
        callbackUrl: '/profile',
        redirect: true
      })
    } catch (error) {
      console.error('Erro ao fazer login com LinkedIn:', error)
      // Fallback para redirecionamento direto em caso de erro
      window.location.href = '/api/auth/linkedin'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 delay-150">
              <CheckCircle className="w-8 h-8 text-white animate-in zoom-in-50 duration-300 delay-300" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-2 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-300">
              {message}
            </p>

            <p className="text-sm text-gray-500 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-400">
              Para finalizar e ter acesso às vagas exclusivas, faça login com LinkedIn.
            </p>

            {/* Opções de Login */}
            <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-500">
              {/* Botão de Login com LinkedIn */}
              <Button
                onClick={handleLinkedInLogin}
                className={cn(
                  "w-full bg-[#0A66C2] hover:bg-[#0A59AB]",
                  "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
                  "shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                )}
              >
                <Linkedin className="w-5 h-5" />
                <span>Continuar com LinkedIn</span>
              </Button>
            </div>

            {/* Opção de WhatsApp */}
            <div className="pt-4 border-t border-gray-200 animate-in slide-in-from-bottom-4 duration-500 delay-600">
              <p className="text-sm text-gray-500 mb-4">
                Ou entre em nossa comunidade para receber atualizações:
              </p>
              <Button
                onClick={handleWhatsAppClick}
                variant="outline"
                className={cn(
                  "w-full border-green-500 text-green-600 hover:bg-green-50",
                  "font-semibold py-3 px-6 rounded-md transition-all duration-300"
                )}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {ctaText}
              </Button>
            </div>

            {/* Skip Option */}
            <button
              onClick={onClose}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors animate-in slide-in-from-bottom-4 duration-500 delay-700"
            >
              Pular por agora
            </button>
          </div>
        </div>
    </div>
  )
}
