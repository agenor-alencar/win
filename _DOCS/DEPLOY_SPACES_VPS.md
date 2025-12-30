# 🚀 Deploy DigitalOcean Spaces na VPS

Guia passo a passo para fazer deploy das alterações de upload de imagens na VPS.

---

## 📋 Pré-requisitos

- [x] Código commitado no Git
- [x] Acesso SSH à VPS
- [ ] Chaves do DigitalOcean Spaces criadas
- [ ] Bucket `win-marketplace-storage` criado

---

## 🔧 Passo 1: Criar Space e Chaves no DigitalOcean

### 1.1. Criar o Space
```bash
# Acesse: https://cloud.digitalocean.com/spaces
# Clique em "Create Space"
# - Region: sfo3 (San Francisco)
# - Name: win-marketplace-storage
# - File Listing: Private
# - CDN: Ative (opcional)
```

### 1.2. Gerar Chaves de Acesso
```bash
# Acesse: https://cloud.digitalocean.com/account/api/tokens
# Vá em "Spaces Keys"
# Clique em "Generate New Key"
# Nome: win-marketplace-production
# Copie: Access Key e Secret Key (só aparecem uma vez!)
```

**Exemplo:**
```
Access Key: DO00ABCDEFGHIJK1234567
Secret Key: abcdefghijklmnopqrstuvwxyz1234567890ABCD
```

---

## 🌐 Passo 2: Conectar na VPS e Atualizar Código

```bash
# Conectar via SSH
ssh root@seuservidor.com.br

# Navegar para o projeto
cd /root/win-marketplace

# Fazer backup do .env (importante!)
cp .env .env.backup

# Atualizar código
git pull origin main
```

---

## 🗄️ Passo 3: Aplicar Migration no Banco de Dados

```bash
# Aplicar migration 004 (adiciona colunas para Spaces)
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/004_add_spaces_support.sql

# Verificar se foi aplicada
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d imagem_produto"
```

**Você deve ver as novas colunas:**
- url_thumbnail
- url_medium
- tamanho_bytes
- tamanho_thumbnail_bytes
- tamanho_medium_bytes
- tipo_conteudo
- texto_alternativo

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

```bash
# Editar .env
nano .env
```

**Adicione no final do arquivo:**

```env
# ========================================
# DIGITALOCEAN SPACES
# ========================================
SPACES_ACCESS_KEY=DO00ABCDEFGHIJK1234567
SPACES_SECRET_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCD
SPACES_BUCKET_NAME=win-marketplace-storage
SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
SPACES_REGION=sfo3
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🐳 Passo 5: Atualizar docker-compose.yml

```bash
# Editar docker-compose.yml
nano docker-compose.yml
```

**Adicione as variáveis no serviço backend:**

```yaml
services:
  backend:
    environment:
      # ... variáveis existentes ...
      
      # DigitalOcean Spaces
      - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
      - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
      - SPACES_BUCKET_NAME=${SPACES_BUCKET_NAME}
      - SPACES_ENDPOINT=${SPACES_ENDPOINT}
      - SPACES_REGION=${SPACES_REGION}
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🔨 Passo 6: Rebuild e Restart dos Containers

```bash
# Parar containers
docker compose down

# Rebuild do backend (importante para incluir novas classes Java)
docker compose build backend --no-cache

# Subir containers
docker compose up -d

# Verificar logs do backend
docker compose logs -f backend
```

**Aguarde até ver:**
```
Started WinMarketApplication in X.XXX seconds
```

---

## ✅ Passo 7: Testar Upload

### 7.1. Verificar se o backend está funcionando
```bash
curl http://localhost:8080/actuator/health
```

**Resposta esperada:** `{"status":"UP"}`

### 7.2. Testar upload de imagem

```bash
# Substitua {produtoId} por um UUID de produto válido
# Substitua {token} pelo token JWT de um lojista

curl -X POST "http://localhost:8080/api/v1/produtos/{produtoId}/imagens" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/caminho/para/teste.jpg" \
  -F "textoAlternativo=Produto teste" \
  -F "ordemExibicao=0"
```

**Resposta esperada:**
```json
{
  "id": "...",
  "url": "https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/...",
  "urlThumbnail": "https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/.../thumb-...",
  "urlMedium": "https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/.../medium-...",
  "tamanhoBytes": 123456,
  ...
}
```

### 7.3. Verificar no DigitalOcean Spaces

Acesse: https://cloud.digitalocean.com/spaces/win-marketplace-storage

Você deve ver a estrutura:
```
produtos/
  └── lojista-{uuid}/
      └── produto-{uuid}/
          ├── {timestamp}-{uuid}-original.jpg
          ├── thumb-{timestamp}-{uuid}.jpg
          └── medium-{timestamp}-{uuid}.jpg
```

