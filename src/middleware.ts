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
  if (!session && isProtectedRoute) {
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Permitir acesso se estiver autenticado
  return NextResponse.next();
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto:
     * 1. Rotas de API (que começam com /api/)
     * 2. Arquivos estáticos (que começam com /_next/ ou contêm um ponto como .jpg, .png, etc.)
     * 3. Rotas de autenticação (que começam com /api/auth/)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};

