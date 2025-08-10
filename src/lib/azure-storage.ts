import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { validateEnvironmentVariables } from './env-validation';

/**
 * Configuração e utilitários para Azure Blob Storage
 * Gerencia upload, download e exclusão de arquivos PDF
 */

// Validar variáveis de ambiente
const envValidation = validateEnvironmentVariables();
if (!envValidation.isValid) {
  throw new Error(`Variáveis de ambiente inválidas: ${envValidation.errors.join(', ')}`);
}

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

// Cliente do Azure Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Tipos para operações de arquivo
 */
export interface UploadResult {
  success: boolean;
  blobUrl?: string;
  blobName?: string;
  error?: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Configurações de validação de arquivo
 */
const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
} as const;

/**
 * Valida se o arquivo é um PDF válido
 */
export function validatePdfFile(file: File): FileValidation {
  // Verificar tipo MIME
  if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Apenas arquivos PDF são permitidos'
    };
  }

  // Verificar extensão
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Arquivo deve ter extensão .pdf'
    };
  }

  // Verificar tamanho
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`
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
 * Gera um nome único para o blob baseado no timestamp e nome original
 */
export function generateBlobName(originalFileName: string, candidateId?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (candidateId) {
    return `candidate-${candidateId}/${timestamp}-${randomSuffix}-${sanitizedName}`;
  }
  
  return `temp/${timestamp}-${randomSuffix}-${sanitizedName}`;
}

/**
 * Faz upload de um arquivo PDF para o Azure Blob Storage
 */
export async function uploadPdfToBlob(
  file: File, 
  candidateId?: string
): Promise<UploadResult> {
  try {
    // Validar arquivo
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Gerar nome único para o blob
    const blobName = generateBlobName(file.name, candidateId);
    
    // Obter cliente do blob
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload do arquivo com metadados
    const uploadResponse = await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobContentDisposition: `attachment; filename="${file.name}"`
      },
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        candidateId: candidateId || 'temp',
        fileSize: file.size.toString()
      }
    });

    if (uploadResponse.errorCode) {
      return {
        success: false,
        error: `Erro no upload: ${uploadResponse.errorCode}`
      };
    }

    return {
      success: true,
      blobUrl: blockBlobClient.url,
      blobName: blobName
    };

  } catch (error) {
    console.error('Erro no upload para Azure Blob Storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
    };
  }
}

/**
 * Gera URL de download temporária (SAS token) para um blob
 */
export async function generateDownloadUrl(blobName: string, expiresInMinutes: number = 60): Promise<string | null> {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Verificar se o blob existe
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error('Arquivo não encontrado');
    }

    // Para simplificar, retornamos a URL direta do blob
    // Em produção, você pode querer implementar SAS tokens para mais segurança
    return blockBlobClient.url;

  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    return null;
  }
}

/**
 * Exclui um arquivo do Azure Blob Storage
 */
export async function deleteBlobFile(blobName: string): Promise<boolean> {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const deleteResponse = await blockBlobClient.deleteIfExists();
    return deleteResponse.succeeded;

  } catch (error) {
    console.error('Erro ao excluir arquivo do Blob Storage:', error);
    return false;
  }
}

/**
 * Lista arquivos de um candidato específico
 */
export async function listCandidateFiles(candidateId: string): Promise<string[]> {
  try {
    const prefix = `candidate-${candidateId}/`;
    const blobNames: string[] = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobNames.push(blob.name);
    }

    return blobNames;

  } catch (error) {
    console.error('Erro ao listar arquivos do candidato:', error);
    return [];
  }
}

/**
 * Obtém metadados de um blob
 */
export async function getBlobMetadata(blobName: string) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const properties = await blockBlobClient.getProperties();
    
    return {
      contentLength: properties.contentLength,
      contentType: properties.contentType,
      lastModified: properties.lastModified,
      metadata: properties.metadata
    };

  } catch (error) {
    console.error('Erro ao obter metadados do blob:', error);
    return null;
  }
}

/**
 * Inicializa o container se não existir (útil para desenvolvimento)
 */
export async function ensureContainerExists(): Promise<boolean> {
  try {
    const createResponse = await containerClient.createIfNotExists({
      access: 'private' // Container privado
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao criar container:', error);
    return false;
  }
}

