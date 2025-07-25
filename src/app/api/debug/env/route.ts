import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variáveis de ambiente (apenas as públicas para segurança)
    const envVars = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'não configurada',
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 
        `configurada (${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...)` : 
        'não configurada',
      NODE_ENV: process.env.NODE_ENV || 'não configurada',
      // Verificar se estamos no cliente ou servidor
      isServer: typeof window === 'undefined'
    };

    return NextResponse.json({
      success: true,
      message: 'Variáveis de ambiente (apenas públicas)',
      data: envVars,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao verificar variáveis de ambiente:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar variáveis de ambiente',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
