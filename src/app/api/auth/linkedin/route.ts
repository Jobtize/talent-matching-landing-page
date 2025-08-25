import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// Função para criar URL de autenticação do LinkedIn diretamente
function createLinkedInAuthUrl(callbackUrl: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/callback/linkedin`);
  const scope = encodeURIComponent('openid profile email r_1st_connections_size r_basicprofile');
  const state = encodeURIComponent(JSON.stringify({ callbackUrl }));
  
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
}

// Redirecionar para o fluxo de autenticação do LinkedIn
export async function GET(request: NextRequest) {
  try {
    // Obter a URL de callback da query string ou usar /profile como padrão
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/profile';
    
    console.log("Iniciando autenticação LinkedIn com callbackUrl:", callbackUrl);
    
    // Verificar se o usuário já está autenticado
    const session = await auth();
    if (session) {
      console.log("Usuário já autenticado, redirecionando para:", callbackUrl);
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
      return NextResponse.redirect(`${baseUrl}${callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`}`);
    }
    
    // Criar URL de autenticação do LinkedIn diretamente
    const authUrl = createLinkedInAuthUrl(callbackUrl);
    console.log("Redirecionando para LinkedIn OAuth:", authUrl.substring(0, 100) + "...");
    
    // Redirecionar para a URL de autenticação do LinkedIn
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    // Usar URL absoluta para redirecionamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    return NextResponse.redirect(`${baseUrl}/?error=auth_init_failed`);
  }
}
