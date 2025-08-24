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
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    
    // Verificar se o token existe nos cookies
    const cookies = request.cookies
    const authCookie = cookies.get('auth_token')
    
    logDebug('Verificação de autenticação', { 
      authHeader: authHeader ? 'presente' : 'ausente',
      token: token ? 'presente' : 'ausente',
      authCookie: authCookie ? 'presente' : 'ausente'
    })
    
    // Se não há token nem cookie, não está autenticado
    if (!token && !authCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    // Usar o token do header ou do cookie
    const authToken = token || authCookie?.value
    
    // Em uma implementação real, aqui você verificaria o JWT ou consultaria
    // o banco de dados para obter os dados do usuário associados ao token
    
    // Simulação: Decodificar o JWT ou buscar dados do usuário
    // Nota: Em produção, use uma biblioteca como jose para verificar o JWT
    // ou consulte seu banco de dados usando o token como chave
    
    // Exemplo simplificado para demonstração:
    const userData = {
      id: '123',
      name: 'Usuário Exemplo',
      email: 'usuario@exemplo.com',
      profilePicture: 'https://via.placeholder.com/150'
    }
    
    // Configurar cabeçalhos para evitar cache
    const response = NextResponse.json({ 
      authenticated: true,
      user: userData
    })
    
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    return response
  } catch (error) {
    logDebug('Erro ao verificar autenticação', { error })
    return NextResponse.json({ authenticated: false, error: 'Erro interno' }, { status: 500 })
  }
}

