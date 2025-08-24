'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JobtizeLogo } from '@/components/ui/jobtize-logo'
import { useFormStorage, FormStorageData } from '@/hooks/useFormStorage'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const { formData, clearFormData } = useFormStorage()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Redirecionar se não houver dados do formulário
  useEffect(() => {
    if (!formData) {
      router.push('/')
    }
  }, [formData, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    setError(null)
    setIsSubmitting(true)
    
    try {
      // Enviar dados para API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          password
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta')
      }
      
      // Tracking de conversão
      track('registration_complete', {
        source: 'form_completion',
        has_linkedin: false
      })
      
      // Mostrar sucesso e redirecionar
      setSuccess(true)
      clearFormData() // Limpar dados do formulário após registro
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao registrar:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <JobtizeLogo width={32} height={32} />
              <span className="ml-2 text-xl font-bold text-gray-900">Jobtize</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Concluído!</h2>
              <p className="text-gray-600 mb-6">
                Sua conta foi criada com sucesso. Redirecionando para o dashboard...
              </p>
              <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-600 animate-progress"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Complete seu cadastro</h1>
                <p className="text-gray-600 mt-2">
                  Estamos quase lá! Crie uma senha para acessar sua conta.
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Seus dados</h2>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{formData.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                  
                  {formData.telefone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{formData.telefone}</p>
                    </div>
                  )}
                  
                  {formData.cargo && (
                    <div>
                      <p className="text-sm text-gray-500">Cargo</p>
                      <p className="font-medium">{formData.cargo}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Crie uma senha segura"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo de 6 caracteres
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirme a senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar minha conta'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

