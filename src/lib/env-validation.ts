/**
 * Validação de variáveis de ambiente necessárias para a aplicação
 */

interface EnvironmentConfig {
  AZURE_SQL_SERVER: string;
  AZURE_SQL_DATABASE: string;
  AZURE_SQL_USERNAME: string;
  AZURE_SQL_PASSWORD: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
}

/**
 * Valida se todas as variáveis de ambiente necessárias estão configuradas
 */
export function validateEnvironmentVariables(): {
  isValid: boolean;
  missingVars: string[];
  config?: EnvironmentConfig;
  errors: string[];
} {
  const requiredVars = [
    'AZURE_SQL_SERVER',
    'AZURE_SQL_DATABASE', 
    'AZURE_SQL_USERNAME',
    'AZURE_SQL_PASSWORD'
  ];

  const missingVars: string[] = [];
  const errors: string[] = [];

  // Verifica variáveis obrigatórias
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  // Validações específicas
  if (process.env.AZURE_SQL_SERVER && !process.env.AZURE_SQL_SERVER.includes('.database.windows.net')) {
    errors.push('AZURE_SQL_SERVER deve ser um servidor Azure SQL válido (ex: server.database.windows.net)');
  }

  if (process.env.AZURE_SQL_PASSWORD && process.env.AZURE_SQL_PASSWORD.length < 8) {
    errors.push('AZURE_SQL_PASSWORD deve ter pelo menos 8 caracteres');
  }

  const isValid = missingVars.length === 0 && errors.length === 0;

  const result = {
    isValid,
    missingVars,
    errors,
    config: isValid ? {
      AZURE_SQL_SERVER: process.env.AZURE_SQL_SERVER!,
      AZURE_SQL_DATABASE: process.env.AZURE_SQL_DATABASE!,
      AZURE_SQL_USERNAME: process.env.AZURE_SQL_USERNAME!,
      AZURE_SQL_PASSWORD: process.env.AZURE_SQL_PASSWORD!,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    } : undefined
  };

  return result;
}

/**
 * Valida as variáveis de ambiente e exibe mensagens de erro se necessário
 */
export function validateAndLogEnvironment(): boolean {
  const validation = validateEnvironmentVariables();

  if (!validation.isValid) {
    console.error('❌ Erro na configuração das variáveis de ambiente:');
    
    if (validation.missingVars.length > 0) {
      console.error('📋 Variáveis faltando:');
      validation.missingVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
    }

    if (validation.errors.length > 0) {
      console.error('⚠️ Erros de validação:');
      validation.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
    }

    console.error('\n💡 Dica: Verifique se o arquivo .env está configurado corretamente');
    console.error('📖 Consulte o arquivo .env.example para referência');
    
    return false;
  }

  console.log('✅ Todas as variáveis de ambiente estão configuradas corretamente');
  return true;
}

/**
 * Middleware para validar variáveis de ambiente em rotas da API
 */
export function requireEnvironmentVariables() {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    const errorMessage = [
      'Configuração de ambiente inválida.',
      validation.missingVars.length > 0 ? `Variáveis faltando: ${validation.missingVars.join(', ')}` : '',
      validation.errors.length > 0 ? `Erros: ${validation.errors.join(', ')}` : ''
    ].filter(Boolean).join(' ');

    throw new Error(errorMessage);
  }

  return validation.config!;
}
