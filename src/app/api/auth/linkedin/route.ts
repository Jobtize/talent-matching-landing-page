import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'

// Redirecionar para o fluxo de autenticação do NextAuth
export async function GET(request: NextRequest) {
  try {
    // Redirecionar para o fluxo de autenticação do NextAuth
    return await signIn('linkedin', { redirectTo: '/profile' })
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return NextResponse.redirect('/?error=auth_init_failed');
  }
}
