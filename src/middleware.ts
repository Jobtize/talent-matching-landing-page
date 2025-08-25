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
  
  console.log("Middleware verificando sessão para rota protegida:", {
    pathname,
    hasSession: !!session,
    sessionData: session ? 'Sessão existe' : 'Sem sessão'
  });
  
  // Se não estiver autenticado e for uma rota protegida, redirecionar para a página inicial
  if (!session && isProtectedRoute) {
    console.log("Middleware: Usuário não autenticado tentando acessar rota protegida. Redirecionando para /");
    
    // Armazenar a URL que o usuário estava tentando acessar
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
    
    // Redirecionar para a página inicial com parâmetro de redirecionamento
    return NextResponse.redirect(new URL(`/?callbackUrl=${callbackUrl}`, request.url));
  }
  
  console.log("Middleware: Usuário autenticado acessando rota protegida. Permitindo acesso.");
  
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
