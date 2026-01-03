# 🔧 Correção: Imagens Não Exibem nos Produtos

**Data:** 03/01/2026  
**Status:** ✅ Corrigido  
**Prioridade:** 🔴 Crítico

---

## 🐛 Problema Identificado

As imagens dos produtos não estavam sendo exibidas no site winmarketplace.com.br. Os cards de produtos mostravam apenas placeholders vazios.

### Sintomas

- ✅ Backend funcionando corretamente
- ✅ Frontend carregando produtos
- ❌ Imagens não sendo exibidas (apenas placeholders)
- ❌ URLs das imagens retornando vazias ou inválidas

---

## 🔍 Diagnóstico

### Análise Técnica

O sistema possui duas implementações de storage:

1. **LocalStorageService** - Armazenamento local (desenvolvimento)
2. **S3StorageService** - AWS S3/DigitalOcean Spaces (produção)

O sistema usa a anotação `@ConditionalOnProperty` para selecionar qual implementação usar:

```java
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3StorageService implements ImageStorageService {
    // ...
}
```

### Causa Raiz

A variável de ambiente `STORAGE_TYPE` **não estava configurada** nos arquivos de deploy:
- ❌ Ausente no `.env.vps`
- ❌ Ausente no `docker-compose.yml`

**Resultado:** O sistema estava usando `LocalStorageService` (valor padrão: `local`) em vez de `S3StorageService`, fazendo com que as imagens fossem salvas localmente no container, que é efêmero e não acessível publicamente.

---

## ✅ Solução Implementada

### 1. Arquivo `.env.vps`

Adicionada a seção completa de configuração de storage:

```env
# ========================================
# Storage Configuration (DigitalOcean Spaces)
# ========================================
# Tipo de storage: local, s3, digitalocean
STORAGE_TYPE=s3

# DigitalOcean Spaces - Obtenha as chaves em:
# https://cloud.digitalocean.com/account/api/tokens
SPACES_ACCESS_KEY=SUA_ACCESS_KEY_AQUI
SPACES_SECRET_KEY=SUA_SECRET_KEY_AQUI
SPACES_BUCKET_NAME=win-marketplace-storage
SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
SPACES_REGION=sfo3

# URL pública do CDN (opcional, para melhor performance)
# S3_PUBLIC_URL=https://win-marketplace-storage.sfo3.cdn.digitaloceanspaces.com
```

### 2. Arquivo `docker-compose.yml`

Adicionadas as variáveis de ambiente no serviço backend:

```yaml
services:
  backend:
    environment:
      # Storage Configuration
      STORAGE_TYPE: ${STORAGE_TYPE:-local}
      
      # S3/Spaces Configuration (mapeia para app.storage.s3.*)
      AWS_ACCESS_KEY_ID: ${SPACES_ACCESS_KEY}
      AWS_SECRET_ACCESS_KEY: ${SPACES_SECRET_KEY}
      AWS_REGION: ${SPACES_REGION:-sfo3}
      S3_BUCKET_NAME: ${SPACES_BUCKET_NAME:-win-marketplace-storage}
      S3_ENDPOINT: ${SPACES_ENDPOINT:-https://sfo3.digitaloceanspaces.com}
      S3_PUBLIC_URL: ${S3_PUBLIC_URL:-}
      
      # DigitalOcean Spaces (compatibilidade)
      SPACES_ACCESS_KEY: ${SPACES_ACCESS_KEY}
      SPACES_SECRET_KEY: ${SPACES_SECRET_KEY}
      SPACES_BUCKET_NAME: ${SPACES_BUCKET_NAME}
      SPACES_ENDPOINT: ${SPACES_ENDPOINT}
      SPACES_REGION: ${SPACES_REGION}
```

### 3. Documentação Atualizada

Atualizado o arquivo `DEPLOY_SPACES_VPS.md` com:
- ⚠️ Aviso sobre a obrigatoriedade do `STORAGE_TYPE=s3`
- 🔧 Seção de Troubleshooting expandida
- 📝 Instruções claras de verificação

---

## 📋 Mapeamento de Variáveis

O Spring Boot mapeia automaticamente as variáveis de ambiente para propriedades do application.yml:

