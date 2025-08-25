'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface LoginButtonProps {
  className?: string;
  text?: string;
}

export default function LoginButton({ className = '', text = 'Entrar com LinkedIn' }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Armazenar URL de callback no sessionStorage para garantir redirecionamento
      window.sessionStorage.setItem('nextauth_callback', '/profile');
      
      // Usar redirecionamento explícito
      await signIn('linkedin', { 
        callbackUrl: '/profile',
        redirect: true
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      // Fallback para redirecionamento direto em caso de erro
      window.location.href = '/api/auth/linkedin';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#006699] text-white font-medium py-2 px-4 rounded transition-colors ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
        </svg>
      )}
      {text}
    </button>
  );
}
