import { z } from 'zod';

/**
 * Validação de variáveis de ambiente necessárias para a aplicação usando Zod
 */

// Schema para validação das variáveis de ambiente
const environmentSchema = z.object({
  // Variáveis obrigatórias do Azure SQL
  AZURE_SQL_SERVER: z
    .string()
    .min(1, 'AZURE_SQL_SERVER é obrigatório')
    .refine(
      (val) => val.includes('.database.windows.net'),
      'AZURE_SQL_SERVER deve ser um servidor Azure SQL válido (ex: server.database.windows.net)'
    ),
  
  AZURE_SQL_DATABASE: z
    .string()
    .min(1, 'AZURE_SQL_DATABASE é obrigatório'),
  
  AZURE_SQL_USERNAME: z
    .string()
    .min(1, 'AZURE_SQL_USERNAME é obrigatório'),
  
  AZURE_SQL_PASSWORD: z
    .string()
    .min(8, 'AZURE_SQL_PASSWORD deve ter pelo menos 8 caracteres'),

  // Variáveis opcionais do cliente
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL deve ser uma URL válida')
    .optional(),
  
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não pode estar vazio')
    .refine(
      (val) => val.startsWith('AIza'),
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY deve começar com "AIza" (formato válido do Google)'
    )
    .optional(),

  // Variáveis de ambiente do Node.js
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
});

// Tipo inferido do schema
export type EnvironmentConfig = z.infer<typeof environmentSchema>;

/**
 * Valida se todas as variáveis de ambiente necessárias estão configuradas usando Zod
 */
export function validateEnvironmentVariables(): {
  isValid: boolean;
  missingVars: string[];
  config?: EnvironmentConfig;
  errors: string[];
} {
  try {
    // Tentar validar as variáveis de ambiente
    const config = environmentSchema.parse(process.env);
    
    return {
      isValid: true,
      missingVars: [],
      errors: [],
      config
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars: string[] = [];
      const errors: string[] = [];

      // Processar erros do Zod
      error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        
        if (err.code === 'invalid_type' && err.received === 'undefined') {
          missingVars.push(fieldName);
        } else {
          errors.push(`${fieldName}: ${err.message}`);
        }
      });

      return {
        isValid: false,
        missingVars,
        errors,
        config: undefined
      };
    }

    // Erro inesperado
    return {
      isValid: false,
      missingVars: [],
      errors: [`Erro inesperado na validação: ${error}`],
      config: undefined
    };
  }
}

/**
 * Valida apenas as variáveis de ambiente do cliente (NEXT_PUBLIC_*)
 * Útil para validação no lado do cliente
 */
export function validateClientEnvironmentVariables(): {
  isValid: boolean;
  errors: string[];
  config?: Pick<EnvironmentConfig, 'NEXT_PUBLIC_APP_URL' | 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'>;
} {
  const clientSchema = environmentSchema.pick({
    NEXT_PUBLIC_APP_URL: true,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: true
  });

  try {
    const config = clientSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });

    return {
      isValid: true,
      errors: [],
      config
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );

      return {
        isValid: false,
        errors,
        config: undefined
      };
    }

    return {
      isValid: false,
      errors: [`Erro inesperado na validação: ${error}`],
      config: undefined
    };
  }
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
 * Lança erro se as variáveis não estiverem configuradas corretamente
 */
export function requireEnvironmentVariables(): EnvironmentConfig {
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

/**
 * Função utilitária para obter configuração validada de forma segura
 * Retorna null se a validação falhar (não lança erro)
 */
export function getValidatedEnvironmentConfig(): EnvironmentConfig | null {
  const validation = validateEnvironmentVariables();
  return validation.isValid ? validation.config! : null;
}

/**
 * Valida especificamente a chave da API do Google Maps
 * Útil para componentes que dependem do Google Maps
 */
export function validateGoogleMapsApiKey(): {
  isValid: boolean;
  apiKey?: string;
  error?: string;
} {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não está configurada'
    };
  }

  if (!apiKey.startsWith('AIza')) {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY deve começar com "AIza" (formato válido do Google)'
    };
  }

  if (apiKey.length < 20) {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY parece ser muito curta para ser válida'
    };
  }

  return {
    isValid: true,
    apiKey
  };
}
