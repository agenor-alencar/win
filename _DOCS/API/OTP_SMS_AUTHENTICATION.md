# 📱 Sistema de Autenticação via OTP SMS

## 📖 Visão Geral

Implementação de autenticação baseada em **telefone e OTP (One-Time Password)** enviado via SMS través da API **Twilio**. O sistema permite login sem senha, com validação via código de 6 dígitos enviado ao celular do usuário.

---

## ✅ Critérios de Aceite Implementados

- [x] **Banco de dados suporta gravação e expiração de códigos OTP**: Tabela `otp_tokens` com field `expiracao` e índices para performance
- [x] **Rate Limiting implementado**: Máximo 3 solicitações SMS por minuto (IP + Telefone), com bloqueio automático de 60 segundos
- [x] **Token JWT mantido**: Fluxo retorna JWT válido idêntico ao login tradicional, compatível com rotas existentes
- [x] **Campo de senha opcional**: Nova regra de negócio permite usuários OTP sem senha

---

## 🔄 Fluxo Técnico

### 1️⃣ Etapa 1: Solicitar Código (POST `/api/v1/auth/request-code`)

```
Cliente (Mobile/Web)
    ↓
    POST /api/v1/auth/request-code
    { "telefone": "+5511987654321" }
    ↓
Backend
    1. Validar formato telefone
    2. Verificar Rate Limiting (IP + Telefone)
    3. Gerar código aleatório de 6 dígitos
    4. Salvar no banco com TTL 5 minutos
    5. Enviar SMS via Twilio
    6. Retornar resposta de sucesso
    ↓
    HTTP 200 OK
    {
        "telefone": "+5511987654321",
        "mensagem": "Código de verificação enviado com sucesso via SMS",
        "tempo_expiracao_segundos": 300
    }
```

**Validações:**
- Formato telefone: `+55` + 11 dígitos (DDD + número)
- Rate Limit: máx 3 requisições por minuto por IP+Telefone
- **Resposta de erro (429)**: Muitas requisições
- **Resposta de erro (503)**: Serviço SMS indisponível

---

### 2️⃣ Etapa 2: Validar Código e Login (POST `/api/v1/auth/verify-code`)

```
Cliente (Mobile/Web)
    ↓
    POST /api/v1/auth/verify-code
    {
        "telefone": "+5511987654321",
        "codigo": "123456"
    }
    ↓
Backend
    1. Validar código (6 dígitos)
    2. Buscar OTP válido no banco
    3. Verificar se não expirou
    4. Verificar se código bate (máx 3 tentativas)
    5. Se OK: invalidar OTP, buscar/criar usuário
    6. Gerar Token JWT
    7. Retornar token + dados usuário
    ↓
    HTTP 200 OK
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "usuario": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "nome": "João Silva",
            "telefone": "+5511987654321",
            "email": "otp_5511987654321_1712364800@otp-login.local"
        },
        "token_type": "Bearer",
        "expires_in": 86400
    }
```

**Validações:**
- Código deve ter exatamente 6 dígitos numéricos
- Máximo 3 tentativas de validação por OTP
- **Resposta de erro (401)**: Código inválido, expirado ou limite tentativas atingido

---

## 📡 Endpoints

### `POST /api/v1/auth/request-code`

**Solicita um novo código OTP via SMS**

#### Request
```json
{
  "telefone": "+5511987654321"
}
```

#### Response (200 OK)
```json
{
  "telefone": "+5511987654321",
  "mensagem": "Código de verificação enviado com sucesso via SMS",
  "tempo_expiracao_segundos": 300
}
```

#### Error Responses

**429 Too Many Requests** - Rate limit atingido
```json
{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Muitos códigos solicitados. Tente novamente em 45 segundos"
}
```

**503 Service Unavailable** - Twilio indisponível
```json
{
  "status": 503,
  "error": "Service Unavailable",
  "message": "Serviço de SMS indisponível. Tente novamente em alguns minutos"
}
```

