'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { validatePdfFile } from '@/lib/utils/file-validation';
import { formatFileSize } from '@/lib/utils/file-validation';

interface PdfUploadProps {
  candidateId?: string;
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadResult {
  fileName: string;
  fileSize: number;
  blobName: string;
  blobUrl: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: UploadResult;
}

export default function PdfUpload({
  candidateId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  disabled = false,
  className = ''
}: PdfUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validar número máximo de arquivos
    if (uploadingFiles.length + fileArray.length > maxFiles) {
      const error = `Máximo de ${maxFiles} arquivos permitidos`;
      onUploadError?.(error);
      return;
    }

    // Validar cada arquivo
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = validatePdfFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        onUploadError?.(validation.error || 'Arquivo inválido');
      }
    }

    if (validFiles.length === 0) return;

    // Adicionar arquivos à lista de upload
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Fazer upload de cada arquivo
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      await uploadFile(file, uploadingFiles.length + i);
    }
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (candidateId) {
        formData.append('candidateId', candidateId);
      }

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Sucesso
        setUploadingFiles(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, status: 'success', progress: 100, result: result.data }
            : item
        ));
        
        onUploadSuccess?.(result.data);
      } else {
        // Erro
        const errorMessage = result.error || 'Erro no upload';
        setUploadingFiles(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, status: 'error', error: errorMessage }
            : item
        ));
        
        onUploadError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
      setUploadingFiles(prev => prev.map((item, i) => 
        i === index 
          ? { ...item, status: 'error', error: errorMessage }
          : item
      ));
      
      onUploadError?.(errorMessage);
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
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
          Máximo {maxFiles} arquivos
        </p>
      </div>

      {/* Lista de Arquivos */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Arquivos ({uploadingFiles.length})
          </h4>
          
          {uploadingFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <File className="h-5 w-5 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Icon */}
                {item.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                )}
                {item.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={item.status === 'uploading'}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagens de Erro */}
      {uploadingFiles.some(f => f.status === 'error') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Alguns arquivos falharam no upload:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {uploadingFiles
                    .filter(f => f.status === 'error')
                    .map((f, i) => (
                      <li key={i}>
                        {f.file.name}: {f.error}
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
}

