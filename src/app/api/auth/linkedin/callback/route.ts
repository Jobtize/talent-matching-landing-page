import { NextRequest, NextResponse } from 'next/server'

// Configurações do LinkedIn OAuth
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77isdg42ka2p5g'
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.ODmhmSDjd6A86EXm.1p3AsQ=='
// Usar URL absoluta para o redirecionamento
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin/callback` 
  : 'http://localhost:3002/api/auth/linkedin/callback'

// Endpoint de token do LinkedIn
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_USER_INFO_URL = 'https://api.linkedin.com/v2/userinfo'

// Função simples para debug
function logDebug(message: string, data?: any) {
  console.log(`[LinkedIn Callback Debug] ${message}`, data || '')
}

export async function GET(request: NextRequest) {
  logDebug('Callback iniciado', { url: request.url })
  // Obter o código de autorização e o estado da URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  // Obter o estado armazenado no cookie
  const cookies = request.cookies
  const storedState = cookies.get('linkedin_oauth_state')?.value
  
  // Verificar se o código e o estado são válidos
  logDebug('Verificando código e estado', { code: !!code, state, storedState })
  
  if (!code) {
    logDebug('Código ausente, redirecionando para erro')
    return NextResponse.redirect(new URL('/?error=missing_code', request.url))
  }
  
  if (!state || state !== storedState) {
    logDebug('Estado inválido, redirecionando para erro', { state, storedState })
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }
  
  logDebug('Código e estado válidos, prosseguindo')
  
  try {
    // Trocar o código de autorização por um token de acesso
    logDebug('Iniciando troca de código por token', { 
      redirect_uri: LINKEDIN_REDIRECT_URI 
    })
    
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    })
    
    logDebug('Resposta da troca de token recebida', { 
      status: tokenResponse.status,
      ok: tokenResponse.ok 
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Erro ao obter token do LinkedIn:', errorData)
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }
    
    const tokenData = await tokenResponse.json()
    const { access_token, id_token } = tokenData
    
    // Obter informações do usuário
    const userInfoResponse = await fetch(LINKEDIN_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    
    if (!userInfoResponse.ok) {
      console.error('Erro ao obter informações do usuário:', await userInfoResponse.text())
      return NextResponse.redirect(new URL('/?error=user_info_failed', request.url))
    }
    
    const userData = await userInfoResponse.json()
    
    // Criar ou atualizar o usuário no banco de dados
    const createUserResponse = await fetch(new URL('/api/auth/linkedin-user', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkedinId: userData.sub,
        email: userData.email,
        name: userData.name,
        firstName: userData.given_name,
        lastName: userData.family_name,
        profilePicture: userData.picture,
      }),
    })
    
    if (!createUserResponse.ok) {
      console.error('Erro ao criar/atualizar usuário:', await createUserResponse.text())
      return NextResponse.redirect(new URL('/?error=user_creation_failed', request.url))
    }
    
    const userResult = await createUserResponse.json()
    
    // Redirecionar para a página de perfil usando URL absoluta
    const baseUrl = request.nextUrl.origin
    
    // Criar HTML para definir localStorage e redirecionar
    const userData = {
      id: userResult.user.id,
      name: userResult.user.name,
      email: userResult.user.email,
      profilePicture: userResult.user.profilePicture,
    };
    
    const userDataJson = JSON.stringify(userData).replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecionando...</title>
          <meta charset="utf-8">
          <script>
            // Função para verificar se o localStorage está disponível
            function isLocalStorageAvailable() {
              try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
              } catch(e) {
                return false;
              }
            }
            
            // Armazenar token e dados do usuário no localStorage
            function saveAuthData() {
              try {
                if (isLocalStorageAvailable()) {
                  localStorage.setItem('auth_token', '${userResult.token}');
                  localStorage.setItem('user_data', "${userDataJson}");
                  console.log('Dados salvos no localStorage com sucesso');
                  return true;
                } else {
                  console.error('localStorage não está disponível');
                  return false;
                }
              } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
                return false;
              }
            }
            
            // Tentar salvar os dados
            const saved = saveAuthData();
            console.log('Status do salvamento:', saved ? 'sucesso' : 'falha');
            
            // Redirecionar para a página de perfil após um pequeno delay
            setTimeout(function() {
              window.location.href = '${baseUrl}/profile';
            }, 500);
          </script>
        </head>
        <body>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
            <h2>Login realizado com sucesso!</h2>
            <p>Redirecionando para a página de perfil...</p>
            <div style="margin-top: 20px; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        </body>
      </html>
    `;
    
    // Retornar HTML em vez de redirecionamento direto
    const response = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
    // Definir cookies de autenticação (token JWT, etc.)
    response.cookies.set({
      name: 'auth_token',
      value: userResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
    
    // Armazenar dados do usuário no cookie não-httpOnly
    response.cookies.set({
      name: 'user_data',
      value: JSON.stringify({
        id: userResult.user.id,
        name: userResult.user.name,
        email: userResult.user.email,
        profilePicture: userResult.user.profilePicture,
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
    
    // Limpar o cookie de estado
    response.cookies.set({
      name: 'linkedin_oauth_state',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    
    return response
  } catch (error) {
    console.error('Erro no processo de autenticação do LinkedIn:', error)
    logDebug('Erro capturado no try/catch', { error: error instanceof Error ? error.message : String(error) })
    
    // Responder com uma página HTML simples em vez de redirecionar
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Erro de Autenticação</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .error-container { max-width: 600px; margin: 0 auto; }
            .error-title { color: #e74c3c; }
            .error-message { margin: 20px 0; }
            .home-link { display: inline-block; margin-top: 20px; padding: 10px 20px; 
                        background-color: #3498db; color: white; text-decoration: none; 
                        border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1 class="error-title">Erro de Autenticação</h1>
            <p class="error-message">
              Ocorreu um erro durante o processo de autenticação com o LinkedIn.
              Por favor, tente novamente mais tarde.
            </p>
            <a href="/" class="home-link">Voltar para a página inicial</a>
          </div>
          <script>
            // Registrar erro no console do navegador
            console.error("Erro de autenticação do LinkedIn");
            
            // Redirecionar para a página inicial após 5 segundos
            setTimeout(() => {
              window.location.href = "/";
            }, 5000);
          </script>
        </body>
      </html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    )
  }
}
