'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { JobtizeLogo } from '@/components/ui/jobtize-logo'
import { Briefcase, User, Settings, LogOut, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  skills: string[]
  postedAt: string
  logo: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simular carregamento de recomendações de vagas
    const fetchRecommendations = async () => {
      setIsLoading(true)
      
      // Aqui você implementaria a chamada real à API
      // const response = await fetch('/api/jobs/recommendations')
      // const data = await response.json()
      
      // Simular dados de recomendações
      const mockRecommendations: JobRecommendation[] = [
        {
          id: 'job1',
          title: 'Desenvolvedor Frontend React',
          company: 'TechCorp',
          location: 'São Paulo, SP',
          salary: 'R$ 8.000 - R$ 12.000',
          description: 'Estamos procurando um desenvolvedor React experiente para trabalhar em projetos inovadores...',
          skills: ['React', 'TypeScript', 'Tailwind CSS'],
          postedAt: '2023-08-15T14:30:00Z',
          logo: 'https://via.placeholder.com/40',
        },
        {
          id: 'job2',
          title: 'Engenheiro de Software Backend',
          company: 'Inovação Digital',
          location: 'Remoto',
          salary: 'R$ 10.000 - R$ 15.000',
          description: 'Desenvolvedor backend para trabalhar com Node.js, Express e MongoDB...',
          skills: ['Node.js', 'Express', 'MongoDB'],
          postedAt: '2023-08-14T10:15:00Z',
          logo: 'https://via.placeholder.com/40',
        },
        {
          id: 'job3',
          title: 'Desenvolvedor Full Stack',
          company: 'Startup XYZ',
          location: 'Florianópolis, SC',
          salary: 'R$ 9.000 - R$ 13.000',
          description: 'Procuramos um desenvolvedor full stack para trabalhar em todas as camadas da aplicação...',
          skills: ['React', 'Node.js', 'PostgreSQL'],
          postedAt: '2023-08-13T16:45:00Z',
          logo: 'https://via.placeholder.com/40',
        },
      ]
      
      // Simular delay de rede
      setTimeout(() => {
        setRecommendations(mockRecommendations)
        setIsLoading(false)
      }, 1000)
    }
    
    fetchRecommendations()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <JobtizeLogo width={32} height={32} />
              <span className="ml-2 text-xl font-bold text-gray-900">Jobtize</span>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar vagas..."
                  className="pl-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.name || 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <nav className="mt-2">
                <a
                  href="/dashboard"
                  className="flex items-center px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50"
                >
                  <Briefcase className="mr-3 h-5 w-5" />
                  Vagas
                </a>
                <a
                  href="/dashboard/perfil"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <User className="mr-3 h-5 w-5" />
                  Meu Perfil
                </a>
                <a
                  href="/dashboard/configuracoes"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Configurações
                </a>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {user?.name?.split(' ')[0] || 'Profissional'}!</h1>
              <p className="mt-1 text-gray-600">
                Encontramos algumas vagas que combinam com o seu perfil. Confira abaixo!
              </p>
            </div>
            
            {/* Job Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vagas Recomendadas</h2>
              
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Carregando recomendações...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <img
                          src={job.logo}
                          alt={`${job.company} logo`}
                          className="h-10 w-10 rounded-md mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.company} • {job.location}</p>
                          <p className="text-gray-700 mt-2">{job.salary}</p>
                          <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Publicada {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                            </span>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Button variant="outline" className="text-blue-600 border-blue-600">
                  Ver Mais Vagas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

