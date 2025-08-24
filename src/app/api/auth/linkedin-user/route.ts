import { NextRequest, NextResponse } from 'next/server'

// Função para gerar um token JWT simples
// Em produção, use uma biblioteca como jose para gerar tokens seguros
function generateToken(userId: string): string {
  // Simulação simples - em produção, use uma biblioteca adequada
  return `simulated-jwt-token-${userId}-${Date.now()}`
}

export async function POST(request: NextRequest) {
  try {
    // Obter dados do usuário do LinkedIn
    const userData = await request.json()
    
    // Validar dados necessários
    if (!userData.linkedinId) {
      return NextResponse.json(
        { error: 'ID do LinkedIn é obrigatório' },
        { status: 400 }
      )
    }
    
    // Em uma implementação real, você salvaria esses dados no banco de dados
    // e criaria ou atualizaria o usuário
    
    // Simulação: Criar ou atualizar usuário
    const user = {
      id: userData.linkedinId,
      name: userData.name || 'Usuário LinkedIn',
      email: userData.email || 'usuario@linkedin.com',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      profilePicture: userData.profilePicture || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Gerar token de autenticação
    const token = generateToken(user.id)
    
    // Retornar usuário e token
    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error('Erro ao processar usuário do LinkedIn:', error)
    return NextResponse.json(
      { error: 'Erro ao processar usuário' },
      { status: 500 }
    )
  }
}

