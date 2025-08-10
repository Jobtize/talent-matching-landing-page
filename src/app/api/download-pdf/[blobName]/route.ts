import { NextRequest, NextResponse } from 'next/server';
import { generateDownloadUrl, getBlobMetadata } from '@/lib/azure-storage';
import { getPool } from '@/lib/database';
import sql from 'mssql';

/**
 * API Route para download de PDFs do Azure Blob Storage
 * GET /api/download-pdf/[blobName]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blobName: string }> }
) {
  try {
    const resolvedParams = await params;
    const blobName = decodeURIComponent(resolvedParams.blobName);

    if (!blobName) {
      return NextResponse.json(
        { error: 'Nome do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o arquivo existe no banco de dados
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('blobName', sql.NVarChar(500), blobName)
        .query(`
          SELECT cf.*, c.nome as candidate_name, c.email as candidate_email
          FROM candidate_files cf
          INNER JOIN candidates c ON cf.candidate_id = c.id
          WHERE cf.blob_name = @blobName AND cf.status = 'active'
        `);

      if (result.recordset.length === 0) {
        return NextResponse.json(
          { error: 'Arquivo não encontrado' },
          { status: 404 }
        );
      }

      const fileRecord = result.recordset[0];

      // Log do download
      await pool.request()
        .input('candidateId', sql.Int, fileRecord.candidate_id)
        .input('action', sql.NVarChar(50), 'PDF_DOWNLOADED')
        .input('details', sql.NVarChar(500), `Arquivo ${fileRecord.original_name} baixado`)
        .query(`
          INSERT INTO candidate_logs (candidate_id, action, details)
          VALUES (@candidateId, @action, @details)
        `);

    } catch (dbError) {
      console.error('Erro ao verificar arquivo no banco:', dbError);
      // Continuar mesmo se o banco falhar
    }

    // Gerar URL de download
    const downloadUrl = await generateDownloadUrl(blobName, 60); // 60 minutos

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Erro ao gerar URL de download' },
        { status: 500 }
      );
    }

    // Obter metadados do arquivo
    const metadata = await getBlobMetadata(blobName);

    return NextResponse.json({
      success: true,
      downloadUrl,
      metadata: {
        contentLength: metadata?.contentLength,
        contentType: metadata?.contentType,
        lastModified: metadata?.lastModified,
        originalName: metadata?.metadata?.originalName
      }
    });

  } catch (error) {
    console.error('Erro no download de PDF:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
