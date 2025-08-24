import { Suspense } from 'react'
import { getAllCandidates } from '@/lib/data/candidates'
import { CandidatesListSkeleton } from '@/components/ui/skeletons'

// Função para simular um atraso (apenas para demonstração)
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Componente que busca e exibe estatísticas
async function DashboardStats() {
  // Simular um atraso para demonstrar o Suspense
  await delay(1500)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Total de Candidatos</h3>
        <p className="text-2xl font-bold">1,234</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Vagas Disponíveis</h3>
        <p className="text-2xl font-bold">56</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Matches Realizados</h3>
        <p className="text-2xl font-bold">89</p>
      </div>
    </div>
  )
}

// Componente que busca e exibe candidatos recentes
async function RecentCandidates() {
  // Buscar candidatos usando a função cacheada
  const candidates = await getAllCandidates(5)
  
  // Simular um atraso para demonstrar o Suspense
  await delay(2000)
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Candidatos Recentes</h2>
      
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
            <div>
              <h3 className="font-medium">{candidate.nome}</h3>
              <p className="text-sm text-gray-500">{candidate.cargo}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardMainContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Estatísticas com Suspense */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>
      
      {/* Candidatos recentes com Suspense */}
      <Suspense fallback={<CandidatesListSkeleton />}>
        <RecentCandidates />
      </Suspense>
    </div>
  )
}

