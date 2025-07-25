import { NextResponse } from 'next/server';
import { testDatabaseConnection, testDatabaseTables } from '@/lib/database/test-connection';
import { validateEnvironmentVariables } from '@/lib/env-validation';

/**
 * Endpoint para testar a saúde da conexão com o banco de dados
 * GET /api/health/database
 */
export async function GET() {
  try {
    // Primeiro, valida as variáveis de ambiente
    const envValidation = validateEnvironmentVariables();
    
    if (!envValidation.isValid) {
      return NextResponse.json({
        status: 'error',
        message: 'Configuração de ambiente inválida',
        details: {
          missingVars: envValidation.missingVars,
          errors: envValidation.errors
        }
      }, { status: 503 });
    }

    // Testa a conexão com o banco
    const connectionTest = await testDatabaseConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        status: 'error',
        message: connectionTest.message,
        details: connectionTest.details
      }, { status: 503 });
    }

    // Testa se as tabelas existem
    const tablesTest = await testDatabaseTables();

    return NextResponse.json({
      status: 'success',
      message: 'Banco de dados funcionando corretamente',
      details: {
        environment: {
          server: process.env.AZURE_SQL_SERVER,
          database: process.env.AZURE_SQL_DATABASE,
          username: process.env.AZURE_SQL_USERNAME
        },
        connection: connectionTest.details,
        tables: {
          status: tablesTest.success ? 'ok' : 'warning',
          message: tablesTest.message,
          existing: tablesTest.tables,
          missing: tablesTest.missingTables
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no health check do banco de dados:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno no health check',
      details: {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
