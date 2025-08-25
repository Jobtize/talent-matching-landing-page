'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirecionar para a página inicial se não estiver autenticado
      window.location.href = '/';
    },
  });
  
  // Log para depuração
  useEffect(() => {
    console.log('Status da sessão na página de perfil:', status);
    console.log('Dados da sessão:', session);
  }, [session, status]);
  
  const [profileData, setProfileData] = useState({
    name: '',
    jobTitle: '',
    bio: '',
    skills: [''],
    experience: '',
    education: '',
    location: '',
    availability: 'full-time',
    remotePreference: 'hybrid',
  });
  const [linkedInData, setLinkedInData] = useState<any>(null);
  const [isLoadingLinkedInData, setIsLoadingLinkedInData] = useState(false);
  
  // Calcular completude do perfil
  const profileFields = Object.keys(profileData).length;
  const filledFields = Object.values(profileData).filter(value => 
    value !== '' && value !== null && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 && value[0] !== '' : true)
  ).length;
  
  const profileCompletion = Math.round((filledFields / profileFields) * 100);
  
  // Buscar dados detalhados do LinkedIn
  const fetchLinkedInData = async () => {
    if (!session?.user?.accessToken) return;
    
    try {
      setIsLoadingLinkedInData(true);
      const response = await fetch('/api/linkedin/profile');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados do LinkedIn:', data);
        setLinkedInData(data);
      } else {
        console.error('Erro ao buscar dados do LinkedIn:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao buscar dados do LinkedIn:', error);
    } finally {
      setIsLoadingLinkedInData(false);
    }
  };
  
  // Preencher dados do perfil com informações do usuário quando disponíveis
  useEffect(() => {
    if (session?.user) {
      setProfileData(prevData => ({
        ...prevData,
        name: session.user.name || prevData.name,
        jobTitle: session.user.headline || prevData.jobTitle,
        location: session.user.location || prevData.location,
      }));
      
      // Buscar dados adicionais do LinkedIn
      fetchLinkedInData();
    }
  }, [session]);
  
  // Função para atualizar o perfil
  const handleUpdateProfile = async () => {
    // Implementar lógica para salvar o perfil
    console.log('Salvando perfil:', profileData);
    // Chamar API para salvar os dados
  };
  
  // Renderizar carregamento
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    );
  }
  
  // Verificar se o usuário está autenticado
  if (status === 'unauthenticated') {
    // Já estamos redirecionando no useSession, mas mantemos isso como fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirecionando para a página inicial...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                TM
              </div>
            </div>
            <h1 className="text-xl font-bold">TalentMatch</h1>
          </div>
          <LogoutButton />
        </header>

        {/* Perfil principal */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {session?.user?.image ? (
                <Image 
                  src={session.user.image}
                  alt={session.user.name || 'Foto de perfil'}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold text-blue-500">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold">{profileData.name || session?.user?.name || 'Seu Nome'}</h2>
              <p className="text-gray-600">{profileData.jobTitle || session?.user?.headline || 'Profissional'}</p>
              
              {/* Informações do LinkedIn */}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                {session?.user?.location && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {session.user.location}
                  </div>
                )}
                
                {session?.user?.industry && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {session.user.industry}
                  </div>
                )}
                
                {session?.user?.connections !== undefined && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {session.user.connections} conexões
                  </div>
                )}
                
                {session?.user?.profileUrl && (
                  <a 
                    href={session.user.profileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Perfil LinkedIn
                  </a>
                )}
              </div>
              
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
              
              {isLoadingLinkedInData && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="inline-block animate-pulse">Carregando dados do LinkedIn...</span>
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-700">Perfil Privado</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Editar Perfil
            </button>
            <button className="bg-white hover:bg-gray-100 text-blue-500 border border-blue-500 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Visualizar como Recrutador
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Compartilhar Perfil
            </button>
          </div>
        </div>
        
        {/* Seções do perfil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda */}
          <div className="md:col-span-2 space-y-6">
            {/* Sobre mim */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Sobre mim</h3>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder="Descreva sua experiência, objetivos e o que você busca profissionalmente..."
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              ></textarea>
            </div>
            
            {/* Experiência */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Experiência</h3>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder="Descreva suas experiências profissionais..."
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
              ></textarea>
            </div>
            
            {/* Educação */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Educação</h3>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder="Descreva sua formação acadêmica..."
                value={profileData.education}
                onChange={(e) => setProfileData({...profileData, education: e.target.value})}
              ></textarea>
            </div>
          </div>
          
          {/* Coluna da direita */}
          <div className="space-y-6">
            {/* Habilidades */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Habilidades</h3>
              <div className="space-y-2">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <input 
                      type="text" 
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: JavaScript, React, Node.js"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...profileData.skills];
                        newSkills[index] = e.target.value;
                        setProfileData({...profileData, skills: newSkills});
                      }}
                    />
                    <button 
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        const newSkills = profileData.skills.filter((_, i) => i !== index);
                        setProfileData({...profileData, skills: newSkills.length ? newSkills : ['']});
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button 
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
                  onClick={() => setProfileData({...profileData, skills: [...profileData.skills, '']})}
                >
                  + Adicionar habilidade
                </button>
              </div>
            </div>
            
            {/* Preferências */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Preferências</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: São Paulo, SP"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileData.availability}
                  onChange={(e) => setProfileData({...profileData, availability: e.target.value})}
                >
                  <option value="full-time">Tempo integral</option>
                  <option value="part-time">Meio período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferência de trabalho</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileData.remotePreference}
                  onChange={(e) => setProfileData({...profileData, remotePreference: e.target.value})}
                >
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="office">Presencial</option>
                </select>
              </div>
            </div>
            
            {/* Botão de salvar */}
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors"
              onClick={handleUpdateProfile}
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
