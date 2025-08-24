import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Jobtize',
  description: 'Gerencie seu perfil e veja vagas personalizadas para você',
}

export default function DashboardPage() {
  return (
    <div className="mt-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Atividade Recente</h2>
        
        <div className="space-y-4">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
            <h3 className="font-medium">Perfil atualizado</h3>
            <p className="text-sm text-gray-600">Suas informações de perfil foram atualizadas com sucesso.</p>
            <p className="text-xs text-gray-500 mt-1">Hoje, 10:45</p>
          </div>
          
          <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md">
            <h3 className="font-medium">Match com vaga</h3>
            <p className="text-sm text-gray-600">Seu perfil foi selecionado para a vaga de Desenvolvedor Full Stack.</p>
            <p className="text-xs text-gray-500 mt-1">Ontem, 15:30</p>
          </div>
          
          <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded-r-md">
            <h3 className="font-medium">Cadastro realizado</h3>
            <p className="text-sm text-gray-600">Bem-vindo à plataforma Jobtize! Seu cadastro foi concluído com sucesso.</p>
            <p className="text-xs text-gray-500 mt-1">3 dias atrás</p>
          </div>
        </div>
      </div>
    </div>
  )
}

