import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Chave secreta para assinar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validar dados necessários
    if (!userData.linkedinId || !userData.email) {
      return NextResponse.json(
        { error: 'Dados de usuário incompletos' },
        { status: 400 }
      )
    }
    
    // Aqui você implementaria a lógica para criar ou atualizar o usuário no seu banco de dados
    // Por enquanto, vamos simular isso retornando os dados do usuário
    
    // Exemplo: verificar se o usuário já existe
    // const existingUser = await db.users.findUnique({ where: { email: userData.email } })
    
    // Exemplo: criar ou atualizar usuário
    // const user = existingUser 
    //   ? await db.users.update({ where: { id: existingUser.id }, data: { ...userData } })
    //   : await db.users.create({ data: { ...userData } })
    
    // Simular usuário criado/atualizado
    const user = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
      token,
    })
  } catch (error) {
    console.error('Erro ao processar usuário do LinkedIn:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

