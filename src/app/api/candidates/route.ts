import { NextRequest, NextResponse } from 'next/server';
import {validateFormData} from "@/lib/utils/validation";
import {getClientIP} from "@/lib/utils/ip";
import {checkEmailExists} from "@/lib/database/checkEmail";
import {insertOrUpdateCandidate} from "@/app/api/services/candidate";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateFormData(body)) {
      return NextResponse.json({ error: 'Dados inválidos fornecidos' }, { status: 400 });
    }

    const formData = body;
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

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
          created_at: existingCandidate.created_at
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

    if (error instanceof Error && error.message?.includes('UNIQUE KEY constraint') && error.message?.includes('email')) {
      return NextResponse.json({ error: 'Este email já está cadastrado em nossa base de dados.', code: 'EMAIL_ALREADY_EXISTS' }, { status: 409 });
    }

    if (error instanceof Error && (error.message?.includes('ConnectionError') || error.message?.includes('timeout'))) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.', code: 'DATABASE_CONNECTION_ERROR' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Erro interno do servidor. Tente novamente mais tarde.', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateFormData(body)) {
      return NextResponse.json({ error: 'Dados inválidos fornecidos' }, { status: 400 });
    }

    const formData = body;
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

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

    if (error instanceof Error && (error.message?.includes('ConnectionError') || error.message?.includes('timeout'))) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.', code: 'DATABASE_CONNECTION_ERROR' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Erro interno do servidor. Tente novamente mais tarde.', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
