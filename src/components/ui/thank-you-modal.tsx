'use client'

import React, { useState } from 'react'
import { track } from '@vercel/analytics'
import { X, CheckCircle, MessageCircle, UserPlus, Linkedin, Calendar } from 'lucide-react'
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
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventRegistered, setEventRegistered] = useState(false)
  
  if (!isOpen) return null
  
  // Função para criar evento para o usuário
  const createEventForUser = () => {
    setShowEventModal(true)
  }

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
    
    // Criar evento para o usuário
    createEventForUser()
    
    window.open(whatsappUrl, '_blank')
  }

  const handleCompleteRegistration = () => {
    // Tracking do clique em completar cadastro
    track('complete_registration_click', {
      source: 'thank_you_modal'
    })
    
    // Tracking do Google Analytics
    sendEvent('complete_registration_click', {
      source: 'thank_you_modal'
    })
    
    // Criar evento para o usuário
    createEventForUser()
    
    // Redirecionar para a página de cadastro
    router.push('/cadastro')
  }

  const handleLinkedInLogin = () => {
    // Tracking do clique em login com LinkedIn
    track('linkedin_login_click', {
      source: 'thank_you_modal'
    })
    
    // Tracking do Google Analytics
    sendEvent('linkedin_login_click', {
      source: 'thank_you_modal'
    })
    
    // Criar evento para o usuário
    createEventForUser()
    
    // Redirecionar para a autenticação do LinkedIn
    router.push('/api/auth/linkedin')
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
      {showEventModal ? (
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            onClick={() => setShowEventModal(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Event Modal Content */}
          <div className="p-8 text-center">
            {/* Event Icon */}
            <div className="mx-auto mb-6 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 delay-150">
              <Calendar className="w-8 h-8 text-white animate-in zoom-in-50 duration-300 delay-300" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              {eventRegistered ? "Inscrição Confirmada!" : "Evento Exclusivo"}
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-300">
              {eventRegistered 
                ? "Você está inscrito no nosso evento exclusivo! Enviamos os detalhes para seu email." 
                : "Participe do nosso evento exclusivo para profissionais de tecnologia. Vagas limitadas!"}
            </p>

            {!eventRegistered && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Evento:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Data:</span> 15 de Setembro, 2023
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Horário:</span> 19:00 - 21:00
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Local:</span> Online (Zoom)
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">Tema:</span> Tendências de Mercado em Tecnologia
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    // Tracking do evento
                    track('event_registration', {
                      source: 'thank_you_modal',
                      event_name: 'tech_trends_webinar'
                    })
                    
                    // Tracking do Google Analytics
                    sendEvent('event_registration', {
                      source: 'thank_you_modal',
                      event_name: 'tech_trends_webinar'
                    })
                    
                    setEventRegistered(true)
                  }}
                  className={cn(
                    "w-full bg-purple-600 hover:bg-purple-700",
                    "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
                    "shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  )}
                >
                  Inscrever-me no Evento
                </Button>
              </>
            )}

            {eventRegistered && (
              <Button
                onClick={() => setShowEventModal(false)}
                className={cn(
                  "w-full bg-purple-600 hover:bg-purple-700",
                  "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                )}
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      ) : (
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
              Para finalizar e ter acesso às vagas exclusivas, crie sua conta ou faça login com LinkedIn.
            </p>

            {/* Opções de Cadastro/Login */}
            <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-500">
              {/* Botão de Completar Cadastro */}
              <Button
                onClick={handleCompleteRegistration}
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700",
                  "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                )}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Completar Meu Perfil Agora
              </Button>

              {/* Botão de Login com LinkedIn */}
              <Button
                onClick={handleLinkedInLogin}
                className={cn(
                  "w-full bg-[#0077B5] hover:bg-[#006097]",
                  "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                )}
              >
                <Linkedin className="w-5 h-5 mr-2" />
                Continuar com LinkedIn
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
      )}
    </div>
  )
}
