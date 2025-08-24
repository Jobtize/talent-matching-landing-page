'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

// Tipos
interface ProfileData {
  name: string
  jobTitle: string
  about: string
  jobSearch: {
    title: string
    location: string
    contractType: string
    workMode: string
    salary: string
  }
  skills: string[]
  experiences: {
    title: string
    company: string
    period: string
    description: string
    technologies: string[]
  }[]
  education: {
    degree: string
    institution: string
    period: string
  }[]
  languages: {
    language: string
    level: string
  }[]
}

export default function ProfilePage() {
  const [clientReady, setClientReady] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [profileCompletion, setProfileCompletion] = useState(75)
  const [activeTab, setActiveTab] = useState('sobre')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    jobTitle: '',
    about: '',
    jobSearch: {
      title: '',
      location: '',
      contractType: '',
      workMode: '',
      salary: ''
    },
    skills: [],
    experiences: [],
    education: [],
    languages: []
  })

  // Verificar se estamos no cliente
  useEffect(() => {
    setClientReady(true)
    console.log('Página de perfil montada no cliente')
    
    // Verificar dados de autenticação no localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token')
      const userDataStr = localStorage.getItem('user_data')
      
      console.log('Dados encontrados no localStorage:', {
        token: storedToken ? 'presente' : 'ausente',
        userData: userDataStr ? 'presente' : 'ausente'
      })
    }
  }, [])

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (clientReady && !isLoading && !isAuthenticated) {
      console.log('Não autenticado, redirecionando para a página inicial')
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }, [clientReady, isLoading, isAuthenticated])

  // Preencher dados do perfil com informações do LinkedIn quando disponíveis
  useEffect(() => {
    if (user) {
      setProfileData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        // Outros campos que podem vir do LinkedIn
      }))
    }
  }, [user])

  // Função para atualizar o perfil
  const handleUpdateProfile = async () => {
    // Implementar lógica para salvar o perfil
    console.log('Salvando perfil:', profileData)
    // Chamar API para salvar os dados
  }

  // Renderizar carregamento
  if (!clientReady || isLoading) {
    console.log('Renderizando estado de carregamento', { clientReady, isLoading })
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    )
  }
  
  // Verificar se o usuário está autenticado
  if (!isAuthenticated || !user) {
    console.log('Usuário não autenticado, redirecionando...')
    // Redirecionar para a página inicial
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirecionando para a página inicial...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <header className="flex items-center mb-6">
          <div className="mr-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
              TM
            </div>
          </div>
          <h1 className="text-xl font-bold">TalentMatch</h1>
        </header>

        {/* Perfil principal */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold text-blue-500">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold">{profileData.name || user?.name || 'Seu Nome'}</h2>
              <p className="text-gray-600">{profileData.jobTitle || 'Engenheiro de Software Sênior'}</p>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Perfil Completo:</span>
                  <div className="w-48 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{profileCompletion}%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-500">Disponível para vagas:</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Navegação de abas */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <nav className="flex border-b">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'sobre' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('sobre')}
            >
              Sobre mim
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'busca' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('busca')}
            >
              Minha busca de emprego
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'experiencias' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('experiencias')}
            >
              Experiências Profissionais
            </button>
          </nav>

          {/* Conteúdo da aba */}
          <div className="p-6">
            {activeTab === 'sobre' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Sobre mim</h3>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={5}
                  placeholder="Experiência de software sênior com mais de 6 anos de experiência em desenvolvimento de aplicações web avançadas. Especializada em React, Node.js e arquitetura de microsserviços. Apaixonada por criar produtos de alta qualidade que impactam positivamente a vida dos usuários e por liderar equipes para alcançar excelência técnica."
                  value={profileData.about}
                  onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                ></textarea>
              </div>
            )}

            {activeTab === 'busca' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Minha busca de emprego</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo desejado</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Engenheiro de Software"
                      value={profileData.jobSearch.title}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        jobSearch: {...profileData.jobSearch, title: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="São Paulo, SP"
                      value={profileData.jobSearch.location}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        jobSearch: {...profileData.jobSearch, location: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={profileData.jobSearch.contractType}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        jobSearch: {...profileData.jobSearch, contractType: e.target.value}
                      })}
                    >
                      <option value="">Selecione</option>
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Estágio">Estágio</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={profileData.jobSearch.workMode}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        jobSearch: {...profileData.jobSearch, workMode: e.target.value}
                      })}
                    >
                      <option value="">Selecione</option>
                      <option value="Remoto">Remoto</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pretensão salarial</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="A partir de R$ 15.000"
                      value={profileData.jobSearch.salary}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        jobSearch: {...profileData.jobSearch, salary: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experiencias' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Experiências Profissionais</h3>
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      // Adicionar nova experiência vazia
                      setProfileData({
                        ...profileData,
                        experiences: [
                          ...profileData.experiences,
                          {
                            title: '',
                            company: '',
                            period: '',
                            description: '',
                            technologies: []
                          }
                        ]
                      })
                    }}
                  >
                    + Adicionar experiência
                  </button>
                </div>

                {profileData.experiences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Você ainda não adicionou experiências profissionais.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profileData.experiences.map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div className="mb-4">
                            <input
                              type="text"
                              className="font-semibold text-lg w-full border-none focus:ring-0 p-0"
                              placeholder="Cargo"
                              value={exp.title}
                              onChange={(e) => {
                                const newExperiences = [...profileData.experiences]
                                newExperiences[index].title = e.target.value
                                setProfileData({...profileData, experiences: newExperiences})
                              }}
                            />
                            <div className="flex text-gray-500 text-sm mt-1">
                              <input
                                type="text"
                                className="border-none focus:ring-0 p-0 w-full"
                                placeholder="Empresa"
                                value={exp.company}
                                onChange={(e) => {
                                  const newExperiences = [...profileData.experiences]
                                  newExperiences[index].company = e.target.value
                                  setProfileData({...profileData, experiences: newExperiences})
                                }}
                              />
                              <span className="mx-2">•</span>
                              <input
                                type="text"
                                className="border-none focus:ring-0 p-0 w-full"
                                placeholder="Período (ex: Jan 2020 - Atual)"
                                value={exp.period}
                                onChange={(e) => {
                                  const newExperiences = [...profileData.experiences]
                                  newExperiences[index].period = e.target.value
                                  setProfileData({...profileData, experiences: newExperiences})
                                }}
                              />
                            </div>
                          </div>
                          <button 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => {
                              const newExperiences = [...profileData.experiences]
                              newExperiences.splice(index, 1)
                              setProfileData({...profileData, experiences: newExperiences})
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md mb-3"
                          rows={3}
                          placeholder="Descreva suas responsabilidades e conquistas nesta posição"
                          value={exp.description}
                          onChange={(e) => {
                            const newExperiences = [...profileData.experiences]
                            newExperiences[index].description = e.target.value
                            setProfileData({...profileData, experiences: newExperiences})
                          }}
                        ></textarea>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologias utilizadas</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="React, Node.js, TypeScript (separadas por vírgula)"
                            value={exp.technologies.join(', ')}
                            onChange={(e) => {
                              const newExperiences = [...profileData.experiences]
                              newExperiences[index].technologies = e.target.value.split(',').map(tech => tech.trim())
                              setProfileData({...profileData, experiences: newExperiences})
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão de salvar */}
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md"
            onClick={handleUpdateProfile}
          >
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}
