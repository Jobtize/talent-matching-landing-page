'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { LocationInput } from '@/components/ui/location-input'
import { TagInput } from '@/components/ui/tag-input'
import { JobtizeLogo } from '@/components/ui/jobtize-logo'
import PdfUpload from '@/components/ui/pdf-upload'
import ClientOnly from '@/components/ClientOnly'
import { 
  Briefcase, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Mail,
  Phone,
  User,
  Code2,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface FormData {
  nome: string
  email: string
  telefone: string
  cargo: string
  experiencia: string
  localizacao: string
  areas: string
  tecnologias: string[]
  curriculo?: File | null
}

interface UploadedFile {
  fileName: string
  fileSize: number
  blobName: string
  blobUrl: string
}

interface ExistingUserData {
  nome: string
  email: string
  telefone?: string
  cargo?: string
  experiencia?: string
  localizacao?: string
  areas?: string
  created_at: string
}

interface PendingFormData {
  nome: string
  email: string
  telefone: string
  cargo: string
  experiencia: string
  localizacao: string
  areas: string
  tecnologias: string
}

export default function JobtizeLanding() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    experiencia: '',
    localizacao: '',
    areas: '',
    tecnologias: [],
    curriculo: null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  
  // Estados para modal de confirmação de atualização
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [existingUserData, setExistingUserData] = useState<ExistingUserData | null>(null)
  const [pendingFormData, setPendingFormData] = useState<PendingFormData | null>(null)

  // Função para sanitizar texto e prevenir XSS
  const sanitizeText = (text: string): string => {
    if (!text) return ''
    return text
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*[=:]/gi, '') // Remove event handlers como onclick=, onclick , onmouseover:
      .trim()
      .substring(0, 100) // Limita tamanho
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      localizacao: value
    }))
  }

  const handleTecnologiasChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tecnologias: tags
    }))
  }

  const handleCurriculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      curriculo: file
    }))
  }

  // Handlers para upload de PDF
  const handlePdfUploadSuccess = (result: UploadedFile) => {
    setUploadedFiles(prev => [...prev, result])
  }

  const handlePdfUploadError = (error: string) => {
    console.error('Erro no upload de PDF:', error)
    // Você pode mostrar uma notificação de erro aqui se desejar
  }

  // Função para confirmar atualização dos dados
  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return
    
    setIsSubmitting(true)
    setShowUpdateModal(false)
    setSubmitStatus('idle')
    setSubmitMessage('')
    
    try {
      const response = await fetch('/api/candidates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingFormData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Se há PDF enviado, substituir o PDF existente do candidato
        if (uploadedFiles.length > 0 && result.data.id) {
          try {
            // Primeiro, excluir PDFs existentes do candidato
            const deleteResponse = await fetch(`/api/candidate-files/${result.data.id}`, {
              method: 'DELETE',
            });

            // Depois, associar o novo PDF
            await fetch('/api/upload-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                candidateId: result.data.id,
                blobName: uploadedFiles[0].blobName,
                fileName: uploadedFiles[0].fileName,
                fileSize: uploadedFiles[0].fileSize,
                blobUrl: uploadedFiles[0].blobUrl,
                updateOnly: true
              }),
            });
          } catch (error) {
            console.error('Erro ao substituir PDF do candidato:', error);
          }
        }

        setSubmitStatus('success')
        setSubmitMessage(`Dados atualizados com sucesso! Obrigado, ${result.data.nome}. Suas informações foram atualizadas em nossa base.`)
        
        // Reset do formulário após sucesso
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          cargo: '',
          experiencia: '',
          localizacao: '',
          areas: '',
          tecnologias: [],
          curriculo: null
        })
        setUploadedFiles([])
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Erro ao atualizar dados. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      setSubmitStatus('error')
      setSubmitMessage('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setIsSubmitting(false)
      setExistingUserData(null)
      setPendingFormData(null)
    }
  }

  // Função para cancelar atualização
  const handleCancelUpdate = () => {
    setShowUpdateModal(false)
    setExistingUserData(null)
    setPendingFormData(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')
    
    try {
      // Preparar dados para envio (excluindo currículo por enquanto)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { curriculo, ...formDataWithoutFile } = formData
      const dataToSend = {
        ...formDataWithoutFile,
        telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação do telefone
        tecnologias: formData.tecnologias.join(', ')
      }
      
      console.log('Dados sendo enviados:', dataToSend)
      console.log('Telefone original:', formData.telefone)
      console.log('Telefone limpo:', dataToSend.telefone)
      
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(`Cadastro realizado com sucesso! Obrigado, ${result.data.nome}. Entraremos em contato em breve.`)
        
        // Se há arquivos PDF enviados, associá-los ao candidato
        if (uploadedFiles.length > 0 && result.data.id) {
          try {
            await Promise.all(
              uploadedFiles.map(async (file) => {
                const formData = new FormData();
                // Criar um arquivo fake para reenviar (já que o arquivo original foi enviado)
                // Na verdade, vamos apenas atualizar o banco para associar o arquivo ao candidato
                const updateResponse = await fetch('/api/upload-pdf', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    candidateId: result.data.id,
                    blobName: file.blobName,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    blobUrl: file.blobUrl,
                    updateOnly: true
                  }),
                });
                
                if (!updateResponse.ok) {
                  console.error('Erro ao associar arquivo ao candidato:', file.fileName);
                }
              })
            );
          } catch (error) {
            console.error('Erro ao associar arquivos ao candidato:', error);
          }
        }
        
        // Reset do formulário após sucesso
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          cargo: '',
          experiencia: '',
          localizacao: '',
          areas: '',
          tecnologias: [],
          curriculo: null
        })
        setUploadedFiles([])
      } else {
        // Tratamento específico para email duplicado
        if (result.code === 'EMAIL_ALREADY_EXISTS' && result.existingData) {
          setExistingUserData(result.existingData)
          setPendingFormData(dataToSend)
          setShowUpdateModal(true)
          return
        }
        
        setSubmitStatus('error')
        
        // Mensagens específicas para diferentes tipos de erro
        switch (result.code) {
          case 'EMAIL_ALREADY_EXISTS':
            setSubmitMessage('Este email já está cadastrado. Tente com outro email ou entre em contato conosco.')
            break
          case 'DATABASE_CONNECTION_ERROR':
            setSubmitMessage('Erro de conexão. Verifique sua internet e tente novamente.')
            break
          default:
            setSubmitMessage(result.error || 'Erro ao processar cadastro. Tente novamente.')
        }
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      setSubmitStatus('error')
      setSubmitMessage('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <JobtizeLogo width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Jobtize</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-600 transition-colors">
                Como Funciona
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Benefícios
              </a>
              <a href="#depoimentos" className="text-gray-600 hover:text-blue-600 transition-colors">
                Depoimentos
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Deixe as vagas
                <span className="text-blue-600 block">encontrarem você</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Pare de procurar emprego. Nossa plataforma inteligente conecta você às melhores 
                oportunidades baseadas no seu perfil profissional.
              </p>

            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Comece sua jornada agora
              </h2>
              <ClientOnly fallback={
                <div className="space-y-4">
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="h-20 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="h-12 bg-blue-100 rounded-md animate-pulse"></div>
                </div>
              }>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <PhoneInput
                      name="telefone"
                      placeholder="Telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="cargo"
                    placeholder="Cargo atual"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Experiência</option>
                    <option value="junior">Júnior (0-2 anos)</option>
                    <option value="pleno">Pleno (3-5 anos)</option>
                    <option value="senior">Sênior (6+ anos)</option>
                  </select>

                  <LocationInput
                    value={formData.localizacao}
                    onChange={handleLocationChange}
                    placeholder="Localização"
                    className="w-full"
                  />
                </div>

                <Input
                  type="text"
                  name="areas"
                  placeholder="Áreas de interesse (ex: Tecnologia, Marketing)"
                  value={formData.areas}
                  onChange={handleInputChange}
                  required
                />

                <div className="relative">
                  <Code2 className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                  <TagInput
                    value={formData.tecnologias}
                    onChange={handleTecnologiasChange}
                    placeholder="Tecnologias e ferramentas prioritárias (ex: React, Python, AWS, Figma, etc.)"
                    className="pl-10"
                  />
                </div>

                {/* Campo de Currículo */}
                {/* Upload de PDF */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    📄 Currículo (PDF) - Opcional
                  </label>
                  <PdfUpload
                    onUploadSuccess={handlePdfUploadSuccess}
                    onUploadError={handlePdfUploadError}
                    maxFiles={1}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Envie seu currículo em PDF (máximo 1 arquivo, 10MB)
                  </p>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600">
                        ✅ Currículo enviado com sucesso
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-lg py-3" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Seja Encontrado
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                {/* Feedback Visual */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">
                          Cadastro realizado com sucesso!
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {submitMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Erro no cadastro
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {submitMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
              </ClientOnly>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Confirmação de Atualização */}
      {showUpdateModal && existingUserData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex items-start mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email já cadastrado
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Encontramos um cadastro com este email. Deseja atualizar seus dados?
                  {uploadedFiles.length > 0 && (
                    <span className="block mt-2 text-amber-600 font-medium">
                      ⚠️ O currículo atual será substituído pelo novo arquivo enviado.
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Dados atuais:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Nome:</strong> {sanitizeText(existingUserData.nome)}</p>
                <p><strong>Email:</strong> {sanitizeText(existingUserData.email)}</p>
                {existingUserData.telefone && (
                  <p><strong>Telefone:</strong> {sanitizeText(existingUserData.telefone)}</p>
                )}
                {existingUserData.cargo && (
                  <p><strong>Cargo:</strong> {sanitizeText(existingUserData.cargo)}</p>
                )}
                {existingUserData.experiencia && (
                  <p><strong>Experiência:</strong> {sanitizeText(existingUserData.experiencia)}</p>
                )}
                {existingUserData.localizacao && (
                  <p><strong>Localização:</strong> {sanitizeText(existingUserData.localizacao)}</p>
                )}
                {existingUserData.areas && (
                  <p><strong>Áreas:</strong> {sanitizeText(existingUserData.areas)}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Cadastrado em: {new Date(existingUserData.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Atualizando...
                  </>
                ) : (
                  'Sim, atualizar dados'
                )}
              </Button>
              <Button
                onClick={handleCancelUpdate}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1.2k+</div>
              <div className="text-gray-600">Profissionais cadastrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Empresas parceiras</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
              <div className="text-gray-600">Taxa de satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">180+</div>
              <div className="text-gray-600">Contratações realizadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Um processo simples e eficiente para conectar você às melhores oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Crie seu perfil</h3>
              <p className="text-gray-600">
                Cadastre suas informações profissionais e preferências de carreira
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. IA faz o match</h3>
              <p className="text-gray-600">
                Nossa inteligência artificial analisa seu perfil e encontra as vagas ideais
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Receba propostas</h3>
              <p className="text-gray-600">
                Empresas interessadas entram em contato diretamente com você
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <JobtizeLogo width={32} height={32} />
              <span className="text-xl font-bold">Jobtize</span>
            </div>
            <p className="text-gray-400 mb-8">
              Conectando talentos às melhores oportunidades de carreira
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
