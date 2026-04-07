# ✅ CHECKLIST FINAL - Pronto Para Fazer Deploy?

**Preenchimento:** Use este checklist enquanto você prepara o deployment.

---

## FASE 1️⃣: VERIFICAÇÃO LOCAL (no seu PC)

**Data Inicial:** ____________  
**Responsável:** ____________

### Git & Código
- [ ] Repositório local atualizado? `git pull origin main`
- [ ] Todos os arquivos modificados foram identificados? `git status`
- [ ] Verifique presença de:
  - [ ] `backend/src/main/java/com/win/marketplace/service/OtpService.java`
  - [ ] `backend/src/main/java/com/win/marketplace/integration/TwilioSmsClient.java`
  - [ ] `backend/src/main/resources/application.yml`
  - [ ] `database/init.sql`
  - [ ] `database/V2__add_usuario_endereco_coordinates.sql`
  - [ ] `docker-compose.yml`
  - [ ] `win-frontend/src/contexts/AuthContext.tsx`
  - [ ] `win-frontend/src/pages/shared/Login.tsx`
  - [ ] `win-frontend/src/pages/shared/PhoneLogin.tsx`

### Verificação de Segurança
- [ ] OtpService.java contém `!otpToken.isNotExpired()` (corrigido)?
  ```bash
  grep -n "!otpToken.isNotExpired()" backend/src/main/java/com/win/marketplace/service/OtpService.java
  ```
- [ ] database/init.sql contém tabela `otp_tokens`?
  ```bash
  grep -A 5 "CREATE TABLE IF NOT EXISTS otp_tokens" database/init.sql
  ```
- [ ] docker-compose.yml tem volumes com prefixo numérico (00_, 01_, etc)?
  ```bash
  grep "docker-entrypoint-initdb" docker-compose.yml
  ```
- [ ] `.env` tem credenciais protegidas (em `.gitignore`)?
  ```bash
  grep -v "^#" .env | grep PASSWORD
  ```

### Testes Locais (OPCIONAL mas recomendado)
- [ ] Frontend build sem erros? `npm run build` ou `yarn build` (em `win-frontend/`)
- [ ] Backend compile sem erros? `./mvnw clean package` (em `backend/`)
- [ ] Docker containers iniciam? `docker-compose up -d`
- [ ] PostgreSQL tabelas existem? 
  ```bash
  docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\dt"
  ```
- [ ] Endpoint `/request-code` responde?
  ```bash
  curl -X POST http://localhost:8080/api/v1/auth/request-code \
    -H "Content-Type: application/json" \
    -d '{"telefone":"+5511999999999"}'
  ```

---

## FASE 2️⃣: COMMIT NO GIT (local)

**Horário de início:** ____________

### Adicionar Arquivos
```bash
# Copie e execute linha por linha:
git add backend/src/main/java/com/win/marketplace/service/OtpService.java
git add backend/src/main/java/com/win/marketplace/integration/TwilioSmsClient.java
git add backend/src/main/resources/application.yml
git add database/init.sql
git add database/V2__add_usuario_endereco_coordinates.sql
git add docker-compose.yml
git add win-frontend/src/contexts/AuthContext.tsx
git add win-frontend/src/pages/shared/Login.tsx
git add win-frontend/src/pages/shared/PhoneLogin.tsx
```

### Verificar Staging
- [ ] `git status` mostra os arquivos adicionados?
- [ ] Nenhum arquivo indesejado incluído?

### Commitar
```bash
git commit -m "feat(auth): Implementar fluxo OTP via SMS com telefone

- Add OtpService com validação e TTL de 5 min
- Add TwilioSmsClient com SMS simulation
- Add PhoneLogin componente React
- Add otp_tokens tabela no banco
- Add colunas latitude/longitude
- Fix typo em devolucoes (itens_pedido → itens_pedidos)
- Update docker-compose com ordem correta"
```

### Verificar Commit
- [ ] `git log --oneline | head -1` mostra o novo commit?
- [ ] Mensagem está clara e descritiva?

### Push para Repositório
```bash
git push origin main
```

- [ ] Push foi bem-sucedido?
- [ ] GitHub/GitLab mostra novo commit?

**Horário de conclusão:** ____________

---

## FASE 3️⃣: BACKUP ANTES DO DEPLOYMENT (VPS)

**Horário de início:** ____________  
**VPS IP/Host:** ____________

### Conectar à VPS
```bash
ssh seu_usuario@seu_vps
cd /caminho/do/projeto/win
```

- [ ] SSH conectado?
- [ ] Diretório correto confirmado?

### Fazer Backup Manual
```bash
# Backup do banco ANTES de qualquer mudança
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > backup_manual_$(date +%Y%m%d_%H%M%S).sql
```

- [ ] Arquivo de backup criado com sucesso?
- [ ] Tamanho do backup parece correto (deve ser >1MB)?

### Verificar Dados Existentes
```bash
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM usuarios;"
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM lojistas;"
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM pedidos;"
```

- [ ] `usuarios` count: ______ (anotar para comparar depois)
- [ ] `lojistas` count: ______ (anotar para comparar depois)
- [ ] `pedidos` count: ______ (anotar para comparar depois)

**Horário de conclusão:** ____________

---

## FASE 4️⃣: DEPLOYMENT SEGURO (VPS)

