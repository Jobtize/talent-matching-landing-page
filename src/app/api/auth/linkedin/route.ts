import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'

// Redirecionar para o fluxo de autenticação do NextAuth
export async function GET(request: NextRequest) {
  try {
    // Obter a URL de callback da query string ou usar /profile como padrão
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/profile';
    
    console.log("Iniciando autenticação LinkedIn com callbackUrl:", callbackUrl);
    
    // Redirecionar para o fluxo de autenticação do NextAuth com callbackUrl explícito
    return await signIn('linkedin', { 
      redirectTo: callbackUrl,
      // Forçar redirecionamento
      redirect: true
    })
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    // Usar URL absoluta para redirecionamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    return NextResponse.redirect(`${baseUrl}/?error=auth_init_failed`);
  }
}
