'use client'

import React from 'react'
import { track } from '@vercel/analytics'
import { X, CheckCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThankYouModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  whatsappUrl?: string
  ctaText?: string
}

export function ThankYouModal({
  isOpen,
  onClose,
  title = "Cadastro Recebido!",
  message = "O primeiro passo para sua próxima grande oportunidade de carreira foi dado.",
  whatsappUrl = "https://chat.whatsapp.com/your-community-link",
  ctaText = "Entrar na Comunidade WhatsApp"
}: ThankYouModalProps) {
  if (!isOpen) return null

  const handleWhatsAppClick = () => {
    // Tracking do clique no WhatsApp
    track('whatsapp_click', {
      source: 'thank_you_modal',
      url: whatsappUrl
    })
    
    window.open(whatsappUrl, '_blank')
    onClose()
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
            Para finalizar e ter acesso às vagas exclusivas, que tal fazer parte da nossa comunidade? É rápido e você será o primeiro a saber sobre as oportunidades que combinam com você!
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleWhatsAppClick}
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700",
              "text-white font-semibold py-3 px-6 rounded-md transition-all duration-300",
              "shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
              "animate-in slide-in-from-bottom-4 duration-500 delay-500"
            )}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {ctaText}
          </Button>

          {/* Skip Option */}
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors animate-in slide-in-from-bottom-4 duration-500 delay-600"
          >
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  )
}
