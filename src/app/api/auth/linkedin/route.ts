import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const LINKEDIN_REDIRECT_URI = `${SITE_URL}/api/auth/linkedin/callback`;

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';

function assertEnv() {
  if (!LINKEDIN_CLIENT_ID || !SITE_URL) {
    throw new Error('Missing required envs: LINKEDIN_CLIENT_ID and NEXT_PUBLIC_SITE_URL');
  }
}

export async function GET(request: NextRequest) {
  assertEnv();

  try {
    // Gerar state para proteção CSRF
    const state = randomBytes(32).toString('hex');
    
    // Construir URL de autorização
    const authUrl = new URL(LINKEDIN_AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'openid profile email');
    
    // Redirecionar para LinkedIn com cookie de state
    const response = NextResponse.redirect(authUrl.toString());
    
    // Definir cookie de state (curto, httpOnly, strict)
    response.cookies.set({
      name: 'linkedin_oauth_state',
      value: state,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 15, // 15 minutos
    });
    
    return response;
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return NextResponse.redirect(`${SITE_URL}/?error=auth_init_failed`);
  }
}

