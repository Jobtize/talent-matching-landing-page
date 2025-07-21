# 🚀 Guia Completo de Deploy no Azure App Service

Este guia te levará passo a passo para fazer o deploy do TalentMatch Landing Page no Azure App Service.

## 📋 Pré-requisitos

1. **Conta Azure for Students** ativa
2. **Azure CLI** instalado (opcional, mas recomendado)
3. **Acesso ao Portal Azure**

## 🎯 Passo 1: Criar o Azure App Service

### Via Portal Azure (Recomendado):

1. **Acesse o Portal Azure**: https://portal.azure.com
2. **Clique em "Criar um recurso"**
3. **Procure por "App Service"** e clique em "Criar"

### Configurações do App Service:

#### **Básico:**
- **Subscription**: Azure for Students
- **Resource Group**: Criar novo → `talentmatch-rg`
- **Name**: `talentmatch-landing` (ou outro nome único)
- **Publish**: `Code`
- **Runtime stack**: `Node 18 LTS`
- **Operating System**: `Linux`
- **Region**: `Brazil South` (ou mais próxima)

#### **Pricing:**
- **Sku and size**: `F1 (Free)` 
- ✅ **1 GB storage**
- ✅ **165 minutes/day CPU**
- ✅ **No cost**

4. **Clique em "Review + create"**
5. **Clique em "Create"**

### Via Azure CLI (Alternativo):
```bash
# Login no Azure
az login

# Criar resource group
az group create --name talentmatch-rg --location brazilsouth

# Criar App Service Plan (Free tier)
az appservice plan create \
  --name talentmatch-plan \
  --resource-group talentmatch-rg \
  --sku F1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group talentmatch-rg \
  --plan talentmatch-plan \
  --name talentmatch-landing \
  --runtime "NODE|18-lts"
```

## 🔧 Passo 2: Configurar Deploy Automático via GitHub

### 2.1 Configurar GitHub Actions:

1. **No Portal Azure**, vá para seu App Service
2. **Clique em "Deployment Center"** no menu lateral
3. **Source**: Selecione `GitHub`
4. **Authorize** sua conta GitHub
5. **Organization**: Selecione sua organização
6. **Repository**: `talent-matching-landing-page`
7. **Branch**: `main`
8. **Clique em "Save"**

Isso criará automaticamente:
- GitHub Action workflow
- Secret `AZURE_WEBAPP_PUBLISH_PROFILE` no seu repositório

### 2.2 Verificar o Workflow:

O Azure criará um arquivo similar ao nosso `.github/workflows/azure-deploy.yml`. 
Você pode usar o nosso arquivo que já está otimizado!

## 🗄️ Passo 3: Configurar Azure SQL Database

### 3.1 Criar o Banco (se ainda não criou):

Siga o guia completo em [`DATABASE_SETUP.md`](./DATABASE_SETUP.md)

**Resumo rápido:**
```bash
# Criar SQL Server
az sql server create \
  --name talentmatch-server \
  --resource-group talentmatch-rg \
  --location brazilsouth \
  --admin-user talentadmin \
  --admin-password "SuaSenhaSegura123!"

# Criar SQL Database
az sql db create \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --name talentmatch-db \
  --service-objective Basic
```

### 3.2 Configurar Firewall:
```bash
# Permitir serviços do Azure
az sql server firewall-rule create \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### 4.1 No Portal Azure:

1. **Vá para seu App Service**
2. **Clique em "Configuration"** no menu lateral
3. **Clique em "New application setting"**

### 4.2 Adicionar as seguintes variáveis:

```
AZURE_SQL_SERVER = "talentmatch-server.database.windows.net"
AZURE_SQL_DATABASE = "talentmatch-db"
AZURE_SQL_USERNAME = "talentadmin"
AZURE_SQL_PASSWORD = "SuaSenhaSegura123!"
NEXT_PUBLIC_APP_URL = "https://talentmatch-landing.azurewebsites.net"
NODE_ENV = "production"
```

### 4.3 Via Azure CLI:
```bash
az webapp config appsettings set \
  --resource-group talentmatch-rg \
  --name talentmatch-landing \
  --settings \
    AZURE_SQL_SERVER="talentmatch-server.database.windows.net" \
    AZURE_SQL_DATABASE="talentmatch-db" \
    AZURE_SQL_USERNAME="talentadmin" \
    AZURE_SQL_PASSWORD="SuaSenhaSegura123!" \
    NEXT_PUBLIC_APP_URL="https://talentmatch-landing.azurewebsites.net" \
    NODE_ENV="production"
```

## 🚀 Passo 5: Fazer o Deploy

### 5.1 Commit e Push:

```bash
# Adicionar arquivos de configuração
git add .
git commit -m "🚀 Configurar deploy para Azure App Service"
git push origin main
```

### 5.2 Monitorar o Deploy:

1. **Vá para o GitHub** → Actions
2. **Veja o workflow** rodando
3. **Aguarde a conclusão** (3-5 minutos)

### 5.3 Verificar no Azure:

1. **Portal Azure** → Seu App Service
2. **Deployment Center** → Logs
3. **Overview** → URL da aplicação

## 🧪 Passo 6: Testar a Aplicação

### 6.1 Acessar a URL:
```
https://talentmatch-landing.azurewebsites.net
```

### 6.2 Testar o Formulário:
1. Preencha todos os campos
2. Submeta o formulário
3. Verifique se aparece mensagem de sucesso
4. Confirme no banco de dados

### 6.3 Verificar Logs:
```bash
# Via Azure CLI
az webapp log tail --resource-group talentmatch-rg --name talentmatch-landing
```

## 🔍 Troubleshooting

### Problemas Comuns:

#### 1. **Erro de Build:**
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js version está correto (18 LTS)

#### 2. **Erro de Conexão com Banco:**
- Verifique as variáveis de ambiente
- Confirme se o firewall do SQL Server permite conexões do Azure
- Teste a connection string

#### 3. **Aplicação não inicia:**
- Verifique se o `server.js` está correto
- Confirme se o `web.config` está presente
- Veja os logs no Portal Azure

#### 4. **API Routes não funcionam:**
- Confirme se o `server.js` está configurado corretamente
- Verifique se as rotas estão em `/src/app/api/`

### Comandos Úteis:

```bash
# Ver logs em tempo real
az webapp log tail --resource-group talentmatch-rg --name talentmatch-landing

# Reiniciar a aplicação
az webapp restart --resource-group talentmatch-rg --name talentmatch-landing

# Ver configurações
az webapp config appsettings list --resource-group talentmatch-rg --name talentmatch-landing
```

## 📊 Monitoramento

### Métricas Importantes:
- **CPU Usage**: Deve ficar abaixo de 165 min/dia
- **Memory Usage**: Máximo 1GB
- **HTTP Requests**: Monitorar volume
- **Response Time**: Otimizar se necessário

### Alertas Recomendados:
- CPU quota exceeded
- Memory usage > 80%
- HTTP 5xx errors
- Database connection failures

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. **Configurar domínio personalizado** (opcional)
2. **Implementar SSL customizado** (opcional)
3. **Configurar backup automático**
4. **Implementar monitoramento avançado**
5. **Configurar CI/CD para staging**

## 📞 Suporte

- **Documentação Azure App Service**: https://docs.microsoft.com/azure/app-service/
- **Suporte Azure**: https://azure.microsoft.com/support/
- **GitHub Actions**: https://docs.github.com/actions

---

🎉 **Parabéns! Sua aplicação estará rodando em produção no Azure!** 🎉

