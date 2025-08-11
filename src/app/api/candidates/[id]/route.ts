import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import sql from 'mssql';
import { deleteBlobFile } from '@/lib/azure-storage';

/**
 * DELETE /api/candidates/[id] - Deleta um candidato e seus arquivos
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const candidateId = parseInt(params.id);
    
    if (isNaN(candidateId)) {
      return NextResponse.json(
        { error: 'ID do candidato inválido' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    // Primeiro, buscar arquivos associados ao candidato para deletar do Azure
    const filesResult = await pool.request()
      .input('candidateId', sql.Int, candidateId)
      .query(`
        SELECT blob_name 
        FROM candidate_files 
        WHERE candidate_id = @candidateId AND status != 'deleted'
      `);

    // Deletar arquivos do Azure Blob Storage
    for (const file of filesResult.recordset) {
      try {
        await deleteBlobFile(file.blob_name);
      } catch (error) {
        console.error(`Erro ao deletar arquivo ${file.blob_name}:`, error);
        // Continuar mesmo se falhar ao deletar arquivo
      }
    }

    // Deletar registros do banco em ordem (devido às foreign keys)
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Deletar logs do candidato
      await transaction.request()
        .input('candidateId', sql.Int, candidateId)
        .query('DELETE FROM candidate_logs WHERE candidate_id = @candidateId');

      // 2. Deletar arquivos do candidato
      await transaction.request()
        .input('candidateId', sql.Int, candidateId)
        .query('DELETE FROM candidate_files WHERE candidate_id = @candidateId');

      // 3. Deletar tecnologias do candidato
      await transaction.request()
        .input('candidateId', sql.Int, candidateId)
        .query('DELETE FROM candidate_technologies WHERE candidate_id = @candidateId');

      // 4. Deletar o candidato
      const deleteResult = await transaction.request()
        .input('candidateId', sql.Int, candidateId)
        .query('DELETE FROM candidates WHERE id = @candidateId');

      if (deleteResult.rowsAffected[0] === 0) {
        await transaction.rollback();
        return NextResponse.json(
          { error: 'Candidato não encontrado' },
          { status: 404 }
        );
      }

      await transaction.commit();

      return NextResponse.json({
        success: true,
        message: 'Candidato deletado com sucesso'
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Erro ao deletar candidato:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