**400 Bad Request** - Telefone inválido
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Telefone deve ter formato válido. Ex: +5511987654321"
}
```

---

### `POST /api/v1/auth/verify-code`

**Valida código OTP e realiza login**

#### Request
```json
{
  "telefone": "+5511987654321",
  "codigo": "123456"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvdHBfNTUxMTk4NzY1NDMyMV8xNzEyMzY0ODAwQG90cC1sb2dpbi5sb2NhbCIsInBlcmZpcyI6WyJVU0VSIl0sImlhdCI6MTcxMjM2NTA2MCwiZXhwIjoxNzEyNDUxNDYwfQ...",
  "usuario": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "otp_5511987654321_1712364800@otp-login.local",
    "telefone": "+5511987654321",
    "ativo": true,
    "criado_em": "2024-04-05T10:30:00-03:00"
  },
  "token_type": "Bearer",
  "expires_in": 86400
}
```

#### Error Responses

**401 Unauthorized** - Código inválido ou expirado
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Código inválido ou expirado"
}
```

**401 Unauthorized** - Limite de tentativas atingido
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Código inválido. Limite de tentativas atingido. Solicite um novo código"
}
```

**400 Bad Request** - Código inválido
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Código deve ser exatamente 6 dígitos numéricos"
}
```

---

## 🔐 Rate Limiting

### Estratégia
- **Limite**: 3 solicitações por minuto
- **Chave de identificação**: `IP_Cliente + Telefone`
- **Bloqueio**: 60 segundos automáticos após atingir limite
- **Backend**: Redis (com fallback para memória em modo dev)

### Exemplos

**Primeira solicitação** ✅
```bash
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321"}'

# HTTP 200 - Sucesso
```

**Segunda solicitação** ✅
```bash
# Aguardar alguns segundos
sleep 2

curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321"}'

# HTTP 200 - Sucesso
```

**Quarta solicitação (excede limite)** ❌
```bash
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321"}'

# HTTP 429 - "Muitos códigos solicitados. Tente novamente em 60 segundos"
```

---

## 🗄️ Modelo de Dados

### Tabela: `otp_tokens`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `telefone` | VARCHAR(20) | NOT NULL, INDEX | Número de telefone (+5511999999999) |
| `codigo` | VARCHAR(6) | NOT NULL | Código de 6 dígitos (000000-999999) |
| `tentativas` | INTEGER | NOT NULL, DEFAULT 0 | Contador de tentativas |
| `valido` | BOOLEAN | NOT NULL, DEFAULT true | Flag de validade |
| `expiracao` | TIMESTAMP | NOT NULL, INDEX | Data/hora de expiração (TTL 5min) |
| `criado_em` | TIMESTAMP | NOT NULL | Timestamp de criação |
| `atualizado_em` | TIMESTAMP | NOT NULL | Timestamp de atualização |

### Índices
```sql
CREATE INDEX idx_otp_telefone ON otp_tokens(telefone);
CREATE INDEX idx_otp_valido ON otp_tokens(valido);
CREATE INDEX idx_otp_expiracao ON otp_tokens(expiracao);
```

