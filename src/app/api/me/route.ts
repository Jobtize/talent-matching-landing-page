import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Obter token de autenticação do cookie
    const authToken = cookies().get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { authenticated: false, message: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar token com o backend
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
    const verifyResponse = await fetch(`${SITE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!verifyResponse.ok) {
      return NextResponse.json(
        { authenticated: false, message: 'Token inválido' },
        { status: 401 }
      );
    }
    
    const userData = await verifyResponse.json();
    
    // Configurar cabeçalhos para evitar cache
    const response = NextResponse.json({
      authenticated: true,
      user: userData.user
    });
    
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Erro interno' },
      { status: 500 }
    );
  }
}

