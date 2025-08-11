import { NextRequest, NextResponse } from 'next/server';
import { uploadPdfToBlob, ensureContainerExists } from '@/lib/azure-storage';
import { validatePdfFileServer } from '@/lib/utils/file-validation';
import { getPool } from '@/lib/database';
import sql from 'mssql';

/**
 * API Route para upload de PDFs para Azure Blob Storage
 * POST /api/upload-pdf
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se o container existe
    await ensureContainerExists();

    // Obter dados do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const candidateId = formData.get('candidateId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    if (!candidateId) {
      return NextResponse.json(
        { error: 'ID do candidato é obrigatório' },
        { status: 400 }
      );
    }

    // Validação completa no servidor (incluindo magic number)
    const validation = await validatePdfFileServer(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload para Azure Blob Storage
    const uploadResult = await uploadPdfToBlob(file, candidateId);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Erro no upload' },
        { status: 500 }
      );
    }

    // Salvar referência no banco (candidateId é obrigatório)
    if (!uploadResult.blobName || !uploadResult.blobUrl) {
      return NextResponse.json(
        { error: 'Erro no upload para Azure Blob Storage' },
        { status: 500 }
      );
    }

    try {
      const pool = await getPool();
      await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .input('fileName', sql.NVarChar(255), file.name)
        .input('originalName', sql.NVarChar(255), file.name)
        .input('blobName', sql.NVarChar(500), uploadResult.blobName)
        .input('blobUrl', sql.NVarChar(1000), uploadResult.blobUrl)
        .input('fileSize', sql.BigInt, file.size)
        .input('contentType', sql.NVarChar(100), file.type)
        .query(`
          INSERT INTO candidate_files 
          (candidate_id, file_name, original_name, blob_name, blob_url, file_size, content_type, status)
          VALUES 
          (@candidateId, @fileName, @originalName, @blobName, @blobUrl, @fileSize, @contentType, 'active')
        `);

      // Log da ação
      await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .input('action', sql.NVarChar(50), 'PDF_UPLOADED')
        .input('details', sql.NVarChar(500), `Arquivo ${file.name} enviado com sucesso`)
        .query(`
          INSERT INTO candidate_logs (candidate_id, action, details)
          VALUES (@candidateId, @action, @details)
        `);

    } catch (dbError) {
      console.error('Erro ao salvar referência no banco:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar arquivo no banco de dados' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        fileName: file.name,
        fileSize: file.size,
        blobName: uploadResult.blobName,
        blobUrl: uploadResult.blobUrl
      }
    });

  } catch (error) {
    console.error('Erro no upload de PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Método OPTIONS para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
