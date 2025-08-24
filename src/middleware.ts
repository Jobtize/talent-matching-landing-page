import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Função para verificar se a rota requer autenticação
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/profile']
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Função para verificar se a rota é de API
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

// Esta função pode ser marcada como `async` se estiver usando `await` dentro dela
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Ignorar rotas de API
  if (isApiRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Verificar se é uma rota protegida
  if (isProtectedRoute(pathname)) {
    // Verificar se o usuário está autenticado
    const authToken = request.cookies.get('auth_token')
    const userData = request.cookies.get('user_data')
    
    // Se não estiver autenticado, redirecionar para a página inicial
    if (!authToken || !userData) {
      console.log('Middleware: Usuário não autenticado, redirecionando para a página inicial')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

