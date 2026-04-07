# 📋 CHECKLIST DEPLOYMENT - Fluxo OTP via SMS

## ✅ ARQUIVOS MODIFICADOS (para commitar no Git)

### Backend - Java/Spring Boot
```
✅ backend/src/main/java/com/win/marketplace/service/OtpService.java
   - Correção: Linha 119 "!otpToken.isNotExpired()" (negação adicionada)
   - Status: CRÍTICO para funcionar verify-code

✅ backend/src/main/java/com/win/marketplace/integration/TwilioSmsClient.java
   - Correção: Verifica "if (!twilioEnabled)" ANTES de validar config
   - Status: Permite SMS simulation mode

✅ backend/src/main/resources/application.yml
   - Alteração: twelio.enabled: false (para teste/produção declarar true)
   - Status: Controla comportamento SMS
```

### Frontend - React/TypeScript
```
✅ win-frontend/src/contexts/AuthContext.tsx
   - Adição: Métodos requestOtpCode() e verifyOtpCode()
   - Status: Nova interface para login OTP

✅ win-frontend/src/pages/shared/Login.tsx
   - Adição: Novo tab "📱 Telefone" com <PhoneLogin />
   - Status: Integração no fluxo login
```

### Banco de Dados - Migrações
```
✅ database/init.sql
   - Alteração: Tabela "usuarios" recebe colunas latitude/longitude
   - Alteração: Tabela otp_tokens criada (NOVO)
   - Correção: Typo "itens_pedido" → "itens_pedidos"
   - Status: Executado automaticamente no postgres init

✅ database/V2__add_usuario_endereco_coordinates.sql (NOVO)
   - Executa DEPOIS de init.sql (ordem numérica: 01_)
   - Adiciona lat/lon se não existirem
   - Status: Migration de segurança

✅ database/V11__create_otp_tokens_table.sql (removido do docker-compose)
   - Conteúdo duplicado em init.sql agora
   - Status: PODE SER DELETADO
```

### Infraestrutura - Docker
```
✅ docker-compose.yml
   - Adição: Volume mapping para migrações SQL com prefixo numérico
   - Ordem: 00_init → 01_coordinates → 02_otimizacao → 03_V11
   - Status: Garante ordem correta de execução
```

---

## 🚀 PARA DEPLOY EM VPS

### PASSO 1: Commitar alterações no Git
```bash
git add backend/src/main/java/com/win/marketplace/service/OtpService.java
git add backend/src/main/java/com/win/marketplace/integration/TwilioSmsClient.java
git add backend/src/main/resources/application.yml
git add database/init.sql
git add database/V2__add_usuario_endereco_coordinates.sql
git add docker-compose.yml
git add win-frontend/src/contexts/AuthContext.tsx
git add win-frontend/src/pages/shared/Login.tsx
git add win-frontend/src/pages/shared/PhoneLogin.tsx

git commit -m "feat(auth): Implementar fluxo OTP via SMS com telefone

- Add OtpService com geração, validação e TTL de 5 min
- Add TwilioSmsClient com retry logic e SMS simulation
- Add PhoneLogin component (React)
- Extend AuthContext com requestOtpCode/verifyOtpCode
- Add otp_tokens table no banco com indices
- Add colunas latitude/longitude em usuarios/enderecos
- Fix typo itens_pedido → itens_pedidos em devolucoes
- Update docker-compose com ordem correta de migrações"
```

### PASSO 2: Configurar .env para produção
```env
# Verificar valores em VPS:
TWILIO_ENABLED=false          # MUDE PARA true quando tiver credenciais reais
TWILIO_ACCOUNT_SID=xxxxx      # Adicionar credenciais reais
TWILIO_AUTH_TOKEN=xxxxx       # Adicionar credenciais reais
TWILIO_PHONE_NUMBER=+551199999999

# Banco de dados
POSTGRES_DB=win_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<GERAR SENHA FORTE>

# Spring Boot
SPRING_PROFILE_ACTIVE=prod
```

### PASSO 3: Deploy Docker em VPS
```bash
#!/bin/bash

# 1. Pull código atualizado
git pull origin main

# 2. Build nova imagem backend
docker-compose build backend

# 3. Down (sem -v para MANTER dados do banco)
docker-compose down

# 4. Up com novo código
docker-compose up -d

# 5. Verificar saúde
docker ps

# 6. Testar endpoints
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone":"+5511999999999"}'
```

