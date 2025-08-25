import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Obter a sessão do usuário
    const session = await auth();
    
    // Verificar se o usuário está autenticado
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar se temos o token de acesso do LinkedIn
    if (!session.user.accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso do LinkedIn não disponível' },
        { status: 400 }
      );
    }
    
    // Buscar dados detalhados do perfil do LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Erro ao buscar perfil do LinkedIn:', errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar perfil do LinkedIn', details: errorText },
        { status: profileResponse.status }
      );
    }
    
    const profileData = await profileResponse.json();
    
    // Buscar dados de conexões usando a API r_1st_connections_size
    let connectionsData = null;
    try {
      const connectionsResponse = await fetch(
        'https://api.linkedin.com/v2/connections?q=viewer',
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (connectionsResponse.ok) {
        connectionsData = await connectionsResponse.json();
        console.log('Dados de conexões do LinkedIn:', JSON.stringify(connectionsData, null, 2));
      } else {
        console.error('Erro ao buscar conexões do LinkedIn:', await connectionsResponse.text());
      }
    } catch (error) {
      console.error('Erro ao buscar conexões do LinkedIn:', error);
    }
    
    // Combinar os dados do perfil e conexões
    const combinedData = {
      ...profileData,
      connections: 
        connectionsData?.connections?.total || 
        connectionsData?.firstDegreeSize || 
        connectionsData?.count || 
        0,
    };
    
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Erro ao processar requisição de perfil do LinkedIn:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar requisição' },
      { status: 500 }
    );
  }
}
