import { NextRequest, NextResponse } from 'next/server'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const LINKEDIN_REDIRECT_URI = `${SITE_URL}/api/auth/linkedin/callback`;

const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USER_INFO_URL = 'https://api.linkedin.com/v2/userinfo';

function assertEnv() {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !SITE_URL) {
    throw new Error('Missing required envs: LINKEDIN_CLIENT_ID/SECRET and NEXT_PUBLIC_SITE_URL');
  }
}

export async function GET(request: NextRequest) {
  assertEnv();

  // 1) Parse params
  const sp = request.nextUrl.searchParams;
  const code = sp.get('code');
  const state = sp.get('state');

  // 2) Validate state (anti-CSRF) e limpar
  const storedState = request.cookies.get('linkedin_oauth_state')?.value;
  if (!code) return NextResponse.redirect(`${SITE_URL}/?error=missing_code`);
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${SITE_URL}/?error=invalid_state`);
  }

  try {
    // 3) Troca código por token (server-to-server)
    const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
      cache: 'no-store',
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text().catch(() => '');
      console.error('LinkedIn token exchange failed', tokenRes.status, txt);
      return NextResponse.redirect(`${SITE_URL}/?error=token_exchange_failed`);
    }

    const { access_token, expires_in /*, id_token*/ } = await tokenRes.json();

    // 4) Buscar perfil OIDC (requer scopes: openid profile email)
    const userInfoRes = await fetch(LINKEDIN_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    });

    if (!userInfoRes.ok) {
      const txt = await userInfoRes.text().catch(() => '');
      console.error('LinkedIn userinfo failed', userInfoRes.status, txt);
      return NextResponse.redirect(`${SITE_URL}/?error=user_info_failed`);
    }

    const user = await userInfoRes.json();
    // Opcional: validar id_token/nonce com `jose` (recomendado se usar OIDC).

    // 5) Criar/atualizar usuário e emitir sessão server-side
    const createUserRes = await fetch(`${SITE_URL}/api/auth/linkedin-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Envie só o necessário; nunca confie em campos client-side
      body: JSON.stringify({
        linkedinId: user.sub,
        email: user.email,
        name: user.name,
        firstName: user.given_name,
        lastName: user.family_name,
        profilePicture: user.picture,
      }),
      cache: 'no-store',
    });

    if (!createUserRes.ok) {
      const txt = await createUserRes.text().catch(() => '');
      console.error('Create/update user failed', createUserRes.status, txt);
      return NextResponse.redirect(`${SITE_URL}/?error=user_creation_failed`);
    }

    const { token /* JWT da sua API */, user: savedUser } = await createUserRes.json();

    // 6) Resposta: set cookie httpOnly + limpeza de state + redirect
    // Usar o caminho absoluto para o redirecionamento
    const res = NextResponse.redirect(new URL('/profile', SITE_URL).toString(), { status: 302 });
    // Cookie de sessão (JWT ou session-id)
    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Apenas secure em produção
      sameSite: 'lax', // Alterado para lax para permitir o redirect do LinkedIn
      path: '/',
      maxAge: Math.min(Number(expires_in ?? 3600), 60 * 60 * 24 * 7), // cap em 7d
    });

    // Remover o state
    res.cookies.set({
      name: 'linkedin_oauth_state',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Apenas secure em produção
      sameSite: 'lax', // Alterado para lax para permitir o redirect do LinkedIn
      path: '/',
      maxAge: 0,
    });

    // Evitar cache intermediário
    res.headers.set('Cache-Control', 'no-store');

    return res;
  } catch (err) {
    console.error('LinkedIn callback error', err);
    return NextResponse.redirect(`${SITE_URL}/?error=internal_auth_error`);
  }
}
