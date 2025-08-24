'use client'

import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Verificando autenticação...')
        
        // Verificar se há token no localStorage ou cookies
        let storedToken = null
        
        // Tentar obter do localStorage (cliente)
        if (typeof window !== 'undefined') {
          try {
            storedToken = localStorage.getItem('auth_token')
            console.log('Token do localStorage:', storedToken ? 'presente' : 'ausente')
          } catch (e) {
            console.error('Erro ao acessar localStorage:', e)
          }
        }
        
        // Verificar se há dados do usuário no localStorage
        let userData = null
        if (typeof window !== 'undefined') {
          try {
            const userDataStr = localStorage.getItem('user_data')
            if (userDataStr) {
              userData = JSON.parse(userDataStr)
              console.log('Dados do usuário do localStorage:', userData)
            }
          } catch (e) {
            console.error('Erro ao acessar dados do usuário:', e)
          }
        }
        
        // Verificar se há dados nos cookies
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(c => c.trim().startsWith('auth_token='))
        const userCookie = cookies.find(c => c.trim().startsWith('user_data='))
        
        console.log('Cookies encontrados:', { 
          authCookie: authCookie ? 'presente' : 'ausente',
          userCookie: userCookie ? 'presente' : 'ausente'
        })
        
        // Se não há token nem nos cookies nem no localStorage, não está autenticado
        if (!storedToken && !authCookie) {
          console.log('Nenhum token encontrado, usuário não autenticado')
          setIsLoading(false)
          return
        }
        
        // Se temos dados do usuário nos cookies ou localStorage, considerar autenticado
        if (userData || userCookie) {
          try {
            // Se temos dados nos cookies, usar esses
            if (userCookie && !userData) {
              const userDataStr = decodeURIComponent(userCookie.split('=')[1])
              userData = JSON.parse(userDataStr)
              console.log('Usando dados do usuário dos cookies:', userData)
            }
            
            if (userData) {
              console.log('Autenticado com dados do usuário:', userData)
              setUser(userData)
              setToken(storedToken || (authCookie ? authCookie.split('=')[1] : null))
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Erro ao processar dados do usuário:', e)
          }
        }
        
        // Se chegamos aqui, temos um token mas não temos dados do usuário
        // Verificar se o token é válido via API
        try {
          console.log('Verificando token via API...')
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${storedToken || (authCookie ? authCookie.split('=')[1] : '')}`,
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Token válido, dados do usuário:', data.user)
            setUser(data.user)
            setToken(storedToken || (authCookie ? authCookie.split('=')[1] : null))
            
            // Salvar dados no localStorage para futuras verificações
            if (typeof window !== 'undefined' && data.user) {
              localStorage.setItem('user_data', JSON.stringify(data.user))
            }
          } else {
            console.log('Token inválido ou expirado')
            // Token inválido, limpar autenticação
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('user_data')
            }
            setUser(null)
            setToken(null)
          }
        } catch (error) {
          console.error('Erro ao verificar token via API:', error)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Função de login
  const login = (newToken: string, newUser: User) => {
    console.log('Login realizado:', { user: newUser })
    
    // Salvar no localStorage (cliente)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('user_data', JSON.stringify(newUser))
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e)
      }
    }
    
    setToken(newToken)
    setUser(newUser)
  }

  // Função de logout
  const logout = () => {
    console.log('Logout realizado')
    
    // Limpar localStorage (cliente)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      } catch (e) {
        console.error('Erro ao limpar localStorage:', e)
      }
    }
    
    setToken(null)
    setUser(null)
    router.push('/')
  }

  // Função para atualizar dados do usuário
  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser })
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
