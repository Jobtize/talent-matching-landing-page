import { NextResponse } from 'next/server'
import { getCandidateById } from '@/lib/data/candidates'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obter ID do candidato diretamente dos parâmetros da rota
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do candidato não fornecido' },
        { status: 400 }
      )
    }
    
    // Buscar candidato usando a função cacheada
    const candidate = await getCandidateById(id)
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }
    
    // Retornar dados do candidato
    return NextResponse.json({
      success: true,
      data: candidate
    })
  } catch (error) {
    console.error('Erro ao buscar candidato:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obter ID do candidato diretamente dos parâmetros da rota
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do candidato não fornecido' },
        { status: 400 }
      )
    }
    
    // Obter dados do corpo da requisição
    const data = await request.json()
    
    // Validar dados (implementação simplificada)
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Dados de atualização não fornecidos' },
        { status: 400 }
      )
    }
    
    // Aqui você implementaria a lógica para atualizar o candidato no banco de dados
    // Por exemplo: await db.candidates.update({ where: { id }, data })
    
    // Retorno simulado para demonstração
    return NextResponse.json({
      success: true,
      message: `Candidato ${id} atualizado com sucesso`,
      data: {
        id,
        ...data,
        updated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar candidato:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obter ID do candidato diretamente dos parâmetros da rota
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do candidato não fornecido' },
        { status: 400 }
      )
    }
    
    // Aqui você implementaria a lógica para excluir o candidato do banco de dados
    // Por exemplo: await db.candidates.delete({ where: { id } })
    
    // Retorno simulado para demonstração
    return NextResponse.json({
      success: true,
      message: `Candidato ${id} excluído com sucesso`
    })
  } catch (error) {
    console.error('Erro ao excluir candidato:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

