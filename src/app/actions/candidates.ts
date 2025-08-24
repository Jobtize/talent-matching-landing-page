'use server'

import { revalidatePath } from 'next/cache'
import { validateFormData } from "@/lib/utils/validation"
import { getClientIP } from "@/lib/utils/ip"
import { checkEmailExists } from "@/lib/database/checkEmail"
import { insertOrUpdateCandidate } from "@/app/api/services/candidate"
import { cookies } from 'next/headers'

export type CandidateFormData = {
  nome: string
  email: string
  telefone: string
  cargo?: string
  experiencia?: string
  localizacao?: string
  areas?: string
  tecnologias: string[] | string
}

export type SubmitResult = {
  success: boolean
  message?: string
  error?: string
  code?: string
  data?: any
  existingData?: any
}

/**
 * Server Action para criar um novo candidato
 */
export async function createCandidate(formData: CandidateFormData): Promise<SubmitResult> {
  try {
    // Validar dados do formulário
    if (!validateFormData(formData)) {
      return { 
        success: false, 
        error: 'Dados inválidos fornecidos',
        code: 'INVALID_DATA'
      }
    }

    // Preparar dados para envio
    const dataToSend = {
      ...formData,
      telefone: typeof formData.telefone === 'string' ? formData.telefone.replace(/\D/g, '') : formData.telefone,
      tecnologias: Array.isArray(formData.tecnologias) ? formData.tecnologias.join(', ') : formData.tecnologias
    }

    // Simular obtenção do IP e User Agent (em Server Actions, precisamos usar headers())
    const userAgent = headers().get('user-agent') || 'unknown'
    
    // Verificar se o email já existe
    const existingCandidate = await checkEmailExists(formData.email)

    if (existingCandidate) {
      return {
        success: false,
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
          created_at: existingCandidate.created_at,
          file_name: existingCandidate.file_name,
          blob_url: existingCandidate.blob_url,
          file_size: existingCandidate.file_size
        },
        message: 'Encontramos um cadastro com este email. Deseja atualizar seus dados?'
      }
    }

    // Obter IP do cliente (simulado em ambiente de desenvolvimento)
    const clientIP = process.env.NODE_ENV === 'development' ? '127.0.0.1' : getClientIP()

    // Inserir candidato no banco de dados
    const result = await insertOrUpdateCandidate(dataToSend, clientIP, userAgent)

    // Revalidar o caminho para atualizar os dados em cache
    revalidatePath('/')

    return {
      success: true,
      message: 'Candidato cadastrado com sucesso!',
      data: {
        id: result.candidateId,
        nome: result.candidateName,
        email: result.candidateEmail,
        tecnologias_inseridas: result.technologiesCount
      }
    }
  } catch (error: unknown) {
    console.error('Erro ao cadastrar candidato:', error)

    // Erro de email duplicado
    if (error instanceof Error && error.message?.includes('UNIQUE KEY constraint') && error.message?.includes('email')) {
      return { 
        success: false,
        error: 'Este email já está cadastrado em nossa base de dados.', 
        code: 'EMAIL_ALREADY_EXISTS' 
      }
    }

    // Erros de conexão com banco de dados
    if (error instanceof Error && (
      error.message?.includes('ConnectionError') || 
      error.message?.includes('timeout') ||
      error.message?.includes('No connection is specified') ||
      error.message?.includes('ENOCONN') ||
      error.message?.includes('Variáveis de ambiente do banco de dados não configuradas') ||
      error.message?.includes('Falha na conexão com o banco de dados')
    )) {
      return { 
        success: false,
        error: 'Erro de conexão com o banco de dados. Verifique a configuração e tente novamente.', 
        code: 'DATABASE_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }

    // Erro genérico
    return { 
      success: false,
      error: 'Erro interno do servidor. Tente novamente mais tarde.', 
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }
  }
}

/**
 * Server Action para atualizar um candidato existente
 */
export async function updateCandidate(formData: CandidateFormData): Promise<SubmitResult> {
  try {
    // Validar dados do formulário
    if (!validateFormData(formData)) {
      return { 
        success: false, 
        error: 'Dados inválidos fornecidos',
        code: 'INVALID_DATA'
      }
    }

    // Preparar dados para envio
    const dataToSend = {
      ...formData,
      telefone: typeof formData.telefone === 'string' ? formData.telefone.replace(/\D/g, '') : formData.telefone,
      tecnologias: Array.isArray(formData.tecnologias) ? formData.tecnologias.join(', ') : formData.tecnologias
    }

    // Simular obtenção do IP e User Agent
    const userAgent = headers().get('user-agent') || 'unknown'
    
    // Verificar se o email existe
    const existingCandidate = await checkEmailExists(formData.email)

    if (!existingCandidate) {
      return { 
        success: false, 
        error: 'Candidato não encontrado com este email.', 
        code: 'CANDIDATE_NOT_FOUND' 
      }
    }

    // Obter IP do cliente (simulado em ambiente de desenvolvimento)
    const clientIP = process.env.NODE_ENV === 'development' ? '127.0.0.1' : getClientIP()

    // Atualizar candidato no banco de dados
    const result = await insertOrUpdateCandidate(dataToSend, clientIP, userAgent, existingCandidate.id)

    // Revalidar o caminho para atualizar os dados em cache
    revalidatePath('/')

    return {
      success: true,
      message: 'Dados atualizados com sucesso!',
      data: {
        id: result.candidateId,
        nome: result.candidateName,
        email: result.candidateEmail,
        tecnologias_inseridas: result.technologiesCount,
        action: 'updated'
      }
    }
  } catch (error: unknown) {
    console.error('Erro ao atualizar candidato:', error)

    // Erros de conexão com banco de dados
    if (error instanceof Error && (
      error.message?.includes('ConnectionError') || 
      error.message?.includes('timeout') ||
      error.message?.includes('No connection is specified') ||
      error.message?.includes('ENOCONN') ||
      error.message?.includes('Variáveis de ambiente do banco de dados não configuradas') ||
      error.message?.includes('Falha na conexão com o banco de dados')
    )) {
      return { 
        success: false,
        error: 'Erro de conexão com o banco de dados. Verifique a configuração e tente novamente.', 
        code: 'DATABASE_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }

    // Erro genérico
    return { 
      success: false,
      error: 'Erro interno do servidor. Tente novamente mais tarde.', 
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }
  }
}

