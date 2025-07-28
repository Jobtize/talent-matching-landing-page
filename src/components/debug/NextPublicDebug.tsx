'use client';

import { useEffect, useState } from 'react';

interface ServerData {
  data: {
    nextPublicVars: Record<string, string | undefined>;
    privateVars: Record<string, string | undefined>;
    googleMapsAnalysis: {
      exists: boolean;
      length: number;
      preview: string;
      type: string;
      isAccessibleOnServer: boolean;
      rawValue: string | undefined;
    };
  };
}

interface DebugData {
  clientSide: {
    nextPublicVars: Record<string, string | undefined>;
    privateVarsTest: Record<string, string | undefined>;
    googleMapsAnalysis: {
      exists: boolean;
      length: number;
      preview: string;
      type: string;
      isAccessibleOnClient: boolean;
      rawValue: string | undefined;
    };
    clientInfo: {
      timestamp: string;
      userAgent: string;
      location: string;
    };
  };
}

export default function NextPublicDebug() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeClientSide = () => {
      const nextPublicVars: Record<string, string | undefined> = {
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      };

      const privateVarsTest: Record<string, string | undefined> = {
        AZURE_SQL_SERVER: (process.env as Record<string, string | undefined>).AZURE_SQL_SERVER,
        AZURE_SQL_PASSWORD: (process.env as Record<string, string | undefined>).AZURE_SQL_PASSWORD,
        NODE_ENV: process.env.NODE_ENV,
      };

      const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const googleMapsAnalysis = {
        exists: !!googleMapsKey,
        length: googleMapsKey?.length || 0,
        preview: googleMapsKey ? `${googleMapsKey.substring(0, 10)}...` : 'undefined',
        type: typeof googleMapsKey,
        isAccessibleOnClient: !!googleMapsKey,
        rawValue: googleMapsKey,
      };

      const clientInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        location: window.location.href,
      };

      return {
        clientSide: {
          nextPublicVars,
          privateVarsTest,
          googleMapsAnalysis,
          clientInfo,
        },
      };
    };

    const fetchServerData = async () => {
      try {
        const response = await fetch('/api/debug/next-public');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erro ao buscar dados do servidor:', error);
        return null;
      }
    };

    const runAnalysis = async () => {
      const clientAnalysis = analyzeClientSide();
      const serverAnalysis = await fetchServerData();

      setDebugData(clientAnalysis);
      setServerData(serverAnalysis);
      setLoading(false);      
      // Log comparativo
      console.log('🔄 [COMPARISON] Cliente vs Servidor:');
      console.log('Cliente - Google Maps Key:', clientAnalysis.clientSide.googleMapsAnalysis.rawValue);
      console.log('Servidor - Google Maps Key:', (serverAnalysis as ServerData)?.data?.googleMapsAnalysis?.rawValue);
    };

    runAnalysis();
  }, []);

  if (loading) {
    return (
        <div className="p-6 bg-gray-100 rounded-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-2">🧪 Debug: NEXT_PUBLIC_* Variables</h2>
          <p className="text-blue-700">Esta análise mostra como as variáveis NEXT_PUBLIC_* são processadas no cliente vs servidor.</p>
        </div>

      {/* Analise do Cliente */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          📱 Lado Cliente (Browser)
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-800 mb-2">🔓 Variáveis NEXT_PUBLIC_* (Acessíveis)</h4>
            <pre className="bg-green-100 p-3 rounded text-sm overflow-x-auto">

              {JSON.stringify(debugData?.clientSide.nextPublicVars, null, 2)}
            </pre>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">🔒 Variáveis Privadas (Devem ser undefined)</h4>
              <pre className="bg-green-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugData?.clientSide.privateVarsTest, null, 2)}
            </pre>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">🗺️ Análise Google Maps Key</h4>
              <pre className="bg-green-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugData?.clientSide.googleMapsAnalysis, null, 2)}
            </pre>
            </div>
          </div>
        </div>

      {/* Analise do Servidor */}
      {serverData && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            🖥️ Lado Servidor (Node.js)
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🔓 Variáveis NEXT_PUBLIC_*</h4>
              <pre className="bg-purple-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(serverData.data.nextPublicVars, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🔒 Variáveis Privadas</h4>
              <pre className="bg-purple-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(serverData.data.privateVars, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🗺️ Análise Google Maps Key</h4>
              <pre className="bg-purple-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(serverData.data.googleMapsAnalysis, null, 2)}
              </pre>
                </div>
              </div>
            </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">🔄 Comparação Cliente vs Servidor</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">📱 Cliente</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ NEXT_PUBLIC_* são acessíveis</li>
                <li>❌ Variáveis privadas são undefined</li>
                <li>🏗️ Valores são &quot;inlined&quot; durante o build</li>
                <li>🔒 Não pode acessar secrets do servidor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">🖥️ Servidor</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ NEXT_PUBLIC_* são acessíveis</li>
                <li>✅ Variáveis privadas são acessíveis</li>
                <li>🌐 Valores vêm do ambiente real</li>
                <li>🔑 Pode acessar todos os secrets</li>
              </ul>
            </div>
          </div>
        </div>      )}

      {/* Comparacao */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          🔄 Comparação Cliente vs Servidor
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">📱 Cliente</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✅ NEXT_PUBLIC_* são acessíveis</li>
              <li>❌ Variáveis privadas são undefined</li>
              <li>🏗️ Valores são &quot;inlined&quot; durante o build</li>
              <li>🔒 Não pode acessar secrets do servidor</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">🖥️ Servidor</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✅ NEXT_PUBLIC_* são acessíveis</li>
              <li>✅ Variáveis privadas são acessíveis</li>
              <li>🌐 Valores vêm do ambiente real</li>
              <li>🔑 Pode acessar todos os secrets</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Explicacao Tecnica */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📚 Como Funciona o NEXT_PUBLIC_*
        </h3>
        
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>🏗️ Build Time:</strong> Durante o build, o Next.js encontra todas as referências a <code>process.env.NEXT_PUBLIC_*</code> e as substitui pelos valores literais.</p>
          <p><strong>📦 Bundle:</strong> No JavaScript final, <code>process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> vira <code>&quot;AIzaSy...&quot;</code> diretamente no código.</p>
          <p><strong>🌐 Runtime:</strong> No cliente, não existe mais <code>process.env</code> - apenas os valores hardcoded.</p>
          <p><strong>🔒 Segurança:</strong> Por isso nunca coloque secrets em NEXT_PUBLIC_* - eles ficam visíveis no código fonte!</p>
        </div>
      </div>
  );
}