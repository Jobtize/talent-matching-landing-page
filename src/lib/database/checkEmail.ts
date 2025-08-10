import sql from 'mssql';
import { getPool } from '@/lib/database';

export interface CandidateData {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    experiencia: string;
    localizacao: string;
    areas: string;
    tecnologias: string;
    created_at: Date;
    // Informações do arquivo PDF (se houver)
    file_name?: string;
    blob_url?: string;
    file_size?: number;
}

export async function checkEmailExists(email: string): Promise<CandidateData | null> {
    const pool = await getPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar(255), email.toLowerCase().trim());

    const result = await request.query(`
    SELECT 
      c.id, c.nome, c.email, c.telefone, c.cargo, c.experiencia, 
      c.localizacao, c.areas, c.tecnologias, c.created_at,
      cf.file_name, cf.blob_url, cf.file_size
    FROM candidates c
    LEFT JOIN candidate_files cf ON c.id = cf.candidate_id 
      AND cf.status != 'deleted'
      AND cf.id = (
        SELECT TOP 1 id 
        FROM candidate_files 
        WHERE candidate_id = c.id AND status != 'deleted'
        ORDER BY created_at DESC
      )
    WHERE c.email = @email
  `);

    if (result.recordset.length === 0) return null;

    return result.recordset[0] as CandidateData;
}
