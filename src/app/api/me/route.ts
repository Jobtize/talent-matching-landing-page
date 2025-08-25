import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Obter token de autenticação do cookie
    const authToken = cookies().get('auth_token')?.value;
    
    if (!authToken) {
      console.log('[API /me] Não autenticado - cookie auth_token ausente');
      return NextResponse.json(
        { authenticated: false, message: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Em uma implementação real, aqui você verificaria o JWT ou consultaria
    // o banco de dados para obter os dados do usuário associados ao token
    
    // Simulação: Decodificar o JWT ou buscar dados do usuário
    // Nota: Em produção, use uma biblioteca como jose para verificar o JWT
    // ou consulte seu banco de dados usando o token como chave
    
    // Exemplo simplificado para demonstração:
    const userData = {
      id: '123',
      name: 'Usuário Exemplo',
      email: 'usuario@exemplo.com',
      profilePicture: 'https://via.placeholder.com/150'
    };
    
    console.log('[API /me] Usuário autenticado:', userData.email);
    
    // Configurar cabeçalhos para evitar cache
    const response = NextResponse.json({
      authenticated: true,
      user: userData
    });
    
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('[API /me] Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Erro interno' },
      { status: 500 }
    );
  }
}