**Horário de início:** ____________

### Executar Script de Deployment
```bash
bash deploy-seguro-vps.sh
```

- [ ] Script iniciou sem erros?
- [ ] Confirmou BACKUP criado?
- [ ] Pull do código bem-sucedido? (`git pull`)
- [ ] Build do backend concluído?
- [ ] Containers iniciaram?
- [ ] PostgreSQL ficou healthy?
- [ ] Backend ficou healthy?

### Verificar Migração
```bash
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\dt" | grep otp
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d usuarios" | grep -E "latitude|longitude"
```

- [ ] Tabela `otp_tokens` foi criada?
- [ ] Colunas `latitude` e `longitude` existem em `usuarios`?

### Comparar Dados (CRÍTICO - não deve mudar!)
```bash
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM usuarios;"
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM lojistas;"
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM pedidos;"
```

- [ ] `usuarios` count: ______ (deve ser igual ao anterior)
- [ ] `lojistas` count: ______ (deve ser igual ao anterior)
- [ ] `pedidos` count: ______ (deve ser igual ao anterior)
- [ ] **Todos os counts são IGUAIS? Sim [ ] Não [ ]**

**Status:** ✅ Dados preservados com sucesso

### Testar Endpoints
```bash
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone":"+5511999999999"}'
```

- [ ] Retorna HTTP 200?
- [ ] Resposta contém `tempo_expiracao_segundos`?
- [ ] Código foi armazenado no banco?

**Horário de conclusão:** ____________

---

## FASE 5️⃣: TESTES PÓS-DEPLOYMENT (QA)

**Horário de início:** ____________

### Frontend
- [ ] Landing page carrega normalmente?
- [ ] Aba "📱 Telefone" aparece no Login?
- [ ] Consegue inserir telefone em PhoneLogin?
- [ ] Após submeter telefone, tela muda para OTP?
- [ ] Timer de 5 minutos aparece?
- [ ] Botão "Reenviar Código" funciona?

### Backend - OTP Flow
- [ ] POST `/request-code` retorna 200?
- [ ] Código é gerado no banco?
- [ ] Código expira em 5 minutos?
- [ ] POST `/verify-code` com código válido retorna 200?
- [ ] JWT token é retornado?
- [ ] Tentativas limitadas a 3 (tenta com código errado 3x)?

### Banco de Dados
- [ ] `otp_tokens` tabela tem dados?
  ```bash
  docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM otp_tokens;"
  ```
- [ ] Indices foram criados (performance)?
  ```bash
  docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\di" | grep otp
  ```
- [ ] Usuários antigos ainda existem?
  ```bash
  docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome FROM usuarios LIMIT 1;"
  ```

### Performance
- [ ] API responde rápido (<500ms)?
- [ ] Banco responde rápido (<200ms)?
- [ ] Frontend carrega rápido (<3s)?

**Horário de conclusão:** ____________

---

## FASE 6️⃣: DOCUMENTAÇÃO & ENCERRAMENTO

### Gerar Relatório
```bash
# Já feito, ver arquivo deployment_*.log que foi criado
ls -lth deployment_*.log | head -1
cat deployment_*.log
```

- [ ] Log de deployment foi gerado?
- [ ] Log não contém erros críticos?
- [ ] Backup está salvo (caminho: ____________)?

### Documentar Mudanças
- [ ] Registrar timestamp de deployment: ____________
- [ ] Registrar versão do código: ____________ (git commit hash)
- [ ] Registrar quem fez o deploy: ____________
- [ ] Registrar problemas encontrados: ____________

### Comunicação
- [ ] Notificar time sobre novo deployment?
- [ ] Compartilhar documentação (GUIA_DEPLOYMENT_VPS.md)?
- [ ] Executar reunião pós-deployment?

**Horário de conclusão:** ____________

---

## 🎯 RESULTADO FINAL

### Status Geral
- [ ] ✅ Todos os dados preservados
- [ ] ✅ Novas funcionalidades funcionando
- [ ] ✅ Testes passaram
- [ ] ✅ Documentação atualizada
- [ ] ✅ Team informado

### Próximos Passos
- [ ] Monitorar logs por 24h
- [ ] Testar com usuários reais
- [ ] Configurar Twilio (se quiser SMS real)
- [ ] Cron job para limpar otp_tokens expirados

### Rollback (em caso de problema)
**Comando de emergência:**
```bash
docker-compose down
docker exec win-marketplace-db psql -U postgres win_marketplace < backup_*.sql
git revert HEAD
docker-compose up -d
```

- [ ] Comando salvo para referência rápida?
- [ ] Time sabe como executar em caso de emergência?

---

## ✅ CHECKLIST ASSINADO

**Projeto:** ____________________________  
**Deployado por:** ____________________________  
**Data:** ____________________________  
**Hora:** ____________________________  

**Confirmação Final:**
- [ ] Todas as fases completadas com sucesso
- [ ] Nenhum dado foi perdido
- [ ] Sistema está em produção e funcional
- [ ] Backup foi salvaguardado

---

**Assinatura Digital:** ✅ Este projeto foi deployado com segurança máxima

**Status:** 🟢 **DEPLOYMENT CONCLUÍDO COM SUCESSO**

---

_Salve este documento como prova de que o deployment foi realizado corretamente e com zero risco de perda de dados._
