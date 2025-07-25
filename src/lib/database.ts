import sql from 'mssql'

// Configuração da conexão com Azure SQL Database
const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  user: process.env.AZURE_SQL_USERNAME || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true, // Obrigatório para Azure SQL Database
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
}

// Pool de conexões global
let pool: sql.ConnectionPool | null = null

/**
 * Obtém ou cria o pool de conexões
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    // Validar se as variáveis de ambiente estão configuradas
    if (!config.server || !config.database || !config.user || !config.password) {
      const missingVars = []
      if (!config.server) missingVars.push('AZURE_SQL_SERVER')
      if (!config.database) missingVars.push('AZURE_SQL_DATABASE')
      if (!config.user) missingVars.push('AZURE_SQL_USERNAME')
      if (!config.password) missingVars.push('AZURE_SQL_PASSWORD')
      
      throw new Error(`Variáveis de ambiente do banco de dados não configuradas: ${missingVars.join(', ')}`)
    }

    try {
      pool = new sql.ConnectionPool(config)
      await pool.connect()
      console.log('✅ Conexão com Azure SQL Database estabelecida com sucesso')
    } catch (error) {
      console.error('❌ Erro ao conectar com Azure SQL Database:', error)
      pool = null
      throw new Error(`Falha na conexão com o banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
  return pool
}

/**
 * Executa uma query SQL
 */
export async function executeQuery<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<T>> {
  const poolConnection = await getPool()
  const request = poolConnection.request()
  
  // Adiciona parâmetros se fornecidos
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
  }
  
  return request.query(query)
}

/**
 * Executa uma transação SQL
 */
export async function executeTransaction<T = unknown>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> {
  const poolConnection = await getPool()
  const transaction = new sql.Transaction(poolConnection)
  
  try {
    await transaction.begin()
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

/**
 * Fecha o pool de conexões (útil para cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
  }
}

// Tipos para as tabelas
export interface Candidate {
  id?: number
  nome: string
  email: string
  telefone?: string
  cargo?: string
  experiencia?: string
  localizacao?: string
  areas?: string
  tecnologias?: string
  created_at?: Date
  updated_at?: Date
  status?: string
}

export interface CandidateTechnology {
  id?: number
  candidate_id: number
  technology_name: string
  created_at?: Date
}

export interface CandidateLog {
  id?: number
  candidate_id?: number
  action: string
  details?: string
  ip_address?: string
  user_agent?: string
  performed_by?: string
  created_at?: Date
}
