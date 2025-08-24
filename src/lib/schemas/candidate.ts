import { z } from 'zod'

// Schema para validação de candidatos
export const candidateSchema = z.object({
  nome: z.string()
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(100, { message: 'Nome não pode ter mais de 100 caracteres' }),
  
  email: z.string()
    .email({ message: 'Email inválido' })
    .max(100, { message: 'Email não pode ter mais de 100 caracteres' }),
  
  telefone: z.string()
    .min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' })
    .max(15, { message: 'Telefone não pode ter mais de 15 dígitos' })
    .refine(
      (value) => /^[0-9()\-\s+]+$/.test(value), 
      { message: 'Telefone deve conter apenas números, parênteses, traços e espaços' }
    ),
  
  cargo: z.string()
    .max(100, { message: 'Cargo não pode ter mais de 100 caracteres' })
    .optional(),
  
  experiencia: z.string()
    .max(50, { message: 'Experiência não pode ter mais de 50 caracteres' })
    .optional(),
  
  localizacao: z.string()
    .max(200, { message: 'Localização não pode ter mais de 200 caracteres' })
    .optional(),
  
  areas: z.string()
    .max(200, { message: 'Áreas não podem ter mais de 200 caracteres' })
    .optional(),
  
  tecnologias: z.union([
    z.array(z.string()),
    z.string()
  ]),

  curriculo: z.any().optional() // Para arquivos, validação mais complexa é feita separadamente
})

// Tipo inferido do schema
export type Candidate = z.infer<typeof candidateSchema>

// Função para validar dados do candidato
export function validateCandidate(data: unknown): { 
  success: boolean; 
  data?: Candidate; 
  errors?: z.ZodError 
} {
  try {
    const validatedData = candidateSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Função para validar parcialmente dados do candidato (útil para atualizações parciais)
export function validatePartialCandidate(data: unknown): { 
  success: boolean; 
  data?: Partial<Candidate>; 
  errors?: z.ZodError 
} {
  try {
    const validatedData = candidateSchema.partial().parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Função para formatar erros de validação em um formato amigável
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })
  
  return formattedErrors
}

