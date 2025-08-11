import sql from 'mssql';
import { executeTransaction } from '@/lib/database';
import { USER_AGENT_MAX_LENGTH } from "@/app/api/constants";
import { FormData } from "@/lib/utils/validation";

export function parseTechnologies(tecnologiasText: string): string[] {
    if (!tecnologiasText.trim()) return [];
    return tecnologiasText
        .split(/[,;|\n]/)
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0)
        .slice(0, 50);
}

export async function insertOrUpdateCandidate(
    formData: FormData,
    clientIP: string,
    userAgent: string,
    candidateId?: number
) {
    return await executeTransaction(async (transaction) => {
        const isUpdate = !!candidateId;
        let result;

        const request = new sql.Request(transaction);
        const email = formData.email.toLowerCase().trim();
        request.input('nome', sql.NVarChar(100), formData.nome.trim());
        request.input('email', sql.NVarChar(255), email);
        request.input('telefone', sql.NVarChar(30), formData.telefone.trim() || null);
        request.input('cargo', sql.NVarChar(100), formData.cargo.trim() || null);
        request.input('experiencia', sql.NVarChar(50), formData.experiencia.trim() || null);
        request.input('localizacao', sql.NVarChar(100), formData.localizacao.trim() || null);
        request.input('areas', sql.NVarChar(500), formData.areas.trim() || null);
        request.input('tecnologias', sql.NText, formData.tecnologias.trim() || null);

        let candidateResult;

        if (isUpdate) {
            request.input('id', sql.Int, candidateId);
            
            // Primeiro executa o UPDATE
            await request.query(`
        UPDATE candidates SET
          nome = @nome,
          telefone = @telefone,
          cargo = @cargo,
          experiencia = @experiencia,
          localizacao = @localizacao,
          areas = @areas,
          tecnologias = @tecnologias
        WHERE id = @id
      `);

            // Depois busca os dados atualizados
            const selectRequest = new sql.Request(transaction);
            selectRequest.input('id', sql.Int, candidateId);
            candidateResult = await selectRequest.query(`
        SELECT id, nome, email FROM candidates WHERE id = @id
      `);
        } else {
            // Para INSERT, usamos SCOPE_IDENTITY() para obter o ID inserido
            result = await request.query(`
        INSERT INTO candidates (nome, email, telefone, cargo, experiencia, localizacao, areas, tecnologias)
        VALUES (@nome, @email, @telefone, @cargo, @experiencia, @localizacao, @areas, @tecnologias);
        
        SELECT SCOPE_IDENTITY() as id, @nome as nome, @email as email;
      `);
            candidateResult = result;
        }

        const candidate = candidateResult.recordset[0];
        const technologies = parseTechnologies(formData.tecnologias);
        const insertedTechnologies: string[] = [];

        if (isUpdate) {
            const deleteTechRequest = new sql.Request(transaction);
            deleteTechRequest.input('candidate_id', sql.Int, candidate.id);
            await deleteTechRequest.query(`DELETE FROM candidate_technologies WHERE candidate_id = @candidate_id`);
        }

        for (const tech of technologies) {
            try {
                const techRequest = new sql.Request(transaction);
                techRequest.input('candidate_id', sql.Int, candidate.id);
                techRequest.input('technology_name', sql.NVarChar(100), tech);
                await techRequest.query(`
          INSERT INTO candidate_technologies (candidate_id, technology_name)
          VALUES (@candidate_id, @technology_name)
        `);
                insertedTechnologies.push(tech);
            } catch (error: unknown) {
                if (error instanceof sql.RequestError && !(error.number === 2627 || error.number === 2601)) {
                    throw error;
                }
            }
        }

        const logRequest = new sql.Request(transaction);
        logRequest.input('candidate_id', sql.Int, candidate.id);
        logRequest.input('action', sql.NVarChar(50), isUpdate ? 'UPDATE' : 'CREATE');
        logRequest.input('details', sql.NVarChar(USER_AGENT_MAX_LENGTH), `${isUpdate ? 'Atualizado' : 'Criado'} via formulário web. Tecnologias: ${insertedTechnologies.length}`);
        logRequest.input('ip_address', sql.NVarChar(45), clientIP);
        logRequest.input('user_agent', sql.NVarChar(USER_AGENT_MAX_LENGTH), userAgent.substring(0, USER_AGENT_MAX_LENGTH));
        logRequest.input('performed_by', sql.NVarChar(100), 'web_form');

        await logRequest.query(`
      INSERT INTO candidate_logs (candidate_id, action, details, ip_address, user_agent, performed_by)
      VALUES (@candidate_id, @action, @details, @ip_address, @user_agent, @performed_by)
    `);

        return {
            candidateId: candidate.id,
            candidateName: candidate.nome,
            candidateEmail: candidate.email,
            technologiesCount: insertedTechnologies.length,
            technologies: insertedTechnologies
        };
    });
}
