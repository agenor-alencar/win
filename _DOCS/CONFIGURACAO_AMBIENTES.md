# 🔧 Configuração de Ambientes - Win Marketplace

## 📋 Resumo Rápido

Este projeto está configurado para funcionar **perfeitamente** em dois ambientes diferentes:

---

## 🖥️ DESENVOLVIMENTO LOCAL

### Arquivos de Configuração:

1. **`.env`** (raiz do projeto)
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   PAGARME_ENVIRONMENT=test
   PAGARME_ENABLED=true
   UBER_API_BASE_URL=https://sandbox-api.uber.com
   ```

2. **`win-frontend/.env`**
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   ```

### Como funciona:
- Frontend acessa **diretamente** o backend na porta 8080
- Sem Nginx
- Credenciais de **teste/sandbox**
- Banco PostgreSQL local (Docker)

### Iniciar desenvolvimento:
```bash
docker-compose up -d
```

Acesso:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

---

## 🌐 PRODUÇÃO VPS

### Arquivos de Configuração:

1. **`.env`** (na VPS, copiado de `.env.vps`)
   ```bash
   VITE_API_BASE_URL=/api
   PAGARME_ENVIRONMENT=production
   PAGARME_ENABLED=false
   UBER_API_BASE_URL=https://api.uber.com
   ```

### Como funciona:
- Frontend faz requisições para `/api/*`
- **Nginx proxy reverso** roteia `/api/*` → `http://127.0.0.1:8080/api/*`
- Credenciais de **produção**
- HTTPS via Nginx
- Domínio: winmarketplace.com.br

### Configuração Nginx (`nginx-winmarketplace.conf`):
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    ...
}
```

### Deploy na VPS:
```bash
# 1. Conectar
ssh root@137.184.87.106

# 2. Navegar para o projeto
cd /root/win-marketplace

# 3. Backup do .env atual
cp .env .env.backup

# 4. Copiar configuração de produção
cp .env.vps .env

# 5. Editar credenciais reais
nano .env
# - PAGARME_API_KEY (produção)
# - SENDGRID_API_KEY
# - SPACES_ACCESS_KEY e SPACES_SECRET_KEY
# - Maps_API_KEY

# 6. Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 7. Verificar logs
docker-compose logs -f backend
```

Acesso:
- Frontend: https://winmarketplace.com.br
- Backend (proxy): https://winmarketplace.com.br/api

---

## 🔑 Diferenças Principais

| Aspecto | Dev Local | Produção VPS |
|---------|-----------|--------------|
| **URL Frontend** | http://localhost:3000 | https://winmarketplace.com.br |
| **URL Backend** | http://localhost:8080 | https://winmarketplace.com.br/api |
| **VITE_API_BASE_URL** | `http://localhost:8080` | `/api` |
| **Nginx** | ❌ Não usado | ✅ Proxy reverso |
| **HTTPS** | ❌ HTTP apenas | ✅ HTTPS |
| **Credenciais** | Teste/Sandbox | Produção |
| **Banco de dados** | Docker local | VPS (persistente) |

---

## 🆕 Novas Integrações Adicionadas

### 1. 💳 Pagar.me (Stone) - Gateway PIX

**Desenvolvimento (.env):**
```bash
PAGARME_API_KEY=acc_z3DoakwS0C5ag84p  # Teste
PAGARME_PUBLIC_KEY=pk_lKy5xpKjtesp4ZLX
PAGARME_ENVIRONMENT=test
PAGARME_ENABLED=true
```

**Produção (.env.vps):**
```bash
PAGARME_API_KEY=SUA_CHAVE_PRODUCAO
PAGARME_PUBLIC_KEY=SUA_PUBLIC_KEY_PRODUCAO
PAGARME_ENVIRONMENT=production
PAGARME_ENABLED=false  # Habilite quando configurar
```

Obtenha chaves em: https://dash.pagar.me/

### 2. 🚗 Uber Direct API - Entregas

**Status:** ⏳ Aguardando aprovação (Integration Verification)

