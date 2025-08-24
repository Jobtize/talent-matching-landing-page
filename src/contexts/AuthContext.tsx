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
        // Verificar se há token no localStorage
        const storedToken = localStorage.getItem('auth_token')
        
        if (!storedToken) {
          setIsLoading(false)
          return
        }
        
        // Verificar se o token é válido
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setToken(storedToken)
        } else {
          // Token inválido, limpar autenticação
          localStorage.removeItem('auth_token')
          setUser(null)
          setToken(null)
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
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  // Função de logout
  const logout = () => {
    localStorage.removeItem('auth_token')
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

