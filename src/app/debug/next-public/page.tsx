import NextPublicDebug from '@/components/debug/NextPublicDebug';

export default function NextPublicDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Debug: NEXT_PUBLIC_* Environment Variables
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Esta página demonstra como as variáveis de ambiente <code className="bg-gray-200 px-2 py-1 rounded">NEXT_PUBLIC_*</code> 
            são processadas e expostas no Next.js, comparando o comportamento no servidor vs cliente.
          </p>
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Aviso de Segurança
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Esta página expõe informações de debug incluindo valores de variáveis de ambiente. 
                  <strong> Remova esta página em produção</strong> ou adicione autenticação adequada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            📖 Como Funcionam as Variáveis NEXT_PUBLIC_*
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">🏗️ Durante o Build</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Next.js procura por <code>process.env.NEXT_PUBLIC_*</code></li>
                <li>Substitui essas referências pelos valores literais</li>
                <li>Os valores ficam &quot;hardcoded&quot; no JavaScript</li>
                <li>Não há mais referência ao <code>process.env</code></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🌐 No Runtime</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cliente: Apenas valores inlined estão disponíveis</li>
                <li>Servidor: Todas as variáveis de ambiente funcionam</li>
                <li>Mudanças nas variáveis requerem rebuild</li>
                <li>Valores são visíveis no código fonte do cliente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exemplo de Código */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💻 Exemplo de Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">📝 Código Original</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Em seu componente React
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Durante desenvolvimento
console.log(apiKey); // &quot;AIzaSy...&quot;`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🏗️ Após o Build</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// No JavaScript final (bundle)
const apiKey = &quot;AIzaSyBe6O...real_key_here&quot;;

// O process.env foi substituído!
console.log(apiKey); // &quot;AIzaSy...&quot;`}
              </pre>
            </div>
          </div>
        </div>

        {/* Componente de Debug */}
        <NextPublicDebug />

        {/* Links Úteis */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔗 Links Úteis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">📚 Documentação</h3>
              <ul className="space-y-1 text-blue-600">
                <li>
                  <a href="https://nextjs.org/docs/basic-features/environment-variables" 
                     target="_blank" rel="noopener noreferrer" 
                     className="hover:underline">
                    Next.js Environment Variables
                  </a>
                </li>
                <li>
                  <a href="https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser" 
                     target="_blank" rel="noopener noreferrer" 
                     className="hover:underline">
                    Exposing Variables to Browser
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🛠️ Debug Endpoints</h3>
              <ul className="space-y-1 text-blue-600">
                <li>
                  <a href="/api/debug/env" className="hover:underline">
                    /api/debug/env - Variáveis básicas
                  </a>
                </li>
                <li>
                  <a href="/api/debug/next-public" className="hover:underline">
                    /api/debug/next-public - Análise detalhada
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
