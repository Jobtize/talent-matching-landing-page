import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Chave secreta para assinar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validar dados necessários
    if (!userData.nome || !userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Dados de usuário incompletos' },
        { status: 400 }
      )
    }
    
    // Verificar se o email já está em uso
    // Aqui você implementaria a verificação no seu banco de dados
    // const existingUser = await db.users.findUnique({ where: { email: userData.email } })
    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: 'Este email já está em uso' },
    //     { status: 409 }
    //   )
    // }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Criar usuário no banco de dados
    // Aqui você implementaria a criação do usuário no seu banco de dados
    // const user = await db.users.create({
    //   data: {
    //     name: userData.nome,
    //     email: userData.email,
    //     password: hashedPassword,
    //     // outros campos...
    //   }
    // })
    
    // Simular usuário criado
    const user = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: userData.nome,
      email: userData.email,
      password: hashedPassword,
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
    
    // Criar candidato associado ao usuário
    // Aqui você implementaria a criação do candidato no seu banco de dados
    // const candidate = await db.candidates.create({
    //   data: {
    //     userId: user.id,
    //     nome: userData.nome,
    //     email: userData.email,
    //     telefone: userData.telefone,
    //     cargo: userData.cargo,
    //     experiencia: userData.experiencia,
    //     localizacao: userData.localizacao,
    //     areas: userData.areas,
    //     tecnologias: userData.tecnologias?.join(','),
    //   }
    // })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

