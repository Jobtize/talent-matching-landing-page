import { NextResponse } from 'next/server'

// Configurações do LinkedIn OAuth
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77isdg42ka2p5g'
// Usar URL absoluta para o redirecionamento
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin/callback` 
  : 'http://localhost:3000/api/auth/linkedin/callback'
const LINKEDIN_SCOPE = 'openid profile email'

// Endpoint de autorização do LinkedIn
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'

export async function GET() {
  // Gerar um estado aleatório para segurança
  const state = Math.random().toString(36).substring(2, 15)
  
  // Construir URL de autorização
  const authUrl = new URL(LINKEDIN_AUTH_URL)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI)
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('scope', LINKEDIN_SCOPE)
  
  // Armazenar o estado em um cookie para validação posterior
  const headers = new Headers()
  headers.append('Set-Cookie', `linkedin_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`)
  
  // Redirecionar para a página de autorização do LinkedIn
  return NextResponse.redirect(authUrl.toString(), {
    headers
  })
}
