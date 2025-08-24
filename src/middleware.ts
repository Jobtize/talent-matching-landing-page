import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/dashboard/perfil', '/dashboard/vagas']

// Rotas de autenticação (não redirecionar para login)
const authRoutes = ['/login', '/cadastro', '/api/auth']

export async function middleware(request: NextRequest) {
  // Middleware desativado - permitir acesso a todas as rotas
  return NextResponse.next()
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
}
