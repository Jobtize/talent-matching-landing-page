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
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()

  // Verificar autenticação ao carregar
  useEffect(() => {
    // Função para verificar autenticação
    const checkAuth = async () => {
      try {
        console.log('Verificando autenticação...')
        
        // Verificar se estamos no cliente
        if (typeof window === 'undefined') {
          console.log('Executando no servidor, aguardando cliente')
          return // Não fazer nada no servidor
        }
        
        // Verificar se há token no localStorage
        let storedToken = null
        try {
          storedToken = localStorage.getItem('auth_token')
          console.log('Token do localStorage:', storedToken ? 'presente' : 'ausente')
        } catch (e) {
          console.error('Erro ao acessar localStorage:', e)
        }
        
        // Verificar se há dados do usuário no localStorage
        let userData = null
        try {
          const userDataStr = localStorage.getItem('user_data')
          if (userDataStr) {
            userData = JSON.parse(userDataStr)
            console.log('Dados do usuário do localStorage:', userData)
          }
        } catch (e) {
          console.error('Erro ao acessar dados do usuário:', e)
        }
        
        // Se temos dados do usuário no localStorage, considerar autenticado
        if (userData && storedToken) {
          console.log('Autenticado com dados do localStorage')
          setUser(userData)
          setToken(storedToken)
          setIsLoading(false)
          setAuthInitialized(true)
          return
        }
        
        // Verificar cookies como fallback
        try {
          const cookies = document.cookie.split(';')
          const authCookie = cookies.find(c => c.trim().startsWith('auth_token='))
          const userCookie = cookies.find(c => c.trim().startsWith('user_data='))
          
          console.log('Cookies encontrados:', { 
            authCookie: authCookie ? 'presente' : 'ausente',
            userCookie: userCookie ? 'presente' : 'ausente'
          })
          
          // Se temos dados do usuário nos cookies, considerar autenticado
          if (userCookie) {
            try {
              const userDataStr = decodeURIComponent(userCookie.split('=')[1])
              userData = JSON.parse(userDataStr)
              console.log('Usando dados do usuário dos cookies:', userData)
              
              if (userData) {
                console.log('Autenticado com dados dos cookies')
                setUser(userData)
                setToken(authCookie ? authCookie.split('=')[1] : null)
                
                // Salvar no localStorage para futuras verificações
                try {
                  localStorage.setItem('auth_token', authCookie ? authCookie.split('=')[1] : '')
                  localStorage.setItem('user_data', JSON.stringify(userData))
                  console.log('Dados salvos no localStorage a partir dos cookies')
                } catch (e) {
                  console.error('Erro ao salvar dados no localStorage:', e)
                }
                
                setIsLoading(false)
                setAuthInitialized(true)
                return
              }
            } catch (e) {
              console.error('Erro ao processar dados do usuário dos cookies:', e)
            }
          }
        } catch (e) {
          console.error('Erro ao processar cookies:', e)
        }
        
        // Se chegamos aqui, não temos dados de autenticação válidos
        console.log('Nenhum dado de autenticação válido encontrado')
        setUser(null)
        setToken(null)
        setIsLoading(false)
        setAuthInitialized(true)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setUser(null)
        setToken(null)
        setIsLoading(false)
        setAuthInitialized(true)
      }
    }
    
    // Executar verificação apenas no cliente
    if (typeof window !== 'undefined') {
      checkAuth()
    } else {
      // No servidor, apenas marcar como não carregando
      setIsLoading(false)
    }
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
    isLoading: isLoading || !authInitialized,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
