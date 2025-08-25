import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

// Função auxiliar para criar uma resposta de redirecionamento
function createProfileRedirect() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
  console.log("Criando redirecionamento direto para /profile");
  return NextResponse.redirect(`${baseUrl}/profile`, { status: 302 });
}

// Função para verificar se o usuário está autenticado
async function isAuthenticated() {
  try {
    const session = await auth();
    return !!session;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

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
        console.log("Processando autenticação com NextAuth...");
        
        // Tentar processar a autenticação com NextAuth
        const response = await auth.handleAuth(request as any, { providerId: 'linkedin' });
        
        console.log("Autenticação processada com sucesso, verificando status...");
        
        // Verificar se o usuário está autenticado após o processamento
        const authenticated = await isAuthenticated();
        console.log("Status de autenticação após processamento:", authenticated);
        
        // Se o usuário estiver autenticado, redirecionar para /profile
        if (authenticated) {
          console.log("Usuário autenticado, redirecionando para /profile");
          return createProfileRedirect();
        }
        
        // Verificar se a resposta é um redirecionamento
        if (response instanceof Response && response.status >= 300 && response.status < 400) {
          const redirectUrl = response.headers.get('location');
          console.log("Redirecionamento detectado para:", redirectUrl);
          
          // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
          if (redirectUrl && !redirectUrl.includes('/profile')) {
            console.log("Forçando redirecionamento para /profile");
            return createProfileRedirect();
          }
        }
        
        // Se a resposta não for um redirecionamento, forçar redirecionamento para /profile
        if (!(response instanceof Response) || response.status < 300 || response.status >= 400) {
          console.log("Resposta não é um redirecionamento, forçando redirecionamento para /profile");
          return createProfileRedirect();
        }
        
        // Se chegamos aqui, retornar a resposta original
        console.log("Retornando resposta original do NextAuth");
        return response;
      } catch (authError: any) {
        console.error("Erro ao processar autenticação:", authError);
        
        // Se o erro for um redirecionamento do NextAuth, verificar se é para /profile
        if (authError.message === 'NEXT_REDIRECT') {
          console.log("Redirecionamento do NextAuth detectado:", authError.digest);
          
          // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
          if (!authError.digest.includes('/profile')) {
            console.log("Redirecionamento não é para /profile, forçando redirecionamento");
            return createProfileRedirect();
          }
          
          console.log("Permitindo redirecionamento do NextAuth continuar");
          throw authError; // Deixar o NextAuth lidar com o redirecionamento
        }
        
        // Outros erros, redirecionar para /profile de qualquer forma
        console.log("Erro não é um redirecionamento, forçando redirecionamento para /profile");
        return createProfileRedirect();
      }
    } else {
      console.error("Nenhum código de autorização recebido do LinkedIn");
      
      // Redirecionar para a página inicial com erro
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
      return NextResponse.redirect(`${baseUrl}/?error=no_auth_code`);
    }
  } catch (error: any) {
    console.error("Erro no callback do LinkedIn:", error);
    
    // Se o erro for um redirecionamento do NextAuth, verificar se é para /profile
    if (error.message === 'NEXT_REDIRECT') {
      console.log("Redirecionamento do NextAuth detectado:", error.digest);
      
      // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
      if (!error.digest.includes('/profile')) {
        console.log("Redirecionamento não é para /profile, forçando redirecionamento");
        return createProfileRedirect();
      }
      
      console.log("Permitindo redirecionamento do NextAuth continuar");
      throw error; // Deixar o NextAuth lidar com o redirecionamento
    }
    
    // Em caso de outros erros, redirecionar para /profile de qualquer forma
    console.log("Erro não é um redirecionamento, forçando redirecionamento para /profile");
    return createProfileRedirect();
  }
}
