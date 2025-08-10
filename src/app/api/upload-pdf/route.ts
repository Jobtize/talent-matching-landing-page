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

    // Verificar se é uma atualização de candidateId
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      if (body.updateOnly && body.candidateId && body.blobName) {
        // Atualizar arquivo existente com candidateId
        try {
          const pool = await getPool();
          await pool.request()
            .input('candidateId', sql.Int, parseInt(body.candidateId))
            .input('blobName', sql.NVarChar(500), body.blobName)
            .query(`
              UPDATE candidate_files 
              SET candidate_id = @candidateId
              WHERE blob_name = @blobName AND candidate_id IS NULL
            `);

          return NextResponse.json({
            success: true,
            message: 'Arquivo associado ao candidato com sucesso'
          });
        } catch (error) {
          console.error('Erro ao associar arquivo ao candidato:', error);
          return NextResponse.json(
            { error: 'Erro ao associar arquivo ao candidato' },
            { status: 500 }
          );
        }
      }
    }

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

    // Salvar referência no banco (com ou sem candidateId)
    if (uploadResult.blobName && uploadResult.blobUrl) {
      try {
        const pool = await getPool();
        const result = await pool.request()
          .input('candidateId', candidateId ? sql.Int : sql.Int, candidateId ? parseInt(candidateId) : null)
          .input('fileName', sql.NVarChar(255), file.name)
          .input('originalName', sql.NVarChar(255), file.name)
          .input('blobName', sql.NVarChar(500), uploadResult.blobName)
          .input('blobUrl', sql.NVarChar(1000), uploadResult.blobUrl)
          .input('fileSize', sql.BigInt, file.size)
          .input('contentType', sql.NVarChar(100), file.type)
          .query(`
            INSERT INTO candidate_files 
            (candidate_id, file_name, original_name, blob_name, blob_url, file_size, content_type)
            VALUES 
            (@candidateId, @fileName, @originalName, @blobName, @blobUrl, @fileSize, @contentType)
          `);

        // Log da ação apenas se temos candidateId
        if (candidateId) {
          await pool.request()
            .input('candidateId', sql.Int, parseInt(candidateId))
            .input('action', sql.NVarChar(50), 'PDF_UPLOADED')
            .input('details', sql.NVarChar(500), `Arquivo ${file.name} enviado com sucesso`)
            .query(`
              INSERT INTO candidate_logs (candidate_id, action, details)
              VALUES (@candidateId, @action, @details)
            `);
        }

      } catch (dbError) {
        console.error('Erro ao salvar referência no banco:', dbError);
        // Não falhar o upload se o banco falhar, apenas logar
      }
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
