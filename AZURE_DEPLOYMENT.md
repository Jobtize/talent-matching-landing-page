# 🚀 Guia de Deploy no Azure

Este documento contém instruções detalhadas para configurar as variáveis de ambiente no Azure App Service.

## 📋 Variáveis de Ambiente Necessárias

### 🔗 Azure SQL Database (Obrigatórias)
```
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database-name
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password
```

### 🌐 Next.js Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.azurewebsites.net
```

### 🗺️ Google Maps API (Opcional, mas recomendada)
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 📊 Google Analytics (Opcional)
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-measurement-id
```

## 🛠️ Como Configurar no Azure Portal

### 1. Acessar as Configurações do App Service
1. Faça login no [Portal do Azure](https://portal.azure.com)
2. Navegue até seu **App Service**
3. No menu lateral, clique em **Configuration**
4. Vá para a aba **Application settings**

### 2. Adicionar Variáveis de Ambiente
Para cada variável listada acima:

1. Clique em **+ New application setting**
2. **Name**: Digite o nome exato da variável (ex: `AZURE_SQL_SERVER`)
3. **Value**: Digite o valor correspondente
4. Clique em **OK**

### 3. Salvar e Reiniciar
1. Clique em **Save** no topo da página
2. Aguarde a confirmação de que as configurações foram salvas
3. **Reinicie o App Service** para aplicar as mudanças

## 🗺️ Configuração da API do Google Maps

### Obter Chave da API
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **+ CREATE CREDENTIALS** > **API key**
5. Copie a chave gerada

### Habilitar APIs Necessárias
No Google Cloud Console, habilite as seguintes APIs:
- **Maps JavaScript API**
- **Places API** 
- **Geocoding API**

### Configurar Restrições (Recomendado)
1. Clique na chave criada para editá-la
2. Em **Application restrictions**, selecione **HTTP referrers**
3. Adicione seus domínios:
   - `https://your-app.azurewebsites.net/*`
   - `http://localhost:3002/*` (para desenvolvimento)

## 🔍 Verificação da Configuração

### Health Check do Banco de Dados
Após o deploy, acesse:
```
https://your-app.azurewebsites.net/api/health/database
```

### Verificar Google Maps
Se a chave estiver configurada corretamente, o autocomplete de localização e o mapa devem funcionar na página de cadastro.

## ⚠️ Problemas Comuns

### Google Maps não funciona
- ✅ Verifique se `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está configurada
- ✅ Confirme se as APIs estão habilitadas no Google Cloud
- ✅ Verifique se o domínio está nas restrições da API key
- ✅ Reinicie o App Service após adicionar a variável

### Erro de Conexão com Banco
- ✅ Verifique se todas as 4 variáveis do Azure SQL estão configuradas
- ✅ Confirme se o servidor SQL permite conexões do Azure
- ✅ Teste a conexão usando o endpoint `/api/health/database`

### Variáveis não são reconhecidas
- ✅ Certifique-se de que salvou as configurações no Azure
- ✅ Reinicie o App Service após adicionar variáveis
- ✅ Verifique se os nomes das variáveis estão exatos (case-sensitive)

## 🔄 Processo de Deploy Recomendado

1. **Configure todas as variáveis** no Azure Portal
2. **Salve as configurações**
3. **Reinicie o App Service**
4. **Teste o health check**: `/api/health/database`
5. **Teste a funcionalidade** de cadastro de candidatos
6. **Verifique o Google Maps** na página de cadastro

## 📞 Suporte

Se encontrar problemas, verifique:
- Logs do App Service no Azure Portal
- Console do navegador para erros JavaScript
- Endpoint de health check para status do banco de dados
