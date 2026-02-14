# 🚀 Guia de Deploy Seguro - VPS

## ⚠️ ATENÇÃO: Configurações Críticas para Produção

Este documento garante que as alterações de desenvolvimento não quebrem a aplicação em produção.

---

## 📋 Checklist Antes do Deploy

### ✅ 1. Variáveis de Ambiente - CRÍTICO

#### � **VITE_API_BASE_URL** - Configuração com Nginx Proxy

| Ambiente | Configuração | Motivo |
|----------|--------------|--------|
| **Desenvolvimento Local** | `http://localhost:8080` | Frontend acessa backend diretamente |
| **Produção VPS** | `/api` | Nginx faz proxy reverso |

**✅ SOLUÇÃO SEGURA:** Sua VPS usa Nginx como proxy reverso!

O `nginx-winmarketplace.conf` tem:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
}
```

Isso significa:
- Frontend faz requisição para `/api/v1/produtos`
- Nginx roteia para `http://127.0.0.1:8080/api/v1/produtos`
- ✅ **`VITE_API_BASE_URL=/api` está correto!**

---

### ✅ 2. Novas Integrações Adicionadas

#### 💳 **Pagar.me (Stone)** - Novo Gateway de Pagamento

**Arquivos Criados:**
- `backend/src/main/java/com/win/marketplace/service/PagarMeService.java`
- Métodos em `PagamentoService.java`: `criarPagamentoPixPagarMe`, `processarWebhookPagarMe`
- Endpoints em `PagamentoController.java`: `/api/v1/pagamentos/pagarme/*`

**Configuração Necessária:**

**Desenvolvimento (.env):**
```bash
PAGARME_API_KEY=acc_z3DoakwS0C5ag84p     # Credenciais de TESTE
PAGARME_PUBLIC_KEY=pk_lKy5xpKjtesp4ZLX
PAGARME_ENVIRONMENT=test
PAGARME_ENABLED=true
```

**Produção (.env.vps):**
```bash
PAGARME_API_KEY=SEU_API_KEY_PRODUCAO_AQUI      # Credenciais de PRODUÇÃO
PAGARME_PUBLIC_KEY=SEU_PUBLIC_KEY_PRODUCAO_AQUI
PAGARME_ENVIRONMENT=production
PAGARME_ENABLED=false  # Habilite quando estiver pronto
```

**✅ SEGURO:** Se não configurar, o sistema só loga warning mas continua funcionando.

---

#### 🚗 **Uber Direct API** - Sistema de Entregas

**Status:** Aguardando aprovação da Uber (pendente "Integration Verification Result")

**Configuração Necessária:**

**Produção (.env.vps):**
```bash
UBER_CLIENT_ID=SEU_CLIENT_ID_PRODUCAO_AQUI
UBER_CLIENT_SECRET=SEU_CLIENT_SECRET_PRODUCAO_AQUI
UBER_API_BASE_URL=https://api.uber.com
UBER_API_ENABLED=false  # Habilite quando aprovado
Maps_API_KEY=SUA_GOOGLE_MAPS_API_KEY_AQUI
```

**✅ SEGURO:** Se não configurar, o sistema só loga warning mas continua funcionando.

---

### ✅ 3. Backend - Controller Atualizado

#### 📂 **CategoriaController.java**

**Mudança:** Adicionado endpoint raiz `@GetMapping` para compatibilidade com frontend

```java
@GetMapping  // NOVO - permite GET /api/v1/categoria
public ResponseEntity<List<CategoriaResponseDTO>> listarTodasCategorias() {
    return categoriaService.listarCategorias();
}
```

**✅ SEGURO:** Apenas adiciona endpoint, não quebra funcionalidade existente.

---

## 🔄 Processo de Deploy na VPS

### Passo 1: Backup do Ambiente Atual

```bash
# Conectar na VPS
ssh root@137.184.87.106

# Fazer backup do .env atual
cd /root/win-marketplace
cp .env .env.backup.$(date +%Y%m%d)
```

### Passo 2: Atualizar Código

```bash
# Pull das últimas alterações
git pull origin main

# OU se usar rsync/scp do local:
# scp -r ./* root@137.184.87.106:/root/win-marketplace/
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# CRÍTICO: Usar configuração de produção
cp .env.vps .env

# Editar credenciais sensíveis
nano .env
```

**Edite as seguintes variáveis:**
```bash
# Pagar.me - PRODUÇÃO (obtenha em https://dash.pagar.me/)
PAGARME_API_KEY=sua_chave_real_producao
PAGARME_PUBLIC_KEY=sua_public_key_producao
PAGARME_ENVIRONMENT=production
PAGARME_ENABLED=true  # se quiser ativar

# Uber Direct - PRODUÇÃO (quando aprovado)
UBER_CLIENT_ID=seu_client_id_producao
UBER_CLIENT_SECRET=seu_secret_producao
UBER_API_BASE_URL=https://api.uber.com
UBER_API_ENABLED=false  # manter false até aprovação

# Google Maps API
Maps_API_KEY=sua_chave_google_maps

# Confirme que a URL do frontend está correta
VITE_API_BASE_URL=http://backend:8080  # NÃO MUDE ISSO!
```

### Passo 4: Rebuild dos Containers

```bash
# Parar containers
docker-compose down

# Rebuild com as novas alterações
docker-compose build --no-cache

# Subir containers
docker-compose up -d

# Verificar logs
docker-compose logs -f backend
```

### Passo 5: Verificação Pós-Deploy

