import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/profile', '/dashboard'];

// Rotas públicas (não requerem autenticação)
const publicRoutes = ['/', '/auth/error'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se a rota requer autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Se não for uma rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Verificar autenticação
  const session = await auth();
  
  // Se não estiver autenticado e for uma rota protegida, redirecionar para a página inicial
  // sem adicionar parâmetros de consulta
  if (!session && isProtectedRoute) {
    // Redirecionar diretamente para a página inicial sem parâmetros de consulta
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Permitir acesso se estiver autenticado
  return NextResponse.next();
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde apenas às rotas protegidas:
     * 1. /profile e suas sub-rotas
     * 2. /dashboard e suas sub-rotas
     */
    '/profile/:path*',
    '/dashboard/:path*',
  ],
};
