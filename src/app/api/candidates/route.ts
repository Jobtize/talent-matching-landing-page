import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'
import { executeTransaction } from '@/lib/database'

// Interface para os dados do formulário
interface FormData {
  nome: string
  email: string
  telefone: string
  cargo: string
  experiencia: string
  localizacao: string
  areas: string
  tecnologias: string
}

// Validação básica dos dados
function validateFormData(data: unknown): data is FormData {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  
  const obj = data as Record<string, unknown>
  
  return (
    typeof obj.nome === 'string' && obj.nome.trim().length > 0 &&
    typeof obj.email === 'string' && obj.email.includes('@') &&
    typeof obj.telefone === 'string' &&
    typeof obj.cargo === 'string' &&
    typeof obj.experiencia === 'string' &&
    typeof obj.localizacao === 'string' &&
    typeof obj.areas === 'string' &&
    typeof obj.tecnologias === 'string'
  )
}

// Função para extrair tecnologias do texto
function parseTechnologies(tecnologiasText: string): string[] {
  if (!tecnologiasText.trim()) return []
  
  return tecnologiasText
    .split(/[,;|\n]/) // Split por vírgula, ponto-e-vírgula, pipe ou quebra de linha
    .map(tech => tech.trim())
    .filter(tech => tech.length > 0)
    .slice(0, 50) // Limita a 50 tecnologias para evitar spam
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Função para verificar se email já existe
async function checkEmailExists(email: string) {
  const request = new sql.Request()
  request.input('email', sql.NVarChar(255), email.toLowerCase().trim())
  
  const result = await request.query(`
    SELECT id, nome, email, telefone, cargo, experiencia, localizacao, areas, tecnologias, created_at
    FROM candidates 
    WHERE email = @email
  `)
  
  return result.recordset.length > 0 ? result.recordset[0] : null
}

// Função para atualizar candidato existente
async function updateCandidate(candidateId: number, formData: FormData, clientIP: string, userAgent: string) {
  return await executeTransaction(async (transaction) => {
    // 1. Atualizar dados do candidato
    const candidateRequest = new sql.Request(transaction)
    candidateRequest.input('id', sql.Int, candidateId)
    candidateRequest.input('nome', sql.NVarChar(100), formData.nome.trim())
    candidateRequest.input('telefone', sql.NVarChar(30), formData.telefone.trim() || null)
    candidateRequest.input('cargo', sql.NVarChar(100), formData.cargo.trim() || null)
    candidateRequest.input('experiencia', sql.NVarChar(50), formData.experiencia.trim() || null)
    candidateRequest.input('localizacao', sql.NVarChar(100), formData.localizacao.trim() || null)
    candidateRequest.input('areas', sql.NVarChar(500), formData.areas.trim() || null)
    candidateRequest.input('tecnologias', sql.NText, formData.tecnologias.trim() || null)
    
    const candidateResult = await candidateRequest.query(`
      UPDATE candidates 
      SET nome = @nome, telefone = @telefone, cargo = @cargo, 
          experiencia = @experiencia, localizacao = @localizacao, 
          areas = @areas, tecnologias = @tecnologias, updated_at = GETDATE()
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email
      WHERE id = @id
    `)
    
    const updatedCandidate = candidateResult.recordset[0]
    
    // 2. Remover tecnologias antigas
    const deleteTechRequest = new sql.Request(transaction)
    deleteTechRequest.input('candidate_id', sql.Int, candidateId)
    await deleteTechRequest.query(`
      DELETE FROM candidate_technologies WHERE candidate_id = @candidate_id
    `)
    
    // 3. Inserir novas tecnologias
    const technologies = parseTechnologies(formData.tecnologias)
    const insertedTechnologies: string[] = []
    
    for (const tech of technologies) {
      try {
        const techRequest = new sql.Request(transaction)
        techRequest.input('candidate_id', sql.Int, candidateId)
        techRequest.input('technology_name', sql.NVarChar(100), tech)
        
        await techRequest.query(`
          INSERT INTO candidate_technologies (candidate_id, technology_name)
          VALUES (@candidate_id, @technology_name)
        `)
        
        insertedTechnologies.push(tech)
      } catch (error: unknown) {
        // Ignora erros de duplicação
        if (error instanceof Error && !error.message?.includes('UQ_candidate_technology')) {
          throw error
        }
      }
    }
    
    // 4. Inserir log de auditoria
    const logRequest = new sql.Request(transaction)
    logRequest.input('candidate_id', sql.Int, candidateId)
    logRequest.input('action', sql.NVarChar(50), 'UPDATE')
    logRequest.input('details', sql.NVarChar(500), `Candidato atualizado via formulário web. Tecnologias: ${insertedTechnologies.length}`)
    logRequest.input('ip_address', sql.NVarChar(45), clientIP)
    logRequest.input('user_agent', sql.NVarChar(500), userAgent.substring(0, 500))
    logRequest.input('performed_by', sql.NVarChar(100), 'web_form')
    
    await logRequest.query(`
      INSERT INTO candidate_logs (candidate_id, action, details, ip_address, user_agent, performed_by)
      VALUES (@candidate_id, @action, @details, @ip_address, @user_agent, @performed_by)
    `)
    
    return {
      candidateId: updatedCandidate.id,
      candidateName: updatedCandidate.nome,
      candidateEmail: updatedCandidate.email,
      technologiesCount: insertedTechnologies.length,
      technologies: insertedTechnologies
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse do body da requisição
    const body = await request.json()
    
    // Validação dos dados
    if (!validateFormData(body)) {
      return NextResponse.json(
        { error: 'Dados inválidos fornecidos' },
        { status: 400 }
      )
    }
    
    const formData: FormData = body
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Verificar se email já existe
    const existingCandidate = await checkEmailExists(formData.email)
    
    if (existingCandidate) {
      return NextResponse.json({
        error: 'Email já cadastrado',
        code: 'EMAIL_ALREADY_EXISTS',
        existingData: {
          nome: existingCandidate.nome,
          email: existingCandidate.email,
          telefone: existingCandidate.telefone,
          cargo: existingCandidate.cargo,
          experiencia: existingCandidate.experiencia,
          localizacao: existingCandidate.localizacao,
          areas: existingCandidate.areas,
          created_at: existingCandidate.created_at
        },
        message: 'Encontramos um cadastro com este email. Deseja atualizar seus dados?'
      }, { status: 409 })
    }
    
    // Executa a transação para inserir todos os dados
    const result = await executeTransaction(async (transaction) => {
      // 1. Inserir o candidato
      const candidateRequest = new sql.Request(transaction)
      candidateRequest.input('nome', sql.NVarChar(100), formData.nome.trim())
      candidateRequest.input('email', sql.NVarChar(255), formData.email.toLowerCase().trim())
      candidateRequest.input('telefone', sql.NVarChar(30), formData.telefone.trim() || null)
      candidateRequest.input('cargo', sql.NVarChar(100), formData.cargo.trim() || null)
      candidateRequest.input('experiencia', sql.NVarChar(50), formData.experiencia.trim() || null)
      candidateRequest.input('localizacao', sql.NVarChar(100), formData.localizacao.trim() || null)
      candidateRequest.input('areas', sql.NVarChar(500), formData.areas.trim() || null)
      candidateRequest.input('tecnologias', sql.NText, formData.tecnologias.trim() || null)
      
      const candidateResult = await candidateRequest.query(`
        INSERT INTO candidates (nome, email, telefone, cargo, experiencia, localizacao, areas, tecnologias)
        OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email
        VALUES (@nome, @email, @telefone, @cargo, @experiencia, @localizacao, @areas, @tecnologias)
      `)
      
      const candidateId = candidateResult.recordset[0].id
      const candidateName = candidateResult.recordset[0].nome
      const candidateEmail = candidateResult.recordset[0].email
      
      // 2. Inserir tecnologias (se houver)
      const technologies = parseTechnologies(formData.tecnologias)
      const insertedTechnologies: string[] = []
      
      for (const tech of technologies) {
        try {
          const techRequest = new sql.Request(transaction)
          techRequest.input('candidate_id', sql.Int, candidateId)
          techRequest.input('technology_name', sql.NVarChar(100), tech)
          
          await techRequest.query(`
            INSERT INTO candidate_technologies (candidate_id, technology_name)
            VALUES (@candidate_id, @technology_name)
          `)
          
          insertedTechnologies.push(tech)
        } catch (error: unknown) {
          // Ignora erros de duplicação (constraint violation)
          if (error instanceof Error && !error.message?.includes('UQ_candidate_technology')) {
            throw error
          }
        }
      }
      
      // 3. Inserir log de auditoria
      const logRequest = new sql.Request(transaction)
      logRequest.input('candidate_id', sql.Int, candidateId)
      logRequest.input('action', sql.NVarChar(50), 'CREATE')
      logRequest.input('details', sql.NVarChar(500), `Candidato criado via formulário web. Tecnologias: ${insertedTechnologies.length}`)
      logRequest.input('ip_address', sql.NVarChar(45), clientIP)
      logRequest.input('user_agent', sql.NVarChar(500), userAgent.substring(0, 500))
      logRequest.input('performed_by', sql.NVarChar(100), 'web_form')
      
      await logRequest.query(`
        INSERT INTO candidate_logs (candidate_id, action, details, ip_address, user_agent, performed_by)
        VALUES (@candidate_id, @action, @details, @ip_address, @user_agent, @performed_by)
      `)
      
      return {
        candidateId,
        candidateName,
        candidateEmail,
        technologiesCount: insertedTechnologies.length,
        technologies: insertedTechnologies
      }
    })
    
    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Candidato cadastrado com sucesso!',
      data: {
        id: result.candidateId,
        nome: result.candidateName,
        email: result.candidateEmail,
        tecnologias_inseridas: result.technologiesCount
      }
    }, { status: 201 })
    
  } catch (error: unknown) {
    console.error('Erro ao cadastrar candidato:', error)
    
    // Tratamento específico para erros de duplicação de email
    if (error instanceof Error && error.message?.includes('UNIQUE KEY constraint') && error.message?.includes('email')) {
      return NextResponse.json(
        { 
          error: 'Este email já está cadastrado em nossa base de dados.',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        { status: 409 }
      )
    }
    
    // Tratamento para erros de conexão com banco
    if (error instanceof Error && (error.message?.includes('ConnectionError') || error.message?.includes('timeout'))) {
      return NextResponse.json(
        { 
          error: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.',
          code: 'DATABASE_CONNECTION_ERROR'
        },
        { status: 503 }
      )
    }
    
    // Erro genérico
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse do body da requisição
    const body = await request.json()
    
    // Validação dos dados
    if (!validateFormData(body)) {
      return NextResponse.json(
        { error: 'Dados inválidos fornecidos' },
        { status: 400 }
      )
    }
    
    const formData: FormData = body
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Verificar se email existe
    const existingCandidate = await checkEmailExists(formData.email)
    
    if (!existingCandidate) {
      return NextResponse.json(
        { 
          error: 'Candidato não encontrado com este email.',
          code: 'CANDIDATE_NOT_FOUND'
        },
        { status: 404 }
      )
    }
    
    // Atualizar candidato existente
    const result = await updateCandidate(existingCandidate.id, formData, clientIP, userAgent)
    
    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Dados atualizados com sucesso!',
      data: {
        id: result.candidateId,
        nome: result.candidateName,
        email: result.candidateEmail,
        tecnologias_inseridas: result.technologiesCount,
        action: 'updated'
      }
    }, { status: 200 })
    
  } catch (error: unknown) {
    console.error('Erro ao atualizar candidato:', error)
    
    // Tratamento para erros de conexão com banco
    if (error instanceof Error && (error.message?.includes('ConnectionError') || error.message?.includes('timeout'))) {
      return NextResponse.json(
        { 
          error: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.',
          code: 'DATABASE_CONNECTION_ERROR'
        },
        { status: 503 }
      )
    }
    
    // Erro genérico
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}
