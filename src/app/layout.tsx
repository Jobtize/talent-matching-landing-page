import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
