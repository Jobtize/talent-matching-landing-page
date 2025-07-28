import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    // Verificar se as tabelas existem
    const tablesResult = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)

    // Verificar estrutura da tabela candidates se existir
    let candidatesStructure = null
    try {
      candidatesStructure = await executeQuery(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'candidates'
        ORDER BY ORDINAL_POSITION
      `)
    } catch (error) {
      console.log('Tabela candidates não existe:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        tables: tablesResult.recordset,
        candidatesStructure: candidatesStructure?.recordset || null
      }
    })
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
