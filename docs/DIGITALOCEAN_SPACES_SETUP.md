# 📦 Configuração do DigitalOcean Spaces

Guia completo para configurar o armazenamento de imagens no DigitalOcean Spaces.

## 📋 Índice

- [1. Criar Conta e Space](#1-criar-conta-e-space)
- [2. Gerar Chaves de Acesso](#2-gerar-chaves-de-acesso)
- [3. Configurar Aplicação](#3-configurar-aplicação)
- [4. Testar Upload](#4-testar-upload)
- [5. Configurar CDN (Opcional)](#5-configurar-cdn-opcional)
- [6. Migrar Imagens Existentes](#6-migrar-imagens-existentes)

---

## 1. Criar Conta e Space

### 1.1. Criar Conta no DigitalOcean

1. Acesse: https://cloud.digitalocean.com/
2. Crie uma conta (pode usar GitHub para login rápido)
3. Ative a conta (pode pedir cartão de crédito)

### 1.2. Criar Space (Bucket)

1. No painel, vá em **Manage → Spaces**
2. Clique em **Create Space**
3. Configure:
   - **Region**: Escolha o mais próximo dos usuários (ex: `sfo3` = San Francisco)
   - **Space name**: `win-marketplace-storage`
   - **File Listing**: Escolha `Private` (mais seguro)
   - **CDN**: Ative se quiser CDN gratuito
4. Clique em **Create Space**

---

## 2. Gerar Chaves de Acesso

### 2.1. Criar Spaces Access Key

1. No painel, vá em **API → Spaces Keys**
2. Clique em **Generate New Key**
3. Dê um nome: `win-marketplace-production`
4. **Copie imediatamente** o **Access Key** e **Secret Key**
   - ⚠️ O Secret Key só aparece uma vez!

### 2.2. Exemplo de Chaves

```
Access Key: DO00ABCDEFGHIJK1234567
Secret Key: abcdefghijklmnopqrstuvwxyz1234567890ABCD
```

---

## 3. Configurar Aplicação

### 3.1. Desenvolvimento Local

1. Copie o arquivo de exemplo:
   ```powershell
   Copy-Item .env.spaces.example .env
   ```

2. Edite o `.env` com suas chaves:
   ```env
   SPACES_ACCESS_KEY=DO00ABCDEFGHIJK1234567
   SPACES_SECRET_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCD
   SPACES_BUCKET_NAME=win-marketplace-storage
   SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
   SPACES_REGION=sfo3
   ```

3. Execute a aplicação:
   ```powershell
   cd backend
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=digitalocean
   ```

### 3.2. Produção (Docker)

Adicione ao `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - SPRING_PROFILES_ACTIVE=docker,digitalocean
      - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
      - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
      - SPACES_BUCKET_NAME=win-marketplace-storage
      - SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
      - SPACES_REGION=sfo3
```

Crie `.env` na raiz do projeto:

```env
SPACES_ACCESS_KEY=sua_access_key
SPACES_SECRET_KEY=sua_secret_key
```

Restart dos containers:

```powershell
docker compose down
docker compose up -d --build
```

---

## 4. Testar Upload

### 4.1. Testar via cURL

```powershell
# Substitua {produtoId} por um UUID de produto válido
$produtoId = "00000000-0000-0000-0000-000000000001"

curl -X POST "http://localhost:8080/api/v1/produtos/$produtoId/imagens" `
  -H "Authorization: Bearer seu_token_jwt" `
  -F "file=@caminho/para/imagem.jpg" `
  -F "textoAlternativo=Produto principal" `
  -F "ordemExibicao=0"
```

### 4.2. Verificar no DigitalOcean

1. Acesse seu Space: https://cloud.digitalocean.com/spaces
2. Navegue até `produtos/lojista-{id}/produto-{id}/`
3. Verifique se a imagem foi enviada

### 4.3. Testar URL Pública

A URL retornada deve ser acessível:

```
https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/lojista-123/produto-456/imagem.jpg
```

Abra no navegador para confirmar.

---

## 5. Configurar CDN (Opcional)

### 5.1. Ativar CDN do DigitalOcean

1. No Space, vá em **Settings → CDN**
2. Clique em **Enable CDN**
3. Escolha um subdomínio: `win-marketplace.sfo3.cdn.digitaloceanspaces.com`

### 5.2. Configurar Custom Domain (Opcional)

1. Registre um domínio: `cdn.winmarketplace.com.br`
2. Adicione CNAME:
   ```
   cdn.winmarketplace.com.br → win-marketplace.sfo3.cdn.digitaloceanspaces.com
   ```
3. No Space, vá em **Settings → Custom Domain**
4. Adicione: `cdn.winmarketplace.com.br`
5. Ative SSL gratuito

### 5.3. Atualizar URL no Código

Se usar CDN customizado, altere em `application-digitalocean.yml`:

```yaml
spaces:
  cdn:
    url: https://cdn.winmarketplace.com.br
```

E no serviço, retorne a URL do CDN:

```java
String cdnUrl = String.format("https://cdn.winmarketplace.com.br/%s", fullKey);
```

---

## 6. Migrar Imagens Existentes

### 6.1. Script de Migração (PowerShell)

Crie `scripts/migrate-images-to-spaces.ps1`:

```powershell
# Configurações
$SPACES_ACCESS_KEY = "sua_access_key"
$SPACES_SECRET_KEY = "sua_secret_key"
$BUCKET_NAME = "win-marketplace-storage"
$ENDPOINT = "https://sfo3.digitaloceanspaces.com"
$LOCAL_UPLOADS_PATH = ".\uploads\produtos"

# Instalar AWS CLI
winget install Amazon.AWSCLI

# Configurar credenciais
aws configure set aws_access_key_id $SPACES_ACCESS_KEY
aws configure set aws_secret_access_key $SPACES_SECRET_KEY
aws configure set region sfo3

# Sincronizar arquivos locais com Spaces
aws s3 sync $LOCAL_UPLOADS_PATH s3://$BUCKET_NAME/produtos/ `
  --endpoint-url $ENDPOINT `
  --acl public-read

Write-Host "Migração concluída!"
```

### 6.2. Executar Migração

```powershell
cd scripts
.\migrate-images-to-spaces.ps1
```

### 6.3. Atualizar URLs no Banco

Execute SQL para atualizar URLs antigas:

```sql
-- Backup da tabela
CREATE TABLE imagens_produto_backup AS SELECT * FROM imagens_produto;

-- Atualizar URLs
UPDATE imagens_produto
SET url = REPLACE(url, 'http://localhost:8080/uploads/', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/')
WHERE url LIKE 'http://localhost:8080/uploads/%';

-- Verificar
SELECT id, url FROM imagens_produto LIMIT 10;
```

---

## 💰 Custos Estimados (Janeiro 2025)

| Recurso | Preço | Cálculo |
|---------|-------|---------|
| **Armazenamento** | $0.02/GB/mês | 10GB = $0.20/mês |
| **Transferência** | $0.01/GB | Primeiros 1TB grátis |
| **Requisições** | Grátis | Ilimitado |
| **CDN** | Grátis | Incluído |

**Exemplo para 1.000 produtos:**
- 1.000 produtos × 5 imagens × 2MB = 10GB
- Custo mensal: **~$0.20/mês**

**Comparação com S3:**
- S3: ~$0.25/mês (mesmo cenário)
- DigitalOcean Spaces: Mais barato e simples

---

## 🔒 Segurança

### Recomendações

1. **Nunca comite chaves no Git**
   - Adicione `.env` ao `.gitignore`
   - Use variáveis de ambiente

2. **Use IAM Tokens limitados**
   - Não use chaves root
   - Crie tokens com permissões específicas

3. **Ative CORS apenas se necessário**
   - Configure domínios permitidos
   - Evite `*` (wildcard)

4. **Use HTTPS sempre**
   - URLs com `https://`
   - Ative SSL no CDN

---

## 🐛 Troubleshooting

### Erro: "AccessDenied"

**Causa**: Chaves incorretas ou sem permissão

**Solução**:
1. Verifique se as chaves estão corretas
2. Gere novas chaves se necessário
3. Confirme que o token tem permissão de escrita

### Erro: "NoSuchBucket"

**Causa**: Nome do bucket incorreto ou bucket não existe

**Solução**:
1. Verifique o nome em `SPACES_BUCKET_NAME`
2. Confirme que o Space foi criado
3. Verifique a região (endpoint)

### Imagens não aparecem (403 Forbidden)

**Causa**: Permissão `public-read` não configurada

**Solução**:
1. No código, confirme `acl(ObjectCannedACL.PUBLIC_READ)`
2. No Space Settings, configure File Listing como Public
3. Re-faça o upload das imagens

### URL retorna 404

**Causa**: URL construída incorretamente

**Solução**:
1. Verifique o formato: `https://{bucket}.{endpoint}/{key}`
2. Exemplo correto: `https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/teste.jpg`
3. Use CDN se configurado

---

## 📚 Referências

- [DigitalOcean Spaces Docs](https://docs.digitalocean.com/products/spaces/)
- [AWS S3 SDK Java](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html)
- [Spaces API Reference](https://docs.digitalocean.com/reference/api/spaces-api/)

---

## 🎯 Próximos Passos

1. ✅ Criar conta no DigitalOcean
2. ✅ Criar Space e gerar chaves
3. ✅ Configurar aplicação
4. ✅ Testar upload
5. ⏳ Configurar CDN (opcional)
6. ⏳ Migrar imagens antigas
7. ⏳ Atualizar frontend para usar novas URLs

---

**Criado em**: 29/12/2025  
**Autor**: Win Marketplace Team
