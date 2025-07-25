'use client';

import React from 'react';

/**
 * Componente de debug para verificar variáveis de ambiente no cliente
 * REMOVER EM PRODUÇÃO - apenas para debugging
 */
export function EnvDebug() {
  const [envData, setEnvData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Verificar variáveis no cliente
    const clientEnv = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'não configurada',
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 
        `configurada (${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...)` : 
        'não configurada',
      NODE_ENV: process.env.NODE_ENV || 'não configurada',
      isClient: typeof window !== 'undefined'
    };

    // Buscar dados do servidor também
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(serverData => {
        setEnvData({
          client: clientEnv,
          server: serverData.data || serverData
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar dados do servidor:', error);
        setEnvData({
          client: clientEnv,
          server: { error: 'Falha ao buscar dados do servidor' }
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p>🔍 Carregando informações de debug...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug - Variáveis de Ambiente</h3>
      <div className="space-y-2">
        <div>
          <strong>Cliente (Browser):</strong>
          <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
            {JSON.stringify(envData?.client, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Servidor (API):</strong>
          <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
            {JSON.stringify(envData?.server, null, 2)}
          </pre>
        </div>
      </div>
      <p className="mt-2 text-xs text-yellow-600">
        ⚠️ Este componente deve ser removido em produção
      </p>
    </div>
  );
}