### PASSO 4: Verificar migrações no banco (em VPS)
```bash
# Conectar ao postgres
docker exec win-marketplace-db psql -U postgres -d win_marketplace

# Verificar tabelas criadas
\dt

# Verificar kolumnas otp_tokens
\d otp_tokens

# Verificar colunas usuarios (lat/lon)
\d usuarios
```

---

## ⚠️ ARQUIVOS CRÍTICOS A NÃO ESQUECER

### ✅ DEVE SER COMMITADO
- `backstend/src/main/java/com/win/marketplace/service/OtpService.java`
- `backend/src/main/java/com/win/marketplace/integration/TwilioSmsClient.java`
- `database/init.sql` (contém tabela otp_tokens agora)
- `database/V2__add_usuario_endereco_coordinates.sql`
- `docker-compose.yml` (com volumes corretos)
- `win-frontend/src/pages/shared/PhoneLogin.tsx`
- `win-frontend/src/contexts/AuthContext.tsx`
- `win-frontend/src/pages/shared/Login.tsx`

### ⚠️ PODE SER IGNORADO
- `ANALISE_FLUXO_LOGIN_OTP.md` (documentação local)
- `CHECKLIST_IMPLEMENTACAO_FRONTEND_OTP.md` (documentação local)
- `database/V11__create_otp_tokens_table.sql` (conteúdo duplicado em init.sql)
- Arquivos .md de configuração (opcional)

---

## 🔍 VERIFICAÇÃO DE INTEGRIDADE

### Tabelas de banco que SERÃO CRIADAS automaticamente:
✅ `otp_tokens` - Armazena códigos OTP
✅ `usuarios` - COM colunas latitude, longitude
✅ `enderecos` - COM colunas latitude, longitude
✅ Demais tabelas (inalteradas)

### Endpoints que FUNCIONARÃO após deploy:
✅ `POST /api/v1/auth/request-code` - Gera OTP
✅ `POST /api/v1/auth/verify-code` - Valida OTP e faz login
✅ `GET /api/v1/auth/me` - Retorna usuário logado

### Frontend que FUNCIONARÁ após deploy:
✅ Aba "📱 Telefone" no Login
✅ Componente PhoneLogin com 2 stages (phone → OTP)
✅ InputOTP com 6 dígitos
✅ Timer de 5 minutos
✅ Tentativas limitadas a 3

---

## 📞 TWILIO EM PRODUÇÃO

### Para ativar SMS real:
1. Criar conta Twilio: https://www.twilio.com/
2. Obter: Account SID, Auth Token, Phone Number verificado
3. No .env da VPS:
   ```
   TWILIO_ENABLED=true
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+551199999999
   ```
4. Restart backend: `docker-compose restart backend`

### Fallback (Twilio disabled):
- SMS é simulado
- Código é logado no console backend
- Teste funciona normalmente

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] Todos os arquivos Java/Kotlin commitados
- [ ] Migrações de banco em `database/` commitadas
- [ ] Frontend components commitados
- [ ] `docker-compose.yml` atualizado com volumes corretos
- [ ] `.gitignore` não está bloqueando arquivos críticos
- [ ] `git status` limpo (exceto .env que é secret)
- [ ] Testado localmente (todos endpoints retornam 200)
- [ ] `.env` com credenciais SENSÍVEIS em .gitignore
- [ ] Script de deploy (`start-servers.sh` ou similar) atualizado
- [ ] VPS tem Docker e Docker Compose instalados
- [ ] Porta 5432 (postgres) acessível apenas internamente
- [ ] Porta 8080 (backend) acessível pelo nginx
- [ ] Certificado SSL/TLS configurado

---

## 📝 NOTA IMPORTANTE

**A ordem de execução das migrações é CRÍTICA:**
1. `00_init.sql` - Cria todas as tabelas base (usuarios, pedidos, etc) + **otp_tokens**
2. `01_V2__add_usuario_endereco_coordinates.sql` - Adiciona lat/lon se não existir
3. `02_otimizacao_indices.sql` - Cria índices
4. `03_V11__create_otp_tokens_table.sql` - Só roda se V2 falhar (backup)

Docker irá executar em ordem alfabética dos nomes de arquivo no volume mapeado!

---

Última atualização: 06/04/2026
Status: ✅ PRONTO PARA DEPLOY
