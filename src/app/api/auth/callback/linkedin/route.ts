import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar se há um código de autorização na URL
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    
    console.log("Callback do LinkedIn recebido:", { 
      hasCode: !!code, 
      hasState: !!state,
      url: request.nextUrl.toString()
    });
    
    if (code) {
      console.log("Código de autorização recebido do LinkedIn:", code.substring(0, 10) + "...");
      
      try {
        // Tentar processar a autenticação com NextAuth
        const response = await auth.handleAuth(request as any, { providerId: 'linkedin' });
        
        console.log("Autenticação processada com sucesso, redirecionando...");
        
        // Verificar se a resposta é um redirecionamento
        if (response instanceof Response && response.status >= 300 && response.status < 400) {
          const redirectUrl = response.headers.get('location');
          console.log("Redirecionamento detectado para:", redirectUrl);
          
          // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
          if (redirectUrl && !redirectUrl.includes('/profile')) {
            console.log("Forçando redirecionamento para /profile");
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
            return NextResponse.redirect(`${baseUrl}/profile`);
          }
        }
        
        return response;
      } catch (authError: any) {
        console.error("Erro ao processar autenticação:", authError);
        
        // Se o erro for um redirecionamento do NextAuth, permitir que continue
        if (authError.message === 'NEXT_REDIRECT') {
          console.log("Redirecionamento do NextAuth detectado, permitindo continuar");
          throw authError; // Deixar o NextAuth lidar com o redirecionamento
        }
        
        // Outros erros, redirecionar para página inicial
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
        return NextResponse.redirect(`${baseUrl}/?error=auth_process_error`);
      }
    } else {
      console.error("Nenhum código de autorização recebido do LinkedIn");
      
      // Redirecionar para a página inicial com erro
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
      return NextResponse.redirect(`${baseUrl}/?error=no_auth_code`);
    }
  } catch (error: any) {
    console.error("Erro no callback do LinkedIn:", error);
    
    // Se o erro for um redirecionamento do NextAuth, permitir que continue
    if (error.message === 'NEXT_REDIRECT') {
      console.log("Redirecionamento do NextAuth detectado, permitindo continuar");
      throw error; // Deixar o NextAuth lidar com o redirecionamento
    }
    
    // Em caso de outros erros, redirecionar para a página inicial
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    return NextResponse.redirect(`${baseUrl}/?error=auth_callback_error`);
  }
}
