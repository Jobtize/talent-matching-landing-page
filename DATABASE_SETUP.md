# 🗄️ Configuração do Azure SQL Database

Este documento contém as instruções para configurar o Azure SQL Database para o projeto TalentMatch Landing Page.

## 📋 Pré-requisitos

1. **Conta Azure** com permissões para criar recursos
2. **Azure CLI** instalado (opcional, mas recomendado)
3. **SQL Server Management Studio** ou **Azure Data Studio** para gerenciar o banco

## 🚀 Passo a Passo

### 1. Criar o Azure SQL Database

#### Via Portal Azure:
1. Acesse o [Portal Azure](https://portal.azure.com)
2. Clique em "Criar um recurso"
3. Procure por "SQL Database"
4. Configure:
   - **Nome do banco**: `talentmatch-db`
   - **Servidor**: Criar novo servidor
   - **Nome do servidor**: `talentmatch-server` (ou outro nome único)
   - **Localização**: Brazil South (ou mais próxima)
   - **Autenticação**: SQL Authentication
   - **Login do administrador**: `talentadmin`
   - **Senha**: `SuaSenhaSegura123!` (ou outra senha forte)

#### Via Azure CLI:
```bash
# Criar resource group
az group create --name talentmatch-rg --location brazilsouth

# Criar SQL Server
az sql server create \
  --name talentmatch-server \
  --resource-group talentmatch-rg \
  --location brazilsouth \
  --admin-user talentadmin \
  --admin-password SuaSenhaSegura123!

# Criar SQL Database
az sql db create \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --name talentmatch-db \
  --service-objective Basic
```

### 2. Configurar Firewall

Para permitir conexões externas:

```bash
# Permitir serviços do Azure
az sql server firewall-rule create \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Permitir seu IP (substitua pelo seu IP público)
az sql server firewall-rule create \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --name AllowMyIP \
  --start-ip-address SEU.IP.PUBLICO.AQUI \
  --end-ip-address SEU.IP.PUBLICO.AQUI
```

### 3. Criar as Tabelas

Execute o seguinte script SQL no seu banco:

```sql
-- Tabela principal de candidatos
CREATE TABLE candidates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    telefone NVARCHAR(30),
    cargo NVARCHAR(100),
    experiencia NVARCHAR(50),
    localizacao NVARCHAR(100),
    areas NVARCHAR(500),
    tecnologias NTEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'active'
);

-- Tabela de tecnologias normalizadas
CREATE TABLE candidate_technologies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    candidate_id INT NOT NULL,
    technology_name NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    CONSTRAINT UQ_candidate_technology UNIQUE (candidate_id, technology_name)
);

-- Tabela de arquivos PDF dos candidatos
CREATE TABLE candidate_files (
    id INT IDENTITY(1,1) PRIMARY KEY,
    candidate_id INT NULL, -- Permite NULL para arquivos enviados antes do cadastro
    file_name NVARCHAR(255) NOT NULL,
    original_name NVARCHAR(255) NOT NULL,
    blob_name NVARCHAR(500) NOT NULL,
    blob_url NVARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type NVARCHAR(100) DEFAULT 'application/pdf',
    uploaded_at DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    CONSTRAINT UQ_candidate_blob_name UNIQUE (blob_name)
);

-- Tabela de logs de auditoria
CREATE TABLE candidate_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    candidate_id INT,
    action NVARCHAR(50) NOT NULL,
    details NVARCHAR(500),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    performed_by NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER tr_candidates_updated_at
ON candidates
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE candidates 
    SET updated_at = GETDATE()
    FROM candidates c
    INNER JOIN inserted i ON c.id = i.id;
END;

-- Índices para performance
CREATE INDEX IX_candidates_email ON candidates(email);
CREATE INDEX IX_candidates_created_at ON candidates(created_at);
CREATE INDEX IX_candidate_technologies_candidate_id ON candidate_technologies(candidate_id);
CREATE INDEX IX_candidate_technologies_technology_name ON candidate_technologies(technology_name);
CREATE INDEX IX_candidate_files_candidate_id ON candidate_files(candidate_id);
CREATE INDEX IX_candidate_files_uploaded_at ON candidate_files(uploaded_at);
CREATE INDEX IX_candidate_files_status ON candidate_files(status);
CREATE INDEX IX_candidate_logs_candidate_id ON candidate_logs(candidate_id);
CREATE INDEX IX_candidate_logs_created_at ON candidate_logs(created_at);
```

### 4. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite o `.env.local` com suas credenciais:
```env
AZURE_SQL_SERVER="talentmatch-server.database.windows.net"
AZURE_SQL_DATABASE="talentmatch-db"
AZURE_SQL_USERNAME="talentadmin"
AZURE_SQL_PASSWORD="SuaSenhaSegura123!"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
```

### 5. Testar a Conexão

Execute o projeto e teste o formulário:

```bash
npm run dev
```

Acesse `http://localhost:3002` e preencha o formulário para testar a integração.

## 🔍 Verificação dos Dados

Para verificar se os dados estão sendo inseridos corretamente:

```sql
-- Ver todos os candidatos
SELECT * FROM candidates ORDER BY created_at DESC;

-- Ver tecnologias por candidato
SELECT 
    c.nome,
    c.email,
    STRING_AGG(ct.technology_name, ', ') as tecnologias
FROM candidates c
LEFT JOIN candidate_technologies ct ON c.id = ct.candidate_id
GROUP BY c.id, c.nome, c.email
ORDER BY c.created_at DESC;

-- Ver logs de auditoria
SELECT 
    cl.*,
    c.nome as candidate_name
FROM candidate_logs cl
LEFT JOIN candidates c ON cl.candidate_id = c.id
ORDER BY cl.created_at DESC;
```

## 🛡️ Segurança

### Recomendações de Produção:

1. **Firewall**: Configure regras específicas para IPs conhecidos
2. **SSL**: Sempre use conexões criptografadas (já habilitado)
3. **Backup**: Configure backup automático
4. **Monitoramento**: Configure alertas para falhas de conexão
5. **Secrets**: Use Azure Key Vault para credenciais em produção

### Configuração de Backup:
```bash
az sql db ltr-policy set \
  --resource-group talentmatch-rg \
  --server talentmatch-server \
  --database talentmatch-db \
  --weekly-retention P4W \
  --monthly-retention P12M \
  --yearly-retention P7Y
```

## 📊 Monitoramento

### Queries Úteis para Monitoramento:

```sql
-- Estatísticas de cadastros por dia
SELECT 
    CAST(created_at AS DATE) as data,
    COUNT(*) as total_cadastros
FROM candidates 
WHERE created_at >= DATEADD(day, -30, GETDATE())
GROUP BY CAST(created_at AS DATE)
ORDER BY data DESC;

-- Tecnologias mais populares
SELECT 
    technology_name,
    COUNT(*) as quantidade
FROM candidate_technologies
GROUP BY technology_name
ORDER BY quantidade DESC;

-- Logs de erro (se houver)
SELECT * FROM candidate_logs 
WHERE action = 'ERROR' 
ORDER BY created_at DESC;
```

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão**: Verifique firewall e credenciais
2. **Timeout**: Aumente o timeout na configuração
3. **Constraint violation**: Verifique duplicação de emails
4. **Performance lenta**: Analise índices e queries

### Logs de Debug:
```javascript
// Adicione no seu código para debug
console.log('Tentando conectar ao banco:', process.env.AZURE_SQL_SERVER);
```

## 📞 Suporte

Para problemas específicos do Azure SQL Database:
- [Documentação oficial](https://docs.microsoft.com/azure/sql-database/)
- [Suporte Azure](https://azure.microsoft.com/support/)
- [Stack Overflow - azure-sql-database](https://stackoverflow.com/questions/tagged/azure-sql-database)
