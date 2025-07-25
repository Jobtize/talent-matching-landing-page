import { getPool } from '@/lib/database';

/**
 * Testa a conexão com o banco de dados Azure SQL
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: {
    testQuery?: { test: number; current_time: Date };
    server?: string;
    database?: string;
    timestamp: string;
    error?: string;
  };
}> {
  try {
    console.log('🔄 Testando conexão com Azure SQL Database...');
    
    const pool = await getPool();
    const request = pool.request();
    
    // Executa uma query simples para testar a conexão
    const result = await request.query('SELECT 1 as test, GETDATE() as current_time');
    
    const testResult = {
      success: true,
      message: '✅ Conexão com o banco de dados estabelecida com sucesso!',
      details: {
        testQuery: result.recordset[0],
        server: process.env.AZURE_SQL_SERVER,
        database: process.env.AZURE_SQL_DATABASE,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('✅ Teste de conexão bem-sucedido:', testResult.details);
    return testResult;
    
  } catch (error) {
    const errorResult = {
      success: false,
      message: `❌ Falha na conexão com o banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        error: error instanceof Error ? error.message : error,
        server: process.env.AZURE_SQL_SERVER || 'não configurado',
        database: process.env.AZURE_SQL_DATABASE || 'não configurado',
        timestamp: new Date().toISOString()
      }
    };
    
    console.error('❌ Teste de conexão falhou:', errorResult.details);
    return errorResult;
  }
}

/**
 * Testa se as tabelas necessárias existem no banco
 */
export async function testDatabaseTables(): Promise<{
  success: boolean;
  message: string;
  tables: string[];
  missingTables: string[];
}> {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    // Lista das tabelas esperadas
    const expectedTables = ['candidates', 'candidate_technologies', 'candidate_logs'];
    
    // Verifica quais tabelas existem
    const result = await request.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME IN ('candidates', 'candidate_technologies', 'candidate_logs')
    `);
    
    const existingTables = result.recordset.map(row => row.TABLE_NAME);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    return {
      success: missingTables.length === 0,
      message: missingTables.length === 0 
        ? '✅ Todas as tabelas necessárias estão presentes'
        : `⚠️ Tabelas faltando: ${missingTables.join(', ')}`,
      tables: existingTables,
      missingTables
    };
    
  } catch (error) {
    return {
      success: false,
      message: `❌ Erro ao verificar tabelas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      tables: [],
      missingTables: []
    };
  }
}
