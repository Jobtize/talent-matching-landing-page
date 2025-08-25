import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Criar resposta
    const response = NextResponse.json({ success: true })
    
    // Limpar cookie de autenticação
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expirar imediatamente
    })
    
    // Evitar cache
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    return response
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

