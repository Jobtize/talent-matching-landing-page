/**
 * Utilitários para validação de arquivos
 * Funções auxiliares para validação client-side e server-side
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileConstraints {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

/**
 * Configurações padrão para validação de PDFs
 */
export const PDF_CONSTRAINTS: FileConstraints = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf'],
  allowedExtensions: ['.pdf']
};

/**
 * Valida um arquivo baseado nas restrições fornecidas
 */
export function validateFile(file: File, constraints: FileConstraints): FileValidationResult {
  // Verificar se o arquivo existe
  if (!file) {
    return {
      isValid: false,
      error: 'Nenhum arquivo selecionado'
    };
  }

  // Verificar tipo MIME
  if (!constraints.allowedTypes.includes(file.type)) {
    const allowedTypesText = constraints.allowedTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypesText}`
    };
  }

  // Verificar extensão
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!constraints.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Extensão não permitida. Extensões aceitas: ${constraints.allowedExtensions.join(', ')}`
    };
  }

  // Verificar tamanho
  if (file.size > constraints.maxSize) {
    const maxSizeMB = (constraints.maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    };
  }

  // Verificar se não está vazio
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Arquivo não pode estar vazio'
    };
  }

  return { isValid: true };
}

/**
 * Valida especificamente arquivos PDF com verificação de magic number
 */
export async function validatePdfFile(file: File): Promise<FileValidationResult> {
  // Primeiro, validação básica
  const basicValidation = validateFile(file, PDF_CONSTRAINTS);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Verificar magic number do PDF
  try {
    const magicNumberValid = await validatePdfMagicNumber(file);
    if (!magicNumberValid) {
      return {
        isValid: false,
        error: 'Arquivo não é um PDF válido. Verifique se o arquivo não foi renomeado.'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao validar arquivo PDF'
    };
  }

  return { isValid: true };
}

/**
 * Verifica se o arquivo tem o magic number correto de PDF
 */
async function validatePdfMagicNumber(file: File): Promise<boolean> {
  try {
    // Ler os primeiros 8 bytes do arquivo
    const arrayBuffer = await fileToArrayBuffer(file.slice(0, 8));
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter para string
    const header = String.fromCharCode(...uint8Array);
    
    // Verificar se começa com %PDF-
    return header.startsWith('%PDF-');
  } catch (error) {
    console.error('Erro ao verificar magic number do PDF:', error);
    return false;
  }
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extrai a extensão de um nome de arquivo
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Sanitiza um nome de arquivo removendo caracteres especiais
 */
export function sanitizeFileName(filename: string): string {
  // Remove caracteres especiais, mantém apenas letras, números, pontos e hífens
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Verifica se um arquivo é um PDF baseado na extensão e tipo MIME
 */
export function isPdfFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  return file.type === 'application/pdf' && extension === '.pdf';
}

/**
 * Gera um nome único para arquivo baseado no timestamp
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = sanitizeFileName(originalName);
  
  if (prefix) {
    return `${prefix}-${timestamp}-${randomSuffix}-${sanitizedName}`;
  }
  
  return `${timestamp}-${randomSuffix}-${sanitizedName}`;
}

/**
 * Valida múltiplos arquivos
 */
export function validateMultipleFiles(
  files: FileList | File[], 
  constraints: FileConstraints
): { validFiles: File[]; errors: string[] } {
  const validFiles: File[] = [];
  const errors: string[] = [];

  const fileArray = Array.from(files);

  fileArray.forEach((file, index) => {
    const validation = validateFile(file, constraints);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`Arquivo ${index + 1} (${file.name}): ${validation.error}`);
    }
  });

  return { validFiles, errors };
}

/**
 * Converte File para base64 (útil para preview)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Lê arquivo como ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = error => reject(error);
  });
}