### 7.4. Testar URL pública

Copie a URL retornada e abra no navegador:
```
https://win-marketplace-storage.sfo3.digitaloceanspaces.com/produtos/lojista-.../produto-.../imagem.jpg
```

A imagem deve carregar! 🎉

---

## 🔍 Passo 8: Verificar Logs (Se houver erro)

```bash
# Logs do backend
docker compose logs backend --tail=100 --follow

# Logs do PostgreSQL
docker compose logs db --tail=50

# Entrar no container do backend
docker exec -it win-marketplace-backend bash
```

**Erros comuns:**

### ❌ "AccessDenied"
- **Causa:** Chaves incorretas ou sem permissão
- **Solução:** Verifique SPACES_ACCESS_KEY e SPACES_SECRET_KEY no .env

### ❌ "NoSuchBucket"
- **Causa:** Nome do bucket incorreto
- **Solução:** Verifique SPACES_BUCKET_NAME (deve ser `win-marketplace-storage`)

### ❌ "Connection refused"
- **Causa:** Endpoint incorreto
- **Solução:** Verifique SPACES_ENDPOINT (deve ser `https://sfo3.digitaloceanspaces.com`)

### ❌ Imagem retorna 403 Forbidden
- **Causa:** Permissão `public-read` não configurada
- **Solução:** No Space Settings, configure File Listing como Public

---

## 🔄 Passo 9: Migrar Imagens Antigas (Opcional)

Se você já tem imagens armazenadas localmente em `uploads/`, pode migrá-las:

```bash
# Instalar AWS CLI na VPS
apt update && apt install awscli -y

# Configurar credenciais
aws configure set aws_access_key_id $SPACES_ACCESS_KEY
aws configure set aws_secret_access_key $SPACES_SECRET_KEY
aws configure set region sfo3

# Sincronizar uploads locais com Spaces
aws s3 sync ./uploads/produtos s3://win-marketplace-storage/produtos/ \
  --endpoint-url https://sfo3.digitaloceanspaces.com \
  --acl public-read

# Atualizar URLs no banco (executar SQL)
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace <<EOF
UPDATE imagem_produto
SET url = REPLACE(url, 'http://localhost:8080/uploads/', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/')
WHERE url LIKE 'http://localhost:8080/uploads/%';

UPDATE imagem_produto
SET url = REPLACE(url, 'https://winmarketplace.com.br/uploads/', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/')
WHERE url LIKE 'https://winmarketplace.com.br/uploads/%';
EOF
```

---

## 📊 Monitoramento de Custos

### Verificar uso do Space
```bash
# Acesse: https://cloud.digitalocean.com/spaces/win-marketplace-storage
# Vá em: Settings → Usage
```

**Custos estimados (Janeiro 2025):**
- Armazenamento: $0.02/GB/mês
- Transferência: $0.01/GB (primeiros 1TB grátis)
- Para 10GB + 100GB tráfego: **~$0.20/mês**

---

## ✅ Checklist Final

- [ ] Space criado no DigitalOcean
- [ ] Chaves geradas e copiadas
- [ ] `git pull` executado na VPS
- [ ] Migration 004 aplicada no banco
- [ ] Variáveis adicionadas ao .env
- [ ] docker-compose.yml atualizado
- [ ] Containers reconstruídos e reiniciados
- [ ] Upload testado com sucesso
- [ ] Imagem acessível via URL pública
- [ ] Logs verificados (sem erros)

---

## 🎯 Resumo dos Comandos (VPS)

```bash
# 1. Conectar e atualizar
ssh root@seuservidor.com.br
cd /root/win-marketplace
cp .env .env.backup
git pull origin main

# 2. Aplicar migration
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/004_add_spaces_support.sql

# 3. Adicionar variáveis (editar .env)
nano .env
# Adicionar: SPACES_ACCESS_KEY, SPACES_SECRET_KEY, etc.

# 4. Atualizar docker-compose.yml (se necessário)
nano docker-compose.yml

# 5. Rebuild e restart
docker compose down
docker compose build backend --no-cache
docker compose up -d

# 6. Verificar logs
docker compose logs -f backend

# 7. Testar
curl http://localhost:8080/actuator/health
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs: `docker compose logs backend`
2. Verifique variáveis: `docker exec win-marketplace-backend env | grep SPACES`
3. Teste conexão com o Space
4. Consulte: [DIGITALOCEAN_SPACES_SETUP.md](../docs/DIGITALOCEAN_SPACES_SETUP.md)

---

**Última atualização:** 29/12/2025
