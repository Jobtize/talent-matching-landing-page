import { NextRequest, NextResponse } from 'next/server'

// Função simples para debug
function logDebug(message: string, data?: any) {
  console.log(`[Auth Verify Debug] ${message}`, data || '')
}

export async function GET(request: NextRequest) {
  logDebug('Verificando autenticação')
  
  try {
    // Obter o token do cabeçalho de autorização
    const authHeader = request.headers.get('authorization')
    logDebug('Cabeçalho de autorização', { authHeader: authHeader ? 'presente' : 'ausente' })
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logDebug('Token ausente ou formato inválido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    logDebug('Token extraído', { token: token ? 'presente' : 'ausente' })
    
    // Verificar se o token existe nos cookies
    const cookies = request.cookies
    const authCookie = cookies.get('auth_token')
    
    logDebug('Cookie de autenticação', { 
      cookie: authCookie ? 'presente' : 'ausente',
      cookieValue: authCookie?.value,
      tokenMatch: authCookie?.value === token
    })
    
    // Para fins de demonstração, vamos considerar o token válido se existir
    // Em produção, você deve verificar a validade do token (JWT, etc.)
    if (token) {
      // Obter dados do usuário do cookie user_data
      const userDataCookie = cookies.get('user_data')
      let userData = null
      
      if (userDataCookie) {
        try {
          userData = JSON.parse(userDataCookie.value)
          logDebug('Dados do usuário encontrados', userData)
        } catch (error) {
          logDebug('Erro ao analisar dados do usuário', { error })
        }
      }
      
      // Se não houver dados do usuário, criar um usuário fictício para teste
      if (!userData) {
        userData = {
          id: '123',
          name: 'Usuário de Teste',
          email: 'teste@example.com',
          profilePicture: ''
        }
        logDebug('Usando dados de usuário fictício', userData)
      }
      
      return NextResponse.json({ 
        authenticated: true,
        user: userData
      })
    }
    
    logDebug('Token inválido')
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  } catch (error) {
    logDebug('Erro ao verificar autenticação', { error })
    return NextResponse.json({ error: 'Erro ao verificar autenticação' }, { status: 500 })
  }
}

