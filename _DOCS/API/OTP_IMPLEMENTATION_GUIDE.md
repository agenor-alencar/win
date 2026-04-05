# 📝 Guia de Implementação: Sistema de OTP via SMS

## 🎯 Objetivo
Refatoração do sistema de autenticação para suportar login via **telefone + OTP SMS** usando **Twilio**, sem quebrar compatibilidade com fluxo JWT existente.

---

## 📦 Arquivos Criados/Modificados

### ✅ Novo Modelo (Database)
- `model/OtpToken.java` - Entidade para gravar códigos OTP no banco

### ✅ Repositórios
- `repository/OtpTokenRepository.java` - Queries customizadas para OTP
- `repository/UsuarioRepository.java` - Adicionado método `findByTelefone()`

### ✅ Services
- `service/OtpService.java` - Lógica de geração, validação e gerenciamento de OTPs
- `security/SmsRateLimitService.java` - Rate limiting (3 req/min por IP+Telefone)
- `integration/TwilioSmsClient.java` - Cliente HTTP para API Twilio

### ✅ Controllers
- `controller/AuthController.java` - Adicionados endpoints:
  - `POST /api/v1/auth/request-code` - Solicita código OTP
  - `POST /api/v1/auth/verify-code` - Valida código e realiza login

### ✅ DTOs
- `dto/request/OtpRequestDTO.java` - Validação de telefone
- `dto/request/OtpVerifyRequestDTO.java` - Validação de telefone + código
- `dto/response/OtpResponseDTO.java` - Resposta padronizada

### ✅ Configurações
- `pom.xml` - Adicionada dependência Twilio
- `application.yml` - Adicionadas configurações de Twilio, OTP e Rate Limiting

### ✅ Documentação
- `_DOCS/API/OTP_SMS_AUTHENTICATION.md` - Documentação completa dos endpoints

---

## 🛠️ Passos de Implementação

### 1. Configurar Twilio

1. Acessar https://www.twilio.com/console
2. Anotar:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `your_auth_token_here`
   - **Phone Number**: Número Twilio verificado (ex: `+5511999999999`)

### 2. Configurar Variáveis de Ambiente

```bash
# .env ou docker-compose.yml

# === TWILIO ===
TWILIO_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+5511999999999

# === OTP ===
OTP_EXPIRATION_MINUTES=5
OTP_MAX_ATTEMPTS=3

# === SMS RATE LIMITING ===
SMS_RATELIMIT_MAX_REQUESTS=3
SMS_RATELIMIT_WINDOW_MINUTES=1
SMS_RATELIMIT_BLOCK_MINUTES=1

# === REDIS (necessário para rate limiting) ===
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

### 3. Executar Migrações de Banco

A tabela `otp_tokens` será criada automaticamente pelo Hibernate na próxima inicialização se:
- `JPA_DDL_AUTO=update` ou `create`

**Ou criar manualmente:**

```sql
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY,
    telefone VARCHAR(20) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    valido BOOLEAN NOT NULL DEFAULT true,
    expiracao TIMESTAMP NOT NULL,
    criado_em TIMESTAMP NOT NULL,
    atualizado_em TIMESTAMP NOT NULL
);

CREATE INDEX idx_otp_telefone ON otp_tokens(telefone);
CREATE INDEX idx_otp_valido ON otp_tokens(valido);
CREATE INDEX idx_otp_expiracao ON otp_tokens(expiracao);
```

### 4. Build e Deploy

```bash
# Maven build
cd backend
mvn clean package

# Docker build (se usando Docker)
docker build -t win-marketplace:latest .

# Docker compose
docker-compose up -d
```

### 5. Testar Endpoints

#### Teste 1: Solicitar Código
```bash
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "+5511987654321"
  }'

# Resposta esperada (200):
{
  "telefone": "+5511987654321",
  "mensagem": "Código de verificação enviado com sucesso via SMS",
  "tempo_expiracao_segundos": 300
}
```

#### Teste 2: Validar Código (Extrair do SMS real ou logs)
```bash
# Verificar logs para localize o código gerado
# Se TWILIO_ENABLED=false, o código aparece nos logs

curl -X POST http://localhost:8080/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "+5511987654321",
    "codigo": "123456"
  }'

# Resposta esperada (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "+5511987654321",
    "email": "otp_5511987654321_1712364800@otp-login.local",
    "telefone": "+5511987654321"
  },
  "token_type": "Bearer",
  "expires_in": 86400
}
```

---

## 🧪 Testes Local (Sem Custos Twilio)

### Habilitar Modo Development

```bash
# .env
TWILIO_ENABLED=false
```

**Comportamento:**
- Códigos OTP são gerados normalmente
- SMS não são enviados (apenas logados)
- Ideal para testes lokals e automatizados

### Extrair Código dos Logs

```bash
# Terminal 1: Iniciar backend
docker logs -f win-backend

# Terminal 2: Solicitar código
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321"}'

# Verificar logs para mensagem como:
# "SMS enviado com sucesso para +5511987654321 - Código: 123456"
```

---

## ⚙️ Configurações Avançadas

### Ajustar TTL do OTP

```yaml
# application.yml
otp:
  expiration-minutes: 10  # Padrão: 5 minutos
  max-attempts: 5         # Padrão: 3 tentativas
