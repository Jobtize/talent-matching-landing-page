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
        
        // Verificar autenticação via API
        try {
          console.log('Verificando autenticação via API...')
          const response = await fetch('/api/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.authenticated && data.user) {
              console.log('Autenticado via API')
              setUser(data.user)
              setToken('token-via-cookie') // O token real está no cookie httpOnly
              setIsLoading(false)
              setAuthInitialized(true)
              return
            }
          }
          
          console.log('Não autenticado via API')
        } catch (error) {
          console.error('Erro ao verificar autenticação via API:', error)
        }
        
        // Se chegamos aqui, não estamos autenticados
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
    setToken(newToken)
    setUser(newUser)
  }

  // Função de logout
  const logout = () => {
    console.log('Logout realizado')
    
    // Limpar estado
    setToken(null)
    setUser(null)
    
    // Chamar API de logout para limpar cookies no servidor
    if (typeof window !== 'undefined') {
      // Fazer uma requisição para a API de logout
      fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      })
      .then(() => {
        console.log('Logout realizado com sucesso no servidor')
        // Redirecionar para a página inicial usando router
        router.push('/')
      })
      .catch(error => {
        console.error('Erro ao fazer logout no servidor:', error)
        // Mesmo com erro, redirecionar para a página inicial
        router.push('/')
      })
    } else {
      // Fallback para o caso de não conseguir chamar a API
      router.push('/')
    }
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
