import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Banco de Talentos: Cadastre seu Currículo para Vagas Exclusivas | TalentMatch',
  description: 'Cansado de procurar emprego? Deixe as melhores vagas encontrarem você. Cadastre seu currículo em nosso banco de talentos e receba convites para vagas exclusivas em tecnologia, finanças e mais. Grátis e confidencial.',
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

