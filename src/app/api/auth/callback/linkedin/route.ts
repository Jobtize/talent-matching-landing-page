import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar se há um código de autorização na URL
    const code = request.nextUrl.searchParams.get('code');
    
    if (code) {
      console.log("Código de autorização recebido do LinkedIn:", code.substring(0, 10) + "...");
      
      // Tentar processar a autenticação com NextAuth
      const response = await auth.handleAuth(request as any, { providerId: 'linkedin' });
      
      // Verificar se a autenticação foi bem-sucedida
      // Se for bem-sucedida, o NextAuth deve redirecionar para /profile
      return response;
    } else {
      console.error("Nenhum código de autorização recebido do LinkedIn");
      
      // Redirecionar para a página inicial com erro
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
      return NextResponse.redirect(`${baseUrl}/?error=no_auth_code`);
    }
  } catch (error) {
    console.error("Erro no callback do LinkedIn:", error);
    
    // Em caso de erro, redirecionar para a página inicial
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    return NextResponse.redirect(`${baseUrl}/?error=auth_callback_error`);
  }
}
