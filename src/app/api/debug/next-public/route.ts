import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Capturar todas as variáveis de ambiente
    const allEnvVars = process.env;
    
    // Separar variáveis NEXT_PUBLIC_* das outras
    const nextPublicVars: Record<string, string | undefined> = {};
    const privateVars: Record<string, string | undefined> = {};
    const buildTimeInfo: Record<string, string | boolean> = {};
    
    // Classificar variáveis
    Object.keys(allEnvVars).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        nextPublicVars[key] = allEnvVars[key];
      } else if (['NODE_ENV', 'AZURE_SQL_SERVER', 'AZURE_SQL_DATABASE', 'AZURE_SQL_USERNAME', 'AZURE_SQL_PASSWORD'].includes(key)) {
        // Mascarar dados sensíveis
        if (key.includes('PASSWORD')) {
          privateVars[key] = allEnvVars[key] ? '[REDACTED]' : undefined;
        } else {
          privateVars[key] = allEnvVars[key];
        }
      }
    });
    
    // Informações sobre o build
    buildTimeInfo.nodeEnv = process.env.NODE_ENV || 'não definido';
    buildTimeInfo.isServer = typeof window === 'undefined';
    buildTimeInfo.buildTime = process.env.BUILD_TIME || 'não definido';
    buildTimeInfo.deploymentId = process.env.WEBSITE_DEPLOYMENT_ID || 'não definido';
    
    // Teste específico da variável Google Maps
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsAnalysis = {
      exists: !!googleMapsKey,
      length: googleMapsKey?.length || 0,
      preview: googleMapsKey ? `${googleMapsKey.substring(0, 10)}...` : 'undefined',
      type: typeof googleMapsKey,
      isAccessibleOnServer: true, // sempre true no servidor
      rawValue: googleMapsKey // para debug (cuidado em produção)
    };
    
    return NextResponse.json({
      success: true,
      message: 'Análise detalhada das variáveis NEXT_PUBLIC_*',
      data: {
        nextPublicVars,
        privateVars,
        buildTimeInfo,
        googleMapsAnalysis,
        serverInfo: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          platform: process.platform,
          nodeVersion: process.version
        },
        explanation: {
          nextPublicVars: 'Estas variáveis são inlined no bundle JavaScript durante o build',
          privateVars: 'Estas variáveis só existem no servidor, nunca são expostas ao cliente',
          inlining: 'NEXT_PUBLIC_* são substituídas por seus valores literais no código JavaScript final'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro na análise de variáveis NEXT_PUBLIC_*:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na análise das variáveis de ambiente',
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        name: error instanceof Error ? error.name : 'UnknownError'
      }
    }, { status: 500 });
  }
}
