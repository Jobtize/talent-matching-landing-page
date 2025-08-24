import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCandidateById } from '@/lib/data/candidates'
import { ProfileSkeleton, ContentSkeleton } from '@/components/ui/skeletons'

// Função para gerar metadata dinâmica baseada no candidato
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  // Buscar dados do candidato
  const candidate = await getCandidateById(params.id)
  
  // Se o candidato não existir, retornar metadata padrão
  if (!candidate) {
    return {
      title: 'Candidato não encontrado | Jobtize',
      description: 'O candidato solicitado não foi encontrado na plataforma Jobtize.'
    }
  }
  
  // Retornar metadata personalizada baseada nos dados do candidato
  return {
    title: `${candidate.nome} | Perfil Jobtize`,
    description: `Perfil profissional de ${candidate.nome} - ${candidate.cargo || 'Profissional'} com experiência em ${candidate.tecnologias.join(', ')}`,
    openGraph: {
      title: `${candidate.nome} | Jobtize`,
      description: `Perfil profissional de ${candidate.nome} - ${candidate.cargo || 'Profissional'} com experiência em ${candidate.tecnologias.join(', ')}`,
      type: 'profile',
      images: [
        {
          url: candidate.profilePicture || 'https://jobtize.com/default-profile.jpg',
          width: 1200,
          height: 630,
          alt: `Foto de perfil de ${candidate.nome}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${candidate.nome} | Jobtize`,
      description: `Perfil profissional de ${candidate.nome} - ${candidate.cargo || 'Profissional'}`,
      images: [candidate.profilePicture || 'https://jobtize.com/default-profile.jpg']
    }
  }
}

// Componente que exibe informações detalhadas do perfil
async function ProfileInfo({ id }: { id: string }) {
  // Buscar dados do candidato
  const candidate = await getCandidateById(id)
  
  // Se o candidato não existir, retornar 404
  if (!candidate) {
    notFound()
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{candidate.nome}</h1>
          <p className="text-lg text-gray-600">{candidate.cargo || 'Profissional'}</p>
          <p className="text-sm text-gray-500">{candidate.localizacao}</p>
        </div>
        
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          {candidate.profilePicture ? (
            <img 
              src={candidate.profilePicture} 
              alt={`Foto de ${candidate.nome}`} 
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Contato</h2>
          <p className="text-gray-700">Email: {candidate.email}</p>
          <p className="text-gray-700">Telefone: {candidate.telefone}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Experiência</h2>
          <p className="text-gray-700">{candidate.experiencia || 'Não informado'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Áreas de Interesse</h2>
          <p className="text-gray-700">{candidate.areas || 'Não informado'}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Tecnologias</h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(candidate.tecnologias) ? (
            candidate.tecnologias.map((tech, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tech}
              </span>
            ))
          ) : (
            <p className="text-gray-700">Não informado</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente que exibe vagas recomendadas
async function RecommendedJobs({ id }: { id: string }) {
  // Simular um atraso para demonstrar o Suspense
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Vagas Recomendadas</h2>
      
      <div className="space-y-4">
        {[1, 2, 3].map((job) => (
          <div key={job} className="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Desenvolvedor Full Stack</h3>
            <p className="text-sm text-gray-600">Empresa Exemplo {job}</p>
            <p className="text-sm text-gray-500 mt-2">São Paulo, SP • Remoto</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">React</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Node.js</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">TypeScript</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Página principal do perfil do candidato
export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileInfo id={params.id} />
      </Suspense>
      
      <Suspense fallback={<ContentSkeleton />}>
        <RecommendedJobs id={params.id} />
      </Suspense>
    </div>
  )
}

