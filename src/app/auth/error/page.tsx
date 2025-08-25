'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    default: 'Ocorreu um erro durante a autenticação.',
    configuration: 'Há um problema com a configuração do servidor.',
    accessdenied: 'Você não tem permissão para acessar este recurso.',
    verification: 'O link de verificação expirou ou já foi usado.',
    signin: 'Não foi possível fazer login com a conta selecionada.',
    oauthsignin: 'Não foi possível iniciar o fluxo de autenticação OAuth.',
    oauthcallback: 'Não foi possível completar o fluxo de autenticação OAuth.',
    oauthcreateaccount: 'Não foi possível criar uma conta vinculada ao provedor OAuth.',
    emailcreateaccount: 'Não foi possível criar uma conta com o e-mail fornecido.',
    callback: 'Ocorreu um erro durante o callback de autenticação.',
    oauthaccountnotlinked: 'Esta conta já está vinculada a outro usuário.',
    emailsignin: 'Não foi possível enviar o e-mail de verificação.',
    credentialssignin: 'As credenciais fornecidas são inválidas.',
    sessionrequired: 'Esta página requer autenticação.',
  };

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Erro de Autenticação</h2>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          {error && <p className="mt-1 text-sm text-gray-500">Código de erro: {error}</p>}
        </div>
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center transition duration-150">
            Voltar para a página inicial
          </Link>
          <Link href="mailto:suporte@talentmatch.com" className="block w-full text-blue-600 hover:text-blue-800 text-center">
            Contatar suporte
          </Link>
        </div>
      </div>
    </div>
  );
}

