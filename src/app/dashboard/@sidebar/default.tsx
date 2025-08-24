import Link from 'next/link'
import { User, Briefcase, Settings, LogOut } from 'lucide-react'

// Função para simular um atraso (apenas para demonstração)
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Função para buscar dados do usuário (simulada)
async function getUserData() {
  // Simular um atraso para demonstrar o Suspense
  await delay(1000)
  
  return {
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    role: 'Desenvolvedor Full Stack',
  }
}

export default async function Sidebar() {
  // Buscar dados do usuário (com Suspense)
  const userData = await getUserData()
  
  return (
    <div className="space-y-6">
      {/* Perfil do usuário */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{userData.name}</h3>
            <p className="text-sm text-gray-500">{userData.role}</p>
          </div>
        </div>
      </div>
      
      {/* Links de navegação */}
      <nav className="space-y-1">
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
        >
          <User className="w-5 h-5" />
          <span>Meu Perfil</span>
        </Link>
        
        <Link 
          href="/dashboard/vagas" 
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
        >
          <Briefcase className="w-5 h-5" />
          <span>Vagas</span>
        </Link>
        
        <Link 
          href="/dashboard/configuracoes" 
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>
      </nav>
      
      {/* Botão de logout */}
      <div className="pt-4 border-t border-gray-200">
        <button 
          className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-md hover:bg-red-50 text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

