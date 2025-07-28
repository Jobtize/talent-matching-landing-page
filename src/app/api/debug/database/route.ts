import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 Iniciando teste de conexão com o banco de dados...');
    
    // Verificar variáveis de ambiente primeiro
    const envCheck = {
      AZURE_SQL_SERVER: !!process.env.AZURE_SQL_SERVER,
      AZURE_SQL_DATABASE: !!process.env.AZURE_SQL_DATABASE,
      AZURE_SQL_USERNAME: !!process.env.AZURE_SQL_USERNAME,
      AZURE_SQL_PASSWORD: !!process.env.AZURE_SQL_PASSWORD
    };
    
    console.log('📋 Variáveis de ambiente:', envCheck);
    
    // Tentar obter o pool de conexões
    console.log('🔌 Tentando obter pool de conexões...');
    const pool = await getPool();
    console.log('✅ Pool de conexões obtido com sucesso');
    
    // Testar uma query simples
    console.log('🧪 Testando query simples...');
    const request = pool.request();
    const result = await request.query('SELECT 1 as test');
    console.log('✅ Query executada com sucesso:', result.recordset);
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco de dados funcionando!',
      data: {
        environmentVariables: envCheck,
        connectionTest: 'success',
        queryResult: result.recordset[0],
        poolConnected: pool.connected,
        poolConnecting: pool.connecting
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na conexão com banco de dados',
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
