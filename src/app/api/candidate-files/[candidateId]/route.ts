import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { deleteBlobFile } from '@/lib/azure-storage';
import sql from 'mssql';

/**
 * API Route para gerenciar arquivos de um candidato específico
 * GET /api/candidate-files/[candidateId] - Lista arquivos do candidato
 * DELETE /api/candidate-files/[candidateId] - Exclui arquivo específico
 */

/**
 * Lista todos os arquivos de um candidato
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const candidateId = parseInt(params.candidateId);

    if (isNaN(candidateId)) {
      return NextResponse.json(
        { error: 'ID do candidato inválido' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('candidateId', sql.Int, candidateId)
      .query(`
        SELECT 
          cf.*,
          c.nome as candidate_name,
          c.email as candidate_email
        FROM candidate_files cf
        INNER JOIN candidates c ON cf.candidate_id = c.id
        WHERE cf.candidate_id = @candidateId AND cf.status = 'active'
        ORDER BY cf.uploaded_at DESC
      `);

    const files = result.recordset.map(file => ({
      id: file.id,
      fileName: file.file_name,
      originalName: file.original_name,
      blobName: file.blob_name,
      blobUrl: file.blob_url,
      fileSize: file.file_size,
      contentType: file.content_type,
      uploadedAt: file.uploaded_at,
      candidateName: file.candidate_name,
      candidateEmail: file.candidate_email
    }));

    return NextResponse.json({
      success: true,
      files,
      count: files.length
    });

  } catch (error) {
    console.error('Erro ao listar arquivos do candidato:', error);
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
 * Exclui um arquivo específico ou todos os arquivos do candidato
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const candidateId = parseInt(params.candidateId);
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (isNaN(candidateId)) {
      return NextResponse.json(
        { error: 'ID do candidato inválido' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Se não tem fileId, excluir todos os arquivos do candidato
    if (!fileId) {
      // Buscar todos os arquivos do candidato
      const filesResult = await pool.request()
        .input('candidateId', sql.Int, candidateId)
        .query(`
          SELECT * FROM candidate_files 
          WHERE candidate_id = @candidateId AND status = 'active'
        `);

      if (filesResult.recordset.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Nenhum arquivo encontrado para excluir'
        });
      }

      // Excluir cada arquivo do Azure Blob Storage
      for (const fileRecord of filesResult.recordset) {
        try {
          await deleteBlobFile(fileRecord.blob_name);
        } catch (error) {
          console.warn(`Falha ao excluir blob ${fileRecord.blob_name}:`, error);
        }
      }

      // Marcar todos como excluídos no banco (soft delete)
      await pool.request()
        .input('candidateId', sql.Int, candidateId)
        .query(`
          UPDATE candidate_files 
          SET status = 'deleted', updated_at = GETDATE()
          WHERE candidate_id = @candidateId AND status = 'active'
        `);

      // Log da ação
      await pool.request()
        .input('candidateId', sql.Int, candidateId)
        .input('action', sql.NVarChar(50), 'ALL_PDFS_DELETED')
        .input('details', sql.NVarChar(500), `Todos os arquivos do candidato foram excluídos`)
        .query(`
          INSERT INTO candidate_logs (candidate_id, action, details)
          VALUES (@candidateId, @action, @details)
        `);

      return NextResponse.json({
        success: true,
        message: `${filesResult.recordset.length} arquivo(s) excluído(s) com sucesso`
      });
    }

    const pool = await getPool();
    
    // Buscar informações do arquivo
    const fileResult = await pool.request()
      .input('fileId', sql.Int, parseInt(fileId))
      .input('candidateId', sql.Int, candidateId)
      .query(`
        SELECT * FROM candidate_files 
        WHERE id = @fileId AND candidate_id = @candidateId AND status = 'active'
      `);

    if (fileResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    const fileRecord = fileResult.recordset[0];

    // Excluir do Azure Blob Storage
    const blobDeleted = await deleteBlobFile(fileRecord.blob_name);
    
    if (!blobDeleted) {
      console.warn(`Falha ao excluir blob ${fileRecord.blob_name}, mas continuando com exclusão do banco`);
    }

    // Marcar como excluído no banco (soft delete)
    await pool.request()
      .input('fileId', sql.Int, parseInt(fileId))
      .query(`
        UPDATE candidate_files 
        SET status = 'deleted', updated_at = GETDATE()
        WHERE id = @fileId
      `);

    // Log da ação
    await pool.request()
      .input('candidateId', sql.Int, candidateId)
      .input('action', sql.NVarChar(50), 'PDF_DELETED')
      .input('details', sql.NVarChar(500), `Arquivo ${fileRecord.original_name} excluído`)
      .query(`
        INSERT INTO candidate_logs (candidate_id, action, details)
        VALUES (@candidateId, @action, @details)
      `);

    return NextResponse.json({
      success: true,
      message: 'Arquivo excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
