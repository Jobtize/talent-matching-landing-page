import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

// Função para criar uma resposta de redirecionamento
function createRedirect(path: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
  const fullUrl = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  console.log(`Criando redirecionamento para: ${fullUrl}`);
  
  // Usar 302 para redirecionamento temporário
  return NextResponse.redirect(fullUrl, { status: 302 });
}

// Função para verificar se o usuário está autenticado
async function isAuthenticated() {
  try {
    const session = await auth();
    console.log("Verificação de autenticação:", { 
      hasSession: !!session,
      sessionData: session ? JSON.stringify(session).substring(0, 100) + '...' : 'null'
    });
    return !!session;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

// Função para definir um cookie de sessão manualmente
function setSessionCookie(code: string, state: string) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('next-auth.session-token');
    
    if (!sessionCookie) {
      console.log("Definindo cookie de sessão manual");
      cookieStore.set('next-auth.callback-url', '/profile', { 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } else {
      console.log("Cookie de sessão já existe:", sessionCookie.name);
    }
  } catch (error) {
    console.error("Erro ao definir cookie de sessão:", error);
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
    
    // Extrair callbackUrl do state, se disponível
    let callbackUrl = '/profile';
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        // Verificar o formato do state (novo ou antigo)
        if (stateData.callbackUrl) {
          callbackUrl = stateData.callbackUrl;
          console.log("CallbackUrl extraído do state (formato antigo):", callbackUrl);
        } else if (stateData.cb) {
          callbackUrl = stateData.cb;
          console.log("CallbackUrl extraído do state (formato novo):", callbackUrl);
        }
      } catch (e) {
        console.error("Erro ao parsear state:", e);
        // Tentar extrair o callbackUrl de outra forma
        try {
          // Algumas vezes o state pode estar em um formato diferente
          const stateStr = decodeURIComponent(state);
          if (stateStr.includes('profile')) {
            callbackUrl = '/profile';
            console.log("CallbackUrl definido como /profile com base no conteúdo do state");
          }
        } catch (e2) {
          console.error("Erro ao tentar extrair callbackUrl alternativo:", e2);
        }
      }
    }
    
    if (code) {
      console.log("Código de autorização recebido do LinkedIn:", code.substring(0, 10) + "...");
      
      try {
        // Definir cookie de sessão manualmente para garantir que o redirecionamento funcione
        setSessionCookie(code, state || '');
        
        console.log("Processando autenticação com NextAuth...");
        
        try {
          // Tentar processar a autenticação com NextAuth
          const response = await auth.handleAuth(request as any, { providerId: 'linkedin' });
          console.log("Autenticação processada com sucesso via NextAuth");
          
          // Verificar se o usuário está autenticado após o processamento
          const authenticated = await isAuthenticated();
          
          // Se o usuário estiver autenticado, redirecionar para o callbackUrl
          if (authenticated) {
            console.log(`Usuário autenticado, redirecionando para: ${callbackUrl}`);
            return createRedirect(callbackUrl);
          }
          
          // Verificar se a resposta é um redirecionamento
          if (response instanceof Response && response.status >= 300 && response.status < 400) {
            const redirectUrl = response.headers.get('location');
            console.log("Redirecionamento detectado para:", redirectUrl);
            
            // Se o redirecionamento não for para o callbackUrl, forçar redirecionamento
            if (redirectUrl && !redirectUrl.includes(callbackUrl)) {
              console.log(`Forçando redirecionamento para: ${callbackUrl}`);
              return createRedirect(callbackUrl);
            }
          }
          
          // Se chegamos aqui, retornar a resposta original
          console.log("Retornando resposta original do NextAuth");
          return response;
        } catch (authError: any) {
          console.error("Erro ao processar autenticação via NextAuth:", authError);
          
          // Se ocorrer um erro NEXT_REDIRECT, extrair a URL de redirecionamento
          if (authError.message === 'NEXT_REDIRECT' && authError.digest) {
            console.log("Erro NEXT_REDIRECT detectado, extraindo URL de redirecionamento");
            
            try {
              // Tentar extrair a URL de redirecionamento do digest
              const digestParts = authError.digest.split(';');
              if (digestParts.length >= 3) {
                const redirectUrl = digestParts[2];
                console.log("URL de redirecionamento extraída:", redirectUrl);
                
                // Verificar se é uma URL do LinkedIn
                if (redirectUrl.includes('linkedin.com')) {
                  console.log("Redirecionando para LinkedIn OAuth");
                  return NextResponse.redirect(redirectUrl, { status: 302 });
                }
              }
            } catch (e) {
              console.error("Erro ao extrair URL de redirecionamento:", e);
            }
          }
          
          // Forçar redirecionamento para o callbackUrl como fallback
          console.log(`Redirecionando para ${callbackUrl} após erro`);
          return createRedirect(callbackUrl);
        }
      } catch (authError: any) {
        console.error("Erro ao processar autenticação:", authError);
        
        // Se o erro for um redirecionamento do NextAuth, verificar se é para /profile
        if (authError.message === 'NEXT_REDIRECT') {
          console.log("Redirecionamento do NextAuth detectado:", authError.digest);
          
          // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
          if (!authError.digest.includes('/profile')) {
            console.log("Redirecionamento não é para /profile, forçando redirecionamento");
            return createRedirect('/profile');
          }
          
          console.log("Permitindo redirecionamento do NextAuth continuar");
          throw authError; // Deixar o NextAuth lidar com o redirecionamento
        }
        
        // Verificar se o usuário está autenticado mesmo após o erro
        const authenticated = await isAuthenticated();
        if (authenticated) {
          console.log("Usuário autenticado apesar do erro, redirecionando para /profile");
          return createRedirect('/profile');
        }
        
        // Outros erros, redirecionar para a página inicial com erro
        console.log("Erro não é um redirecionamento, redirecionando para página inicial com erro");
        return createRedirect('/?auth=failed');
      }
    } else {
      console.error("Nenhum código de autorização recebido do LinkedIn");
      
      // Redirecionar para a página inicial com erro
      return createRedirect('/?error=no_auth_code');
    }
  } catch (error: any) {
    console.error("Erro no callback do LinkedIn:", error);
    
    // Se o erro for um redirecionamento do NextAuth, verificar se é para /profile
    if (error.message === 'NEXT_REDIRECT') {
      console.log("Redirecionamento do NextAuth detectado:", error.digest);
      
      // Se o redirecionamento não for para /profile, forçar redirecionamento para /profile
      if (!error.digest.includes('/profile')) {
        console.log("Redirecionamento não é para /profile, forçando redirecionamento");
        return createRedirect('/profile');
      }
      
      console.log("Permitindo redirecionamento do NextAuth continuar");
      throw error; // Deixar o NextAuth lidar com o redirecionamento
    }
    
    // Verificar se o usuário está autenticado mesmo após o erro
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        console.log("Usuário autenticado apesar do erro, redirecionando para /profile");
        return createRedirect('/profile');
      }
    } catch (e) {
      console.error("Erro ao verificar autenticação após erro:", e);
    }
    
    // Em caso de outros erros, redirecionar para a página inicial com erro
    console.log("Erro não é um redirecionamento, redirecionando para página inicial com erro");
    return createRedirect('/?auth=error');
  }
}
