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
}

export async function checkEmailExists(email: string): Promise<CandidateData | null> {
    const pool = await getPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar(255), email.toLowerCase().trim());

    const result = await request.query(`
    SELECT id, nome, email, telefone, cargo, experiencia, localizacao, areas, tecnologias, created_at
    FROM candidates
    WHERE email = @email
  `);

    if (result.recordset.length === 0) return null;

    return result.recordset[0] as CandidateData;
}
