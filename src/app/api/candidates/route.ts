import { NextResponse } from 'next/server';
import { validateFormData, validateFormDataWithErrors } from "@/lib/utils/validation";
import { getClientIP } from "@/lib/utils/ip";
import { checkEmailExists } from "@/lib/database/checkEmail";
import { insertOrUpdateCandidate } from "@/app/api/services/candidate";
import { headers } from 'next/headers';

// Route Handler moderno com tipagem melhorada
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação com feedback de erros detalhados
    const validation = validateFormDataWithErrors(body);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Dados inválidos fornecidos',
        validation_errors: validation.errors
      }, { status: 400 });
    }

    const formData = body;
    
    // Usar headers() API para obter cabeçalhos da requisição
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Obter IP do cliente (em ambiente de desenvolvimento, usar um valor padrão)
    const clientIP = process.env.NODE_ENV === 'development' ? '127.0.0.1' : getClientIP();

    const existingCandidate = await checkEmailExists(formData.email);

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
          created_at: existingCandidate.created_at,
          // Informações do arquivo PDF (se houver)
          file_name: existingCandidate.file_name,
          blob_url: existingCandidate.blob_url,
          file_size: existingCandidate.file_size
        },
        message: 'Encontramos um cadastro com este email. Deseja atualizar seus dados?'
      }, { status: 409 });
    }

    const result = await insertOrUpdateCandidate(formData, clientIP, userAgent);

    return NextResponse.json({
      success: true,
      message: 'Candidato cadastrado com sucesso!',
      data: {
        id: result.candidateId,
        nome: result.candidateName,
        email: result.candidateEmail,
        tecnologias_inseridas: result.technologiesCount
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Erro ao cadastrar candidato:', error);

    // Erro de email duplicado
    if (error instanceof Error && error.message?.includes('UNIQUE KEY constraint') && error.message?.includes('email')) {
      return NextResponse.json({ 
        error: 'Este email já está cadastrado em nossa base de dados.', 
        code: 'EMAIL_ALREADY_EXISTS' 
      }, { status: 409 });
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
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Verifique a configuração e tente novamente.', 
        code: 'DATABASE_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    // Erro genérico
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.', 
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validação com feedback de erros detalhados
    const validation = validateFormDataWithErrors(body);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Dados inválidos fornecidos',
        validation_errors: validation.errors
      }, { status: 400 });
    }

    const formData = body;
    
    // Usar headers() API para obter cabeçalhos da requisição
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Obter IP do cliente (em ambiente de desenvolvimento, usar um valor padrão)
    const clientIP = process.env.NODE_ENV === 'development' ? '127.0.0.1' : getClientIP();

    const existingCandidate = await checkEmailExists(formData.email);

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidato não encontrado com este email.', code: 'CANDIDATE_NOT_FOUND' }, { status: 404 });
    }

    const result = await insertOrUpdateCandidate(formData, clientIP, userAgent, existingCandidate.id);

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
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Erro ao atualizar candidato:', error);

    // Erros de conexão com banco de dados
    if (error instanceof Error && (
      error.message?.includes('ConnectionError') || 
      error.message?.includes('timeout') ||
      error.message?.includes('No connection is specified') ||
      error.message?.includes('ENOCONN') ||
      error.message?.includes('Variáveis de ambiente do banco de dados não configuradas') ||
      error.message?.includes('Falha na conexão com o banco de dados')
    )) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Verifique a configuração e tente novamente.', 
        code: 'DATABASE_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    // Erro genérico
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Tente novamente mais tarde.', 
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
}

// Adicionar método GET para listar candidatos
export async function GET(request: Request) {
  try {
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';
    
    // Aqui você implementaria a lógica para buscar candidatos no banco de dados
    // Por exemplo: await db.candidates.findMany({ 
    //   where: { nome: { contains: search } },
    //   take: limit, 
    //   skip: offset 
    // })
    
    // Retorno simulado para demonstração
    const candidates = Array.from({ length: limit }, (_, i) => ({
      id: i + offset + 1,
      nome: `Candidato ${i + offset + 1}${search ? ` (${search})` : ''}`,
      email: `candidato${i + offset + 1}@exemplo.com`,
      cargo: 'Desenvolvedor',
      created_at: new Date().toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        total: 100, // Total simulado
        limit,
        offset,
        hasMore: offset + limit < 100
      }
    });
  } catch (error) {
    console.error('Erro ao listar candidatos:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

