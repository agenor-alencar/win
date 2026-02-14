# ⚠️ LEIA ANTES DE FAZER DEPLOY EM PRODUÇÃO

## 🚨 ALERTA CRÍTICO

As alterações recentes incluem **configurações específicas para desenvolvimento local** que diferem da produção.

---

## 🔴 Configuração Importante: VITE_API_BASE_URL

### Desenvolvimento Local vs Produção com Nginx

**✅ DESENVOLVIMENTO LOCAL (.env):**
```bash
VITE_API_BASE_URL=http://localhost:8080
```
- Frontend acessa diretamente o backend na porta 8080

**✅ PRODUÇÃO VPS com Nginx (.env.vps):**
```bash
VITE_API_BASE_URL=/api
```
- Frontend faz requisições para `/api`
- **Nginx proxy** roteia `/api/*` para `http://127.0.0.1:8080/api/*`
- Configurado em `nginx-winmarketplace.conf`

### Por que /api funciona em produção?

O arquivo `nginx-winmarketplace.conf` tem:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    ...
}
```

Isso faz o proxy reverso automaticamente.

---

## ✅ SOLUÇÃO OBRIGATÓRIA

### Na VPS, SEMPRE execute:

```bash
# 1. Copiar configuração de produção
cp .env.vps .env

# 2. Editar credenciais reais (Pagar.me, Uber, SendGrid, Spaces, etc)
nano .env

# 3. Verificar se VITE_API_BASE_URL está correto
grep VITE_API_BASE_URL .env
# Deve retornar: VITE_API_BASE_URL=/api
```

**⚠️ IMPORTANTE:** O valor `/api` funciona porque o Nginx está configurado como proxy reverso.

---

## 📋 Novas Integrações Adicionadas

### 1. 💳 Pagar.me (Stone) - Gateway de Pagamento

**Status:** ✅ Implementado e testado

**Ação necessária:**
- Em produção, configurar credenciais **de produção**
- Alterar `PAGARME_ENVIRONMENT=production`
- Obter chaves em: https://dash.pagar.me/

**Segurança:** Se não configurar, apenas registra warning. Não quebra a aplicação.

### 2. 🚗 Uber Direct API - Sistema de Entregas

**Status:** ⏳ Aguardando aprovação da Uber

**Ação necessária:**
- Aguardar aprovação no portal https://developer.uber.com
- Quando aprovado, configurar produção com `UBER_API_BASE_URL=https://api.uber.com`
- Desabilitar enquanto não aprovado: `UBER_API_ENABLED=false`

**Segurança:** Se não configurar, apenas registra warning. Não quebra a aplicação.

### 3. 📂 CategoriaController - Endpoint adicional

**Status:** ✅ Implementado

**Mudança:** Adicionado `GET /api/v1/categoria` (compatibilidade com frontend)

**Segurança:** ✅ 100% seguro. Apenas adiciona endpoint, não remove nada.

---

## 🎯 Checklist de Deploy

Antes de fazer deploy na VPS, verifique:

- [ ] Copiou `.env.vps` para `.env` na VPS
- [ ] Verificou `VITE_API_BASE_URL=/api` (não mude isso!)
- [ ] Nginx está rodando e configurado (`nginx-winmarketplace.conf`)
- [ ] Configurou credenciais de **produção** do Pagar.me (se for usar)
- [ ] Configurou `PAGARME_ENVIRONMENT=production` (se for usar)
- [ ] Desabilitou Uber Direct (`UBER_API_ENABLED=false`) até aprovação
- [ ] Configurou SendGrid API Key para envio de emails
- [ ] Configurou DigitalOcean Spaces (storage de arquivos)
- [ ] Verificou `ALLOWED_ORIGINS` incluindo domínio e IP da VPS
- [ ] Fez backup do `.env` anterior: `cp .env .env.backup`

---

## 📚 Documentação Completa

Para guia detalhado com todos os comandos e troubleshooting:

👉 **[GUIA_DEPLOY_SEGURO.md](_DOCS/GUIA_DEPLOY_SEGURO.md)**

---

## 🆘 Rollback de Emergência

Se algo der errado após deploy:

```bash
# 1. Restaurar backup
cp .env.backup .env

# 2. Reiniciar containers
docker-compose down
docker-compose up -d

# 3. Verificar logs
docker-compose logs -f backend
```

---

## 📊 Resumo Visual

### ✅ DESENVOLVIMENTO LOCAL:

```bash
# .env (raiz do projeto)
VITE_API_BASE_URL=http://localhost:8080  # ✅ Frontend acessa backend na porta 8080
```

```bash
# win-frontend/.env
VITE_API_BASE_URL=http://localhost:8080  # ✅ Mesmo valor
```

### ✅ PRODUÇÃO VPS (com Nginx):

```bash
# .env na VPS
VITE_API_BASE_URL=/api  # ✅ Nginx faz proxy reverso
```

**Como funciona:**
1. Frontend faz requisição para `/api/v1/produtos`
2. Nginx intercepta e roteia para `http://127.0.0.1:8080/api/v1/produtos`
3. Backend processa e retorna

---

## 🔧 Configuração do Nginx

O arquivo `nginx-winmarketplace.conf` contém:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    ...
}
```

Isso elimina problemas de CORS e centraliza o acesso.

---

## 🔐 Segurança

**Nunca commitar no Git:**
- `.env` (raiz)
- `win-frontend/.env`
- Qualquer arquivo com credenciais reais

**Sempre usar diferentes credenciais:**
- Desenvolvimento = Sandbox/Test
- Produção = Production Keys

---

## ✅ Conclusão

As alterações são **100% seguras** desde que:

1. ✅ Use `.env.vps` como base na VPS
2. ✅ Mantenha `VITE_API_BASE_URL=/api` (Nginx faz o proxy)
3. ✅ Configure credenciais de produção corretas
4. ✅ Nginx esteja rodando e configurado

**NÃO SUBA O `.env` LOCAL PARA A VPS!**

### 📋 Diferenças Chave por Ambiente:

| Configuração | Dev Local | Produção VPS |
|--------------|-----------|--------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | `/api` |
| Nginx | ❌ Não usado | ✅ Proxy reverso |
| Acesso Backend | Direto na porta 8080 | Via Nginx |
| HTTPS | ❌ HTTP apenas | ✅ HTTPS (via Nginx) |

---

*Criado em: 14/02/2026*
*Última atualização: 14/02/2026*
