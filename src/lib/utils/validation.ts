import { validateCandidate, Candidate } from '../schemas/candidate';

export interface FormData {
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    experiencia: string;
    localizacao: string;
    areas: string;
    tecnologias: string | string[];
}

// Função de validação legada para compatibilidade
export function validateFormData(data: unknown): data is FormData {
    // Usar a nova validação com Zod
    const validation = validateCandidate(data);
    return validation.success;
}

// Nova função de validação com Zod que retorna erros formatados
export function validateFormDataWithErrors(data: unknown): { 
    isValid: boolean; 
    errors?: Record<string, string>;
    data?: Candidate;
} {
    const validation = validateCandidate(data);
    
    if (validation.success) {
        return { isValid: true, data: validation.data };
    }
    
    // Formatar erros para uso na UI
    const errors: Record<string, string> = {};
    
    if (validation.errors) {
        validation.errors.errors.forEach((error) => {
            const path = error.path.join('.');
            errors[path] = error.message;
        });
    }
    
    return { isValid: false, errors };
}
