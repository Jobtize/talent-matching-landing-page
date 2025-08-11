'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { validatePdfFile } from '@/lib/utils/file-validation';
import { formatFileSize } from '@/lib/utils/file-validation';

interface PdfUploadProps {
  candidateId?: string;
  onFilesValidated?: (files: ValidatedFile[]) => void;
  onValidationError?: (error: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export interface ValidatedFile {
  file: File;
  fileName: string;
  fileSize: number;
  status: 'validating' | 'valid' | 'invalid';
  error?: string;
}

export interface PdfUploadRef {
  reset: () => void;
}

const PdfUpload = forwardRef<PdfUploadRef, PdfUploadProps>(({
  candidateId,
  onFilesValidated,
  onValidationError,
  maxFiles = 5,
  disabled = false,
  className = ''
}, ref) => {
  const [validatedFiles, setValidatedFiles] = useState<ValidatedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expor função reset para o componente pai
  useImperativeHandle(ref, () => ({
    reset: () => {
      setValidatedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }));

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Para maxFiles = 1, substituir o arquivo existente
    if (maxFiles === 1 && fileArray.length === 1) {
      // Substituir arquivo existente
      const newValidatingFile: ValidatedFile = {
        file: fileArray[0],
        fileName: fileArray[0].name,
        fileSize: fileArray[0].size,
        status: 'validating'
      };
      setValidatedFiles([newValidatingFile]);
    } else {
      // Validar número máximo de arquivos para casos com múltiplos arquivos
      if (validatedFiles.length + fileArray.length > maxFiles) {
        const error = `Máximo de ${maxFiles} arquivos permitidos`;
        onValidationError?.(error);
        return;
      }

      // Criar arquivos em estado de validação
      const newValidatingFiles: ValidatedFile[] = fileArray.map(file => ({
        file,
        fileName: file.name,
        fileSize: file.size,
        status: 'validating'
      }));

      setValidatedFiles(prev => [...prev, ...newValidatingFiles]);
    }

    // Validar cada arquivo
    const updatedFiles: ValidatedFile[] = [];
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileIndex = maxFiles === 1 ? 0 : validatedFiles.length + i;
      
      try {
        const validation = await validatePdfFile(file);
        const updatedFile: ValidatedFile = {
          file,
          fileName: file.name,
          fileSize: file.size,
          status: validation.isValid ? 'valid' : 'invalid',
          error: validation.error
        };
        
        updatedFiles.push(updatedFile);
        
        // Atualizar estado individual do arquivo
        setValidatedFiles(prev => prev.map((item, index) => 
          index === fileIndex ? updatedFile : item
        ));
        
        if (!validation.isValid) {
          onValidationError?.(validation.error || 'Arquivo inválido');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro na validação';
        const updatedFile: ValidatedFile = {
          file,
          fileName: file.name,
          fileSize: file.size,
          status: 'invalid',
          error: errorMessage
        };
        
        updatedFiles.push(updatedFile);
        
        setValidatedFiles(prev => prev.map((item, index) => 
          index === fileIndex ? updatedFile : item
        ));
        
        onValidationError?.(errorMessage);
      }
    }

    // Notificar arquivos validados
    setTimeout(() => {
      const allValidFiles = [...validatedFiles, ...updatedFiles].filter(f => f.status === 'valid');
      onFilesValidated?.(allValidFiles);
    }, 100);
  };

  const removeFile = (index: number) => {
    setValidatedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Notificar arquivos validados atualizados
      const validFiles = newFiles.filter(f => f.status === 'valid');
      onFilesValidated?.(validFiles);
      return newFiles;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Clique para enviar ou arraste arquivos aqui
        </p>
        <p className="text-sm text-gray-500">
          Apenas arquivos PDF, máximo 10MB cada
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Máximo {maxFiles} arquivo apenas
        </p>
      </div>

      {/* Lista de Arquivos */}
      {validatedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Arquivos ({validatedFiles.length})
          </h4>
          
          {validatedFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <File className="h-5 w-5 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.fileSize)}
                  </p>
                  {item.status === 'valid' && (
                    <p className="text-xs text-green-600">
                      ✅ Validado e pronto para envio
                    </p>
                  )}
                  {item.status === 'invalid' && item.error && (
                    <p className="text-xs text-red-600">
                      ❌ {item.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Icon */}
                {item.status === 'validating' && (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                )}
                {item.status === 'valid' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {item.status === 'invalid' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={item.status === 'validating'}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagens de Erro */}
      {validatedFiles.some(f => f.status === 'invalid') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Alguns arquivos não passaram na validação:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {validatedFiles
                    .filter(f => f.status === 'invalid')
                    .map((f, i) => (
                      <li key={i}>
                        {f.fileName}: {f.error}
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PdfUpload.displayName = 'PdfUpload';

export default PdfUpload;
