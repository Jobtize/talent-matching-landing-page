import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/dashboard/perfil', '/dashboard/vagas']

// Rotas de autenticação (não redirecionar para login)
const authRoutes = ['/login', '/cadastro', '/api/auth']

export async function middleware(request: NextRequest) {
  // Permitir acesso a todas as rotas no ambiente de preview
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
    return NextResponse.next()
  }
  
  const { pathname } = request.nextUrl
  
  // Verificar se a rota requer autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Se não for uma rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Obter token de autenticação do cookie
  const token = request.cookies.get('auth_token')?.value
  
  // Se não houver token, redirecionar para login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  try {
    // Verificar token JWT
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )
    
    await jwtVerify(token, JWT_SECRET)
    
    // Token válido, permitir acesso
    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    console.error('Erro ao verificar token:', error)
    
    // Limpar cookie inválido
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    
    return response
  }
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
}