```bash
# 1. Verificar saúde dos containers
docker-compose ps

# 2. Testar endpoints públicos
curl http://localhost:8080/api/v1/categoria
curl http://localhost:8080/api/v1/produtos
curl http://localhost:8080/api/v1/lojistas

# 3. Verificar logs de erro
docker-compose logs backend | grep "ERROR"

# 4. Testar frontend
curl http://localhost:3000

# 5. Verificar conexão frontend-backend
# Acessar http://137.184.87.106:3000 no navegador
# Abrir DevTools Console e verificar chamadas de API
```

---

## 🛡️ Problemas Comuns e Soluções

### ❌ Problema 1: Frontend não carrega dados

**Sintoma:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Causas possíveis:**
1. `VITE_API_BASE_URL` incorreto no `.env`
2. Nginx não está rodando
3. Nginx configurado incorretamente

**Solução:**
```bash
# Na VPS, verificar .env
grep VITE_API_BASE_URL .env

# Deve retornar:
VITE_API_BASE_URL=/api

# Verificar se Nginx está rodando
sudo systemctl status nginx

# Se não estiver, iniciar:
sudo systemctl start nginx

# Verificar configuração do Nginx
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Se VITE_API_BASE_URL estiver errado, corrigir:
sed -i 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=/api|' .env

# Rebuild do frontend
docker-compose up -d --build frontend
```

---

### ❌ Problema 2: Erro 401 em pagamentos Pagar.me

**Sintoma:**
```
401 Unauthorized - Invalid API Key
```

**Causa:** Usando credenciais de teste em produção

**Solução:**
```bash
# Verificar ambiente
grep PAGARME_ENVIRONMENT .env

# Deve retornar:
PAGARME_ENVIRONMENT=production

# Verificar se as chaves são de produção (começam com acc_)
grep PAGARME_API_KEY .env
```

---

### ❌ Problema 3: CORS bloqueando requisições

**Sintoma:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causa:** IP da VPS não está em `ALLOWED_ORIGINS`

**Solução:**
```bash
# Adicionar IP e domínio ao .env
nano .env

# Atualizar linha:
ALLOWED_ORIGINS=http://137.184.87.106:3000,http://localhost:3000,http://winmarketplace.com.br

# Reiniciar backend
docker-compose restart backend
```

---

## 📊 Comparação: Dev vs Produção

| Configuração | Desenvolvimento Local | Produção VPS |
|--------------|----------------------|--------------|
| **VITE_API_BASE_URL** | `http://localhost:8080` | `/api` (Nginx proxy) |
| **PAGARME_ENVIRONMENT** | `test` | `production` |
| **PAGARME_ENABLED** | `true` (para testes) | `false` (até configurar) |
| **UBER_API_BASE_URL** | `https://sandbox-api.uber.com` | `https://api.uber.com` |
| **UBER_API_ENABLED** | `true` (quando aprovado) | `false` (até aprovação) |
| **ALLOWED_ORIGINS** | `http://localhost:3000` | `https://winmarketplace.com.br,http://137.184.87.106` |
| **FRONTEND_URL** | `http://localhost:3000` | `https://winmarketplace.com.br` |
| **Nginx** | ❌ Não usado | ✅ Proxy reverso ativo |

---

## 🔐 Segurança em Produção

### 1. **Nunca commitar arquivos .env**

```bash
# Verificar se .env está no .gitignore
cat .gitignore | grep ".env"

# Deve conter:
.env
.env.local
.env.*.local
```

### 2. **Credenciais Sensíveis**

✅ **NUNCA exponha:**
- `PAGARME_API_KEY` (secret)
- `UBER_CLIENT_SECRET`
- `POSTGRES_PASSWORD`
- `SENDGRID_API_KEY`
- `SPACES_SECRET_KEY`

✅ **SIM, pode expor ao frontend:**
- `PAGARME_PUBLIC_KEY`
- `Maps_API_KEY` (com restrições por domínio)

### 3. **Rotate Credentials Periodicamente**

- Trocar senhas a cada 90 dias
- Usar diferentes credenciais para dev/prod
- Monitorar uso suspeito nas dashboards

---

## 📝 Resumo Final

### ✅ Alterações SEGURAS (não quebram produção):

1. ✅ **CategoriaController** - Endpoint adicional
2. ✅ **PagarMeService** - Novo serviço (desabilitado por padrão)
3. ✅ **PagamentoController** - Endpoints adicionais
4. ✅ **PagamentoService** - Métodos adicionais

### ⚠️ Alterações que REQUEREM ATENÇÃO:

1. ⚠️ **VITE_API_BASE_URL** - DEVE ser `http://backend:8080` na VPS
2. ⚠️ **PAGARME_API_KEY** - DEVE ser chave de produção na VPS
3. ⚠️ **UBER_API_BASE_URL** - DEVE ser `https://api.uber.com` na VPS

### 🎯 Comando de Deploy Seguro (na VPS):

```bash
# Backup
cp .env .env.backup

# Usar config de produção
cp .env.vps .env

# Editar credenciais reais
nano .env

# Deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f backend
```

---

## 📞 Suporte

Se algo der errado:

1. **Verificar logs:** `docker-compose logs backend`
2. **Verificar variáveis:** `cat .env | grep VITE_API_BASE_URL`
3. **Reverter:** `cp .env.backup .env && docker-compose up -d`
4. **Testar local primeiro:** Sempre teste em dev antes de produção

---

**🎉 Deploy Seguro Garantido!**

*Última atualização: 14/02/2026*