**Desenvolvimento (.env):**
```bash
UBER_CLIENT_ID=9zlEgm25UTAIk11QSTlP3BSPjLmAQKgn
UBER_CLIENT_SECRET=0d-FXqgkvJPwTCnBwhsI4IeYRdZbwz3RrgXZbXWg
UBER_API_BASE_URL=https://sandbox-api.uber.com
UBER_API_ENABLED=true
```

**Produção (.env.vps):**
```bash
UBER_CLIENT_ID=SEU_CLIENT_ID_PRODUCAO
UBER_CLIENT_SECRET=SEU_SECRET_PRODUCAO
UBER_API_BASE_URL=https://api.uber.com
UBER_API_ENABLED=false  # Até aprovação
```

### 3. 📂 Novo endpoint CategoriaController

Adicionado `GET /api/v1/categoria` para compatibilidade frontend.

**Segurança:** ✅ Apenas adiciona funcionalidade, não quebra nada.

---

## ✅ Checklist Antes de Deploy VPS

- [ ] Arquivo `.env.vps` atualizado no repositório
- [ ] Backup do `.env` atual na VPS: `cp .env .env.backup`
- [ ] Copiar: `cp .env.vps .env`
- [ ] Editar credenciais de produção no `.env`
- [ ] Confirmar `VITE_API_BASE_URL=/api`
- [ ] Nginx rodando: `sudo systemctl status nginx`
- [ ] Testar configuração Nginx: `sudo nginx -t`
- [ ] Build e restart: `docker-compose down && docker-compose build && docker-compose up -d`
- [ ] Verificar logs: `docker-compose logs -f`
- [ ] Testar no navegador: https://winmarketplace.com.br

---

## 🧪 Testar Após Deploy

### 1. Verificar containers:
```bash
docker-compose ps
```

Todos devem estar `Up` e `healthy`.

### 2. Testar endpoints públicos:
```bash
curl https://winmarketplace.com.br/api/v1/categoria
curl https://winmarketplace.com.br/api/v1/produtos
curl https://winmarketplace.com.br/api/v1/lojistas
```

### 3. Testar frontend:
- Abrir https://winmarketplace.com.br
- Abrir DevTools Console (F12)
- Verificar se não há erros de rede
- Verificar se categorias/produtos carregam

---

## 🚨 Problemas Comuns

### Frontend não carrega dados

**Sintomas:**
- Página branca
- Console: "Failed to fetch"
- Network tab: 404 ou CORS error

**Soluções:**
```bash
# 1. Verificar VITE_API_BASE_URL
grep VITE_API_BASE_URL .env
# Deve ser: /api

# 2. Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# 3. Verificar logs do backend
docker-compose logs backend | tail -50

# 4. Rebuild frontend
docker-compose up -d --build frontend
```

### Erro 401 Unauthorized (Pagar.me)

**Causa:** Usando chaves de teste em produção

**Solução:**
```bash
nano .env
# Atualizar:
PAGARME_API_KEY=chave_producao_aqui
PAGARME_ENVIRONMENT=production

docker-compose restart backend
```

---

## 📚 Documentação Adicional

- [IMPORTANTE_DEPLOY.md](IMPORTANTE_DEPLOY.md) - Alerta antes de deploy
- [_DOCS/GUIA_DEPLOY_SEGURO.md](_DOCS/GUIA_DEPLOY_SEGURO.md) - Guia detalhado
- [_DOCS/GUIA_INTEGRACAO_PAGARME.md](_DOCS/GUIA_INTEGRACAO_PAGARME.md) - Documentação Pagar.me

---

## ✅ Conclusão

**Projeto 100% pronto para:**
- ✅ Desenvolvimento local com `docker-compose up -d`
- ✅ Deploy em produção VPS com Nginx proxy
- ✅ Múltiplos gateways de pagamento (Abacate Pay, Pagar.me)
- ✅ Sistema de entregas Uber Direct (quando aprovado)
- ✅ Storage de arquivos (DigitalOcean Spaces)
- ✅ HTTPS em produção via Nginx

**Siga sempre o fluxo:**
1. Desenvolver localmente
2. Testar com `.env` local
3. Commit e push
4. Na VPS: `cp .env.vps .env`
5. Editar credenciais reais
6. Deploy

🎉 **Sistema pronto para produção!**

*Última atualização: 14/02/2026*