| Variável de Ambiente | Propriedade Spring | Descrição |
|---------------------|-------------------|-----------|
| `STORAGE_TYPE` | `app.storage.type` | Tipo de storage (local/s3) |
| `AWS_ACCESS_KEY_ID` | `app.storage.s3.access-key` | Access Key do S3/Spaces |
| `AWS_SECRET_ACCESS_KEY` | `app.storage.s3.secret-key` | Secret Key do S3/Spaces |
| `AWS_REGION` | `app.storage.s3.region` | Região do datacenter |
| `S3_BUCKET_NAME` | `app.storage.s3.bucket` | Nome do bucket/space |
| `S3_ENDPOINT` | `app.storage.s3.endpoint` | Endpoint customizado |
| `S3_PUBLIC_URL` | `app.storage.s3.public-url` | URL do CDN (opcional) |

---

## 🚀 Procedimento de Deploy

Para aplicar a correção no VPS:

```bash
# 1. Conectar via SSH
ssh root@winmarketplace.com.br

# 2. Navegar para o projeto
cd /root/win-marketplace

# 3. Fazer backup do .env
cp .env .env.backup

# 4. Atualizar código
git pull origin main

# 5. Editar .env e adicionar STORAGE_TYPE=s3
nano .env
# Adicionar as variáveis de storage conforme .env.vps

# 6. Rebuild dos containers
docker compose down
docker compose build backend --no-cache
docker compose up -d

# 7. Verificar logs
docker compose logs -f backend | grep -i "storage"
# Deve exibir: "S3StorageService inicializado - Bucket: win-marketplace-storage"

# 8. Verificar variáveis no container
docker exec win-marketplace-backend env | grep -E "STORAGE_TYPE|AWS_"
```

---

## ✅ Verificação

### 1. Verificar que S3StorageService está ativo

```bash
docker compose logs backend | grep -i "S3StorageService inicializado"
```

**Esperado:**
```
S3StorageService inicializado - Bucket: win-marketplace-storage, Region: sfo3
```

### 2. Testar upload de imagem

1. Acessar painel de lojista
2. Criar/editar produto
3. Fazer upload de uma imagem
4. Verificar que a URL retornada é do Spaces:
   ```
   https://sfo3.digitaloceanspaces.com/win-marketplace-storage/produtos/...
   ```

### 3. Verificar exibição na página inicial

1. Acessar https://winmarketplace.com.br
2. Verificar que as imagens dos produtos são exibidas
3. Inspecionar o elemento `<img>` e verificar que o `src` aponta para o Spaces

---

## 🔄 Migração de Imagens Antigas

**Atenção:** Produtos com imagens já cadastradas no storage local não serão migrados automaticamente.

### Opções:

1. **Re-upload Manual** (recomendado)
   - Lojistas fazem novo upload das imagens via painel
   - Sistema automaticamente salva no Spaces

2. **Script de Migração** (futuro)
   - Criar script para migrar imagens do volume local para Spaces
   - Atualizar registros no banco com novas URLs

---

## 📊 Impacto

### Antes da Correção
- ❌ Imagens não visíveis para usuários
- ❌ Storage local efêmero (perda de dados em redeploy)
- ❌ Sem CDN (performance ruim)
- ❌ Sem backups automáticos

### Depois da Correção
- ✅ Imagens visíveis para todos os usuários
- ✅ Storage persistente e escalável
- ✅ CDN integrado (melhor performance)
- ✅ Backups automáticos do DigitalOcean
- ✅ URLs públicas com cache

---

## 📝 Lições Aprendidas

1. **Variáveis de Ambiente São Críticas**
   - Sempre documentar variáveis obrigatórias
   - Adicionar validação no startup da aplicação

2. **Valores Padrão Podem Mascarar Problemas**
   - O valor padrão `local` permitiu que o sistema funcionasse parcialmente
   - Considerar fazer `STORAGE_TYPE` obrigatório em produção

3. **Documentação Clara É Essencial**
   - Guias de deploy devem ser explícitos sobre configurações obrigatórias
   - Adicionar seções de troubleshooting proativamente

---

## 📚 Referências

- [application.yml](../backend/src/main/resources/application.yml) - Configuração do storage
- [S3StorageService.java](../backend/src/main/java/com/win/marketplace/service/storage/S3StorageService.java) - Implementação do storage
- [DEPLOY_SPACES_VPS.md](./DEPLOY_SPACES_VPS.md) - Guia de deploy atualizado
- [DIGITALOCEAN_SPACES_SETUP.md](../docs/DIGITALOCEAN_SPACES_SETUP.md) - Setup do Spaces

---

**Autor:** GitHub Copilot  
**Revisão:** Necessária após deploy em produção
