import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Jobtize - Deixe as vagas encontrarem você',
    template: '%s | Jobtize'
  },
  description: 'Plataforma inteligente de recrutamento que conecta talentos às melhores oportunidades de carreira.',
  keywords: ['recrutamento', 'vagas', 'emprego', 'carreira', 'talentos', 'tecnologia', 'desenvolvedor', 'programador'],
  authors: [{ name: 'Jobtize', url: 'https://jobtize.com' }],
  creator: 'Jobtize',
  publisher: 'Jobtize',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  metadataBase: new URL('https://jobtize.com'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'Jobtize - Deixe as vagas encontrarem você',
    description: 'Plataforma inteligente de recrutamento que conecta talentos às melhores oportunidades de carreira.',
    url: 'https://jobtize.com',
    siteName: 'Jobtize',
    images: [
      {
        url: 'https://jobtize.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jobtize - Plataforma de recrutamento inteligente',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobtize - Deixe as vagas encontrarem você',
    description: 'Plataforma inteligente de recrutamento que conecta talentos às melhores oportunidades de carreira.',
    images: ['https://jobtize.com/twitter-image.jpg'],
    creator: '@jobtize',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  category: 'technology',
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
