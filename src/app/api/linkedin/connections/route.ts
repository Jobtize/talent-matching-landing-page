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
    
    // Buscar dados de conexões usando a API r_1st_connections_size
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
      
      if (!connectionsResponse.ok) {
        const errorText = await connectionsResponse.text();
        console.error('Erro ao buscar conexões do LinkedIn:', errorText);
        return NextResponse.json(
          { error: 'Erro ao buscar conexões do LinkedIn', details: errorText },
          { status: connectionsResponse.status }
        );
      }
      
      const connectionsData = await connectionsResponse.json();
      console.log('Dados de conexões do LinkedIn:', JSON.stringify(connectionsData, null, 2));
      
      // Extrair o número de conexões de diferentes formatos possíveis da API
      const connections = {
        count: connectionsData.connections?.total || 
               connectionsData.firstDegreeSize || 
               connectionsData.count || 
               0,
        data: connectionsData
      };
      
      return NextResponse.json(connections);
    } catch (error) {
      console.error('Erro ao buscar conexões do LinkedIn:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conexões do LinkedIn', details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição de conexões do LinkedIn:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar requisição' },
      { status: 500 }
    );
  }
}

