# 🔐 Guia de Segurança - WIN Marketplace

## 📋 Conteúdo
- [Políticas de Controle de Acesso](#-políticas-de-controle-de-acesso)
- [Dados Sensíveis](#-dados-sensíveis)
- [Relato de Vulnerabilidades](#-relato-de-vulnerabilidades)
- [Práticas Recomendadas](#-práticas-recomendadas)

---

## 🔒 Políticas de Controle de Acesso

### Autenticação
- ✅ JWT (JSON Web Tokens) para APIs
- ✅ Hashing bcrypt para senhas (cost=12)
- ✅ Rate limit: 5 tentativas / 15 minutos
- ✅ Sessions seguras com SameSite=Strict

### Autorização
- ✅ RBAC (Role-Based Access Control)
- ✅ Validação de permissões em cada endpoint
- ✅ Isolamento de dados por tenant

### Sessões
- ⏱️ TTL: 24 horas (configurável)
- 🔄 Renovação automática
- ❌ Invalidação ao logout

---

## 🔑 Dados Sensíveis

### NÃO ADICIONE AO REPOSITÓRIO
```
❌ .env com credenciais
❌ Chaves privadas (*.key, *.pem)
❌ Tokens de API (SendGrid, Pagar.me, Uber)
❌ Dados de bancos de dados
❌ Certificados SSL
❌ IPs de servidores
❌ Dados de teste com valores reais
```

### ADICIONE AO .gitignore
Todos os arquivos sensíveis estão configurados em `.gitignore`

### VARIABLES DE AMBIENTE OBRIGATÓRIAS
```bash
# Autenticação
JWT_SECRET=<gere uma chave aleatória de 256 bits>
SECURITY_LOGIN_MAX_ATTEMPTS=5

# Banco de Dados
POSTGRES_DB=win_marketplace
POSTGRES_USER=<usuário seguro>
POSTGRES_PASSWORD=<senha forte>

# Integrações Externas
SENDGRID_API_KEY=<sua chave SendGrid>
PAGAR_ME_API_KEY=<sua chave Pagar.me>
UBER_DIRECT_CLIENT_ID=<seu client ID>
UBER_DIRECT_CLIENT_SECRET=<seu client secret>

# Produção
ALLOWED_ORIGINS=https://seu-dominio.com

# Logs
LOG_LEVEL=INFO (não use DEBUG em produção)
```

---

## 🚨 Relato de Vulnerabilidades

### Encontrou uma vulnerabilidade?

**NÃO** abra uma issue pública! Envie por email privado:

📧 **seguranca@win-marketplace.com**

Inclua:
1. Descrição da vulnerabilidade
2. Passos para reproduzir
3. Impacto potencial
4. Sugestão de fix (opcional)

### Resposta Esperada
- ⏱️ Confirmação em 24h
- 🔧 Fix em 7 dias (críticas)
- 📝 Divulgação responsável

---

## ✅ Práticas Recomendadas

### ♻️ Desenvolvimento
```bash
# Use .env.example como template
cp .env.example .env

# Nunca commite .env
git status  # Confirme que mostra como ignored

# Use senhas/tokens aleatórios em dev
openssl rand -base64 32 > /dev/null
```

### 🔐 Credenciais Seguras
- Altere senhas padrão (postgres123 → senha forte)
- Use gerenciador de senhas (1Password, Bitwarden)
- Rotacione chaves regularmente
- Monitore uso de tokens

### 🐳 Docker
```bash
# NÃO use credenciais no Dockerfile
# ✅ Use Docker secrets ou vars de ambiente

# Construa multi-stage para reduzir tamanho
docker build --target runtime .

# Scaneie imagens por vulnerabilidades
docker scan win-marketplace:latest
```

### ☕ Java/Spring Boot
```yaml
# ✅ application.properties
spring.jpa.hibernate.ddl-auto=validate  # Em prod
logging.level.root=WARN  # Não expose details
server.error.include-message=never  # Não expose stack traces
```

### ⚛️ React/Frontend
```javascript
// ✅ Boas práticas
- Valide inputs no cliente E servidor
- Sanitize HTML (use bibliotecas)
- HTTPS obrigatório em prod
- CSP headers configurados
- XSS protection ativa
```

### 🗄️ Banco de Dados
```sql
-- ✅ Restricione acesso
GRANT CONNECT ON DATABASE win_marketplace TO app_user;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- ✅ Não use root para aplicação
-- Crie usuário com permissões mínimas

-- ✅ Backup encriptado
pg_dump -Fc win_marketplace | gpg -c > backup.sql.gpg
```

---

## 📊 Vulnerabilidades Conhecidas

### Status do Projeto
```
✅ Sem vulnerabilidades críticas
⚠️  Dependências são auditadas regularmente
```

### Verificar Vulnerabilidades
```bash
# Backend
mvn dependency-check:check

# Frontend
npm audit
npm audit --production
```

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Best Practices](https://spring.io/projects/spring-security)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)

---

## ✍️ Version History

| Data | Mudança |
|------|---------|
| 2026-04-04 | Versão inicial |

---

**Última atualização**: 04 de abril de 2026

*Se tem dúvidas sobre segurança, abra uma [Discussion](../../discussions) (NÃO issue)*