```

### Ajustar Rate Limiting

```yaml
# application.yml
sms:
  ratelimit:
    max-requests: 5           # Padrão: 3 requisições
    window-minutes: 2         # Padrão: 1 minuto
    block-minutes: 5          # Padrão: 1 minuto
```

### Desabilitar Rate Limiting (apenas em desenvolvimento)

```bash
# .env
SECURITY_LOGIN_USE_REDIS=false  # Desabilita Redis
```

Neste modo, usa Map em memória (não recomendado para produção)

---

## 🔐 Segurança

### Proteções Implementadas

1. **Rate Limiting SMS**: Máx 3 requisições por minuto por IP+Telefone
2. **TTL Automático**: Códigos expiram após 5 minutos
3. **Limite de Tentativas**: Máx 3 tentativas incorretas por OTP
4. **Invalidação Imediata**: Código é invalidado após uso bem-sucedido
5. **Hash BCrypt**: Senhas (quando presente) ainda usam BCrypt
6. **JWT Seguro**: Tokens assinados com HS256 + chave fortes

### Recomendações para Produção

1. **Usar Redis**: Essencial para rate limiting distribuído
   ```bash
   SECURITY_LOGIN_USE_REDIS=true
   ```

2. **HTTPS Obrigatório**: Proteger tokens em trânsito

3. **Firewall**: Restringir acesso à API de SMS

4. **Monitoramento**: Alertar sobre tentativas de brute force (429+ repetidos)

5. **Logs**: Manter auditoria de tentativas de login OTP

---

## 🐳 Docker Compose (Exemplo Completo)

```yaml
version: '3.8'

services:
  backend:
    image: win-marketplace:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/win_marketplace
      SPRING_DATA_REDIS_HOST: redis
      TWILIO_ENABLED: "true"
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: win_marketplace
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 📊 Monitoramento

### Métricas Importantes

1. **Taxa de Sucesso de SMS**: `successful_sms / total_requests`
2. **Rate Limit Hit Rate**: Quantas vezes 429 retornou
3. **OTP Timeout Rate**: Códigos expirados antes de validação
4. **Tentativas Falhadas**: Códigos incorretos por usuário

### Queries de Debug

```sql
-- Últimos OTPs solicitados
SELECT telefone, codigo, tentativas, valido, expiracao, criado_em
FROM otp_tokens
ORDER BY criado_em DESC
LIMIT 20;

-- OTPs completamente expirados
SELECT COUNT(*) as expired_otps
FROM otp_tokens
WHERE expiracao < NOW();

-- Taxa de rejeição por telefone
SELECT telefone, COUNT(*) as total_tentativas
FROM otp_tokens
WHERE tentativas > 0
GROUP BY telefone
ORDER BY total_tentativas DESC;
```

---

## 🚨 Troubleshooting

### ❌ "Connection refused" ao Twilio

```
java.net.ConnectException: Connection refused
```

**Solução:**
- Verificar credenciais Twilio
- Verificar se Account SID está ativo
- Usar `TWILIO_ENABLED=false` para modo test

### ❌ "Rate Limit 429" mesmo com poucos requests

```
Too Many Requests: Muitos códigos solicitados
```

**Solução:**
- Verificrar se Redis está rodando: `redis-cli ping`
- Resetar rate limit Redis: `redis-cli DEL "sms:ratelimit:*" "sms:blocked:*"`

### ❌ OTP vencendo muito rápido

```
código inválido ou expirado após 2 minutos
```

**Solução:**
- Aumentar `OTP_EXPIRATION_MINUTES` em `.env`
- Default é 5 minutos, aumentar para 10-15 se necessário

### ❌ SMS não chegando

**Verificar passo a passo:**

1. Código foi gerado? (Verificar logs)
2. Twilio está habilitado? `TWILIO_ENABLED=true`
3. Credenciais corretas? Consultar Twilio Dashboard
4. Número destino existe? Deve ser formato internacional (+55...)
5. Número Twilio está verificado? (Em trial apenas verified numbers)

---

## 📚 Referências

- Documentação Twilio: https://www.twilio.com/docs/sms/api
- Spring Boot Security: https://spring.io/projects/spring-security
- JWT Reference: https://tools.ietf.org/html/rfc7519
- Redis Documentation: https://redis.io/documentation

---

## ✅ Checklist de Implementação

- [ ] Variáveis de ambiente configuradas
- [ ] Migração de banco executada (tabela `otp_tokens` criada)
- [ ] Depência Twilio adicionada ao `pom.xml`
- [ ] Credenciais Twilio testadas
- [ ] Endpoints testados localmente
- [ ] Rate limiting verificado
- [ ] Redis iniciado e funcionando
- [ ] JWT token sendo retornado corretamente
- [ ] Logs monitorados para erros
- [ ] Documentação compartilhada com time

---

## 📞 Suporte

Para dúvidas específicas:
1. Consultar `_DOCS/API/OTP_SMS_AUTHENTICATION.md`
2. Verificar logs de erro
3. Testar endpoints com curl/Postman
4. Validar configuração de ambiente

