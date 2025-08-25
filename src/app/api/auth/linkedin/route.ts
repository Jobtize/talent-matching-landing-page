import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'

// Redirecionar para o fluxo de autenticação do NextAuth
export async function GET(request: NextRequest) {
  try {
    // Redirecionar para o fluxo de autenticação do NextAuth
    return await signIn('linkedin', { redirectTo: '/profile' })
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    // Usar URL absoluta para redirecionamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    return NextResponse.redirect(`${baseUrl}/?error=auth_init_failed`);
  }
}