---

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```bash
# === TWILIO SMS ===
TWILIO_ENABLED=true
TWILIO_ACCOUNT_SID=AC*************************  # Obtém no painel Twilio
TWILIO_AUTH_TOKEN=****************************   # Obtém no painel Twilio
TWILIO_PHONE_NUMBER=+5511999999999              # Número Twilio verificado

# === OTP ===
OTP_EXPIRATION_MINUTES=5       # Tempo até expiração (padrão: 5 min)
OTP_MAX_ATTEMPTS=3              # Máximo de tentativas (padrão: 3)

# === SMS RATE LIMITING ===
SMS_RATELIMIT_MAX_REQUESTS=3     # Máx requisições (padrão: 3)
SMS_RATELIMIT_WINDOW_MINUTES=1   # Janela de tempo (padrão: 1 min)
SMS_RATELIMIT_BLOCK_MINUTES=1    # Tempo de bloqueio (padrão: 1 min)

# === REDIS ===
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

### Modo Development (Twilio Desabilitado)

Para testar localmente **sem custos** com Twilio:

```bash
TWILIO_ENABLED=false
```

Quando `TWILIO_ENABLED=false`:
- Códigos OTP são gerados normalmente
- Não atingem API Twilio (sem custos)
- SMS é registrado apenas em logs
- Útil para testes automatizados

---

## 📊 Arquitetura de Componentes

```
AuthController
    ├── request-code endpoint
    │   ├── SmsRateLimitService (validar limite)
    │   ├── OtpService (gerar código)
    │   └── TwilioSmsClient (enviar SMS)
    │
    └── verify-code endpoint
        ├── OtpService (validar código)
        ├── UsuarioRepository (buscar/criar usuário)
        ├── JwtService (gerar token)
        └── UsuarioService (atualizar último acesso)

Database (PostgreSQL)
    ├── otp_tokens (novos registros)
    └── usuarios (consulta/inserção)

Cache/Queue (Redis)
    ├── sms:ratelimit:* (contadores)
    └── sms:blocked:* (bloqueios)

External API (Twilio)
    └── POST https://api.twilio.com/.../Messages.json
```

---

## 🚀 Fluxo no Frontend (Flutter/React)

### Tela 1: Inserir Telefone
```dart
// Flutter Example
final phone = "+5511987654321";
final response = await http.post(
  Uri.parse("$apiUrl/auth/request-code"),
  headers: {"Content-Type": "application/json"},
  body: jsonEncode({"telefone": phone}),
);

if (response.statusCode == 200) {
  showSnackBar("Código enviado! Válido por 5 minutos");
  navigateToOtpScreen();
} else if (response.statusCode == 429) {
  showError("Muitas requisições. Aguarde...");
}
```

### Tela 2: Inserir Código OTP
```dart
// Usuário digita código na tela
final code = "123456";
final response = await http.post(
  Uri.parse("$apiUrl/auth/verify-code"),
  headers: {"Content-Type": "application/json"},
  body: jsonEncode({
    "telefone": phone,
    "codigo": code
  }),
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  final token = data["access_token"];
  
  // Salvar token localmente
  await storage.write(key: "jwt_token", value: token);
  
  // Navegar para home
  navigateToHome();
} else {
  showError("Código inválido ou expirado");
}
```

---

## 🐛 Troubleshooting

### "Twilio indisponível" (503)

**Causa**: API Twilio fora do ar ou credenciais inválidas

**Solução**:
1. Verificar status Twilio: https://status.twilio.com
2. Validar credenciais no `.env`
3. Verificar se número Twilio está verificado
4. Aumentar tentativas de retry (já implementado com backoff exponencial)

---

### "Rate limit atingido" (429)

**Causa**: Mais de 3 requisições no mesmo minuto

**Solução**:
1. Aguardar 60 segundos conforme mensagem
2. Mudar IP/Telefone (para testes)
3. Resetar rate limit via admin (método: `smsRateLimitService.resetarRateLimit()`)

---

### "Código inválido" (401)

**Possiveis causas**:
- Código expirou (>5 minutos)
- Código já foi usado (invalidado após login bem-sucedido)
- 3 tentativas incorretas esgotadas

**Solução**: Solicitar novo código via `POST /api/v1/auth/request-code`

---

## 📝 Histórico de Mudanças

### v1.0.0 - Implementação Inicial
- ✅ Endpoints de OTP implementados
- ✅ Rate limiting implementado
- ✅ Integração Twilio
- ✅ Criação automática de usuários OTP
- ✅ JWT mantido compatível

---

## 📞 Suporte

Para questões sobre implementação, consulte:
- **Documentação Twilio**: https://www.twilio.com/docs/sms/api
- **Spring Security**: https://spring.io/projects/spring-security
- **JWT**: https://jwt.io

