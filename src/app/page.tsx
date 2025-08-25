import Image from 'next/image'
import Link from 'next/link'
import LoginButton from '@/components/LoginButton'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Verificar se o usuário já está autenticado
  const session = await auth()
  
  // Se estiver autenticado, redirecionar para a página de perfil
  if (session) {
    redirect('/profile')
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          TalentMatch - Conectando talentos e oportunidades
        </p>
      </div>

      <div className="flex flex-col items-center justify-center text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Encontre as melhores oportunidades para seu perfil
        </h1>
        <p className="text-lg md:text-xl mb-8">
          TalentMatch usa inteligência artificial para conectar profissionais com as vagas mais adequadas ao seu perfil e experiência.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <LoginButton className="text-lg py-3 px-8" />
          <Link 
            href="#como-funciona" 
            className="text-lg py-3 px-8 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Saiba mais
          </Link>
        </div>
        
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
          <Image
            src="/images/hero-image.jpg"
            alt="TalentMatch em ação"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>

      <div id="como-funciona" className="mt-16 w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Como funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Crie seu perfil</h3>
            <p className="text-gray-600">
              Conecte sua conta do LinkedIn e importe automaticamente suas experiências e habilidades.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Receba matches</h3>
            <p className="text-gray-600">
              Nossa IA analisa seu perfil e encontra as vagas mais compatíveis com suas habilidades e experiência.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Conecte-se</h3>
            <p className="text-gray-600">
              Candidate-se às vagas com um clique e acompanhe o status das suas candidaturas.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

