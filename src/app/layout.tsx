import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jobtize - Deixe as vagas encontrarem você',
  description: 'Plataforma inteligente de recrutamento que conecta talentos às melhores oportunidades de carreira.',
  keywords: 'recrutamento, vagas, emprego, carreira, talentos',
  authors: [{ name: 'Jobtize' }],
  openGraph: {
    title: 'Jobtize - Deixe as vagas encontrarem você',
    description: 'Plataforma inteligente de recrutamento que conecta talentos às melhores oportunidades de carreira.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Adicione seu ID de medição do Google Analytics abaixo */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
