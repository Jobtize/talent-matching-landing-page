export interface FormData {
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    experiencia: string;
    localizacao: string;
    areas: string;
    tecnologias: string;
}

export function validateFormData(data: unknown): data is FormData {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    return (
        typeof obj.nome === 'string' && obj.nome.trim().length > 0 &&
        typeof obj.email === 'string' && obj.email.includes('@') &&
        typeof obj.telefone === 'string' &&
        typeof obj.cargo === 'string' &&
        typeof obj.experiencia === 'string' &&
        typeof obj.localizacao === 'string' &&
        typeof obj.areas === 'string' &&
        typeof obj.tecnologias === 'string'
    );
}
