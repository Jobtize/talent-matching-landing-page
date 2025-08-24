import { NextRequest, NextResponse } from 'next/server'

// Configurações do LinkedIn OAuth
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77isdg42ka2p5g'
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.ODmhmSDjd6A86EXm.1p3AsQ=='
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://127.0.0.1:8000/oidc/callback/'

// Endpoint de token do LinkedIn
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_USER_INFO_URL = 'https://api.linkedin.com/v2/userinfo'

export async function GET(request: NextRequest) {
  // Obter o código de autorização e o estado da URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  // Obter o estado armazenado no cookie
  const cookies = request.cookies
  const storedState = cookies.get('linkedin_oauth_state')?.value
  
  // Verificar se o código e o estado são válidos
  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url))
  }
  
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }
  
  try {
    // Trocar o código de autorização por um token de acesso
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
    
    // Criar cookies de autenticação
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
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
    return NextResponse.redirect(new URL('/?error=authentication_failed', request.url))
  }
}
