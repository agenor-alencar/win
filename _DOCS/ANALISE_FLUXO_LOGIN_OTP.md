# 📋 Análise: Fluxo de Login via Telefone + OTP SMS

**Data**: 6 de Abril de 2026  
**Status**: ✅ **BACKEND 95% COMPLETO** | ⚠️ **FRONTEND INCOMPLETO**

---

## 🎯 Objetivo
Implementar autenticação completa onde usuários façam login através de:
1. **Número de telefone** (formato: +55 + DDD + número)
2. **Código OTP (One-Time Password)** enviado via SMS

---

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO (Backend)

### 📱 Endpoints da API (Implementados e Testáveis)

#### 1️⃣ **POST `/api/v1/auth/request-code`** ✅
- **Função**: Solicita um novo código OTP via SMS
- **Request**:
  ```json
  { "telefone": "+5511987654321" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "telefone": "+5511987654321",
    "mensagem": "Código de verificação enviado com sucesso via SMS",
    "tempo_expiracao_segundos": 300
  }
  ```
- **Erros Tratados**:
  - `429 Too Many Requests`: Rate limit (máx 3 SMS/min por IP+Telefone)
  - `503 Service Unavailable`: Twilio indisponível
  - `400 Bad Request`: Telefone inválido

#### 2️⃣ **POST `/api/v1/auth/verify-code`** ✅
- **Função**: Valida código OTP e realiza login
- **Request**:
  ```json
  {
    "telefone": "+5511987654321",
    "codigo": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nome": "João Silva",
      "email": "otp_5511987654321_1712364800@otp-login.local",
      "telefone": "+5511987654321",
      "ativo": true
    },
    "token_type": "Bearer",
    "expires_in": 86400
  }
  ```
- **Lógica**:
  - ✅ Gera usuário automaticamente se não existir
  - ✅ Retorna JWT válido compatível com todo o sistema
  - ✅ Máximo 3 tentativas de código antes de bloquear
  - ✅ Código expira em 5 minutos

### 🔧 Classes Backend Implementadas

| Classe | Status | Localização | Descrição |
|--------|--------|-----------|-----------|
| `OtpService.java` | ✅ | `service/` | Geração, validação e TTL de códigos OTP |
| `TwilioSmsClient.java` | ✅ | `integration/` | Cliente HTTP para API Twilio com retry |
| `SmsRateLimitService.java` | ✅ | `security/` | Rate limiting (3 req/min, bloqueio 60s) |
| `OtpToken.java` | ✅ | `model/` | Entidade de banco de dados para OTP |
| `OtpTokenRepository.java` | ✅ | `repository/` | Queries customizadas para OTP |
| `OtpRequestDTO.java` | ✅ | `dto/request/` | DTO com validação de telefone |
| `OtpVerifyRequestDTO.java` | ✅ | `dto/request/` | DTO com validação de telefone + código |
| `OtpResponseDTO.java` | ✅ | `dto/response/` | DTO de resposta padronizada |
| `UsuarioRepository` | ✅ AMPLIADO | `repository/` | Adicionado `findByTelefone()` |
| `AuthController` | ✅ AMPLIADO | `controller/` | Adicionar endpoints `/request-code` e `/verify-code` |

### 🛡️ Segurança Implementada

- ✅ **Rate Limiting**: Máximo 3 SMS/minuto por IP + Telefone
- ✅ **Bloqueio Automático**: 60 segundos após atingir limite
- ✅ **Expiração de Código**: TTL de 5 minutos
- ✅ **Limite de Tentativas**: Máximo 3 tentativas de validação
- ✅ **Invalidação Automática**: OTP é invalidado após uso bem-sucedido
- ✅ **Retry Automático**: Cliente Twilio faz retry em caso de 429/503

### 🗄️ Banco de Dados

**Tabela criada**: `otp_tokens`
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

### ⚙️ Configuração (Variáveis de Ambiente)

**Arquivo**: `.env` ✅ Configurado (com valores de teste)

```env
# Twilio - SMS
TWILIO_ACCOUNT_SID=ACb1a1d5e1e1b5a5e1e1b5a5e1e1b5a5e
TWILIO_AUTH_TOKEN=a1b5c5d5e5f5a5b5c5d5e5f5a5b5c5d5
TWILIO_FROM_NUMBER=+15551234567
TWILIO_ENABLED=true
TWILIO_TEST_PHONE=+55119998765

# OTP
OTP_EXPIRATION_MINUTES=5
OTP_MAX_ATTEMPTS=3

# SMS Rate Limiting
SMS_RATELIMIT_MAX_REQUESTS=3
SMS_RATELIMIT_WINDOW_MINUTES=1
SMS_RATELIMIT_BLOCK_MINUTES=1

# Redis (necessário para rate limiting)
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

### 📚 Documentação Criada

- ✅ `_DOCS/API/OTP_IMPLEMENTATION_GUIDE.md` - Guia técnico completo
- ✅ `_DOCS/API/OTP_SMS_AUTHENTICATION.md` - Documentação dos endpoints

---

## ⚠️ O QUE FALTA FAZER (Frontend)

### 🎨 Componentes UI Necessários

| Componente | Status | Descrição |
|-----------|--------|-----------|
| `PhoneLoginTabs` | ❌ FALTA | Aba "Entrar via Telefone" na página de Login |
| `PhoneInput` | ✅ EXISTE | Entrada de telefone com máscara (já existe em formatters) |
| `OtpCodeInput` | ✅ EXISTE | Componente InputOTP.tsx (pronto para usar) |
| `PhoneVerificationFlow` | ❌ FALTA | Fluxo completo de 2 etapas |

### 🔄 Fluxo de Autenticação via Telefone (FALTA NO FRONTEND)

```
1. Usuário entra em Login e clica em "Entrar via Telefone"
   ↓
2. Formulário pede: Número de Telefone
   ↓
3. Usuário clica "Enviar Código"
   ↓
4. Frontend faz: POST /api/v1/auth/request-code { telefone }
   - Mostra mensagem: "Código enviado para +55 11 98765-4321"
   - Ativa timer de 5 minutos (contagem regressiva)
   - Mostra botão "Reenviar" (desabilitado até terminar timer)
   ↓
5. Usuário recebe SMS com código: "123456"
   ↓
6. Formulário agora pede: Código OTP (6 dígitos)
   - Usar componente InputOTP para entrada (6 slots)
   - Validação em tempo real
   ↓
7. Usuário digita e confirma
   ↓
8. Frontend faz: POST /api/v1/auth/verify-code 
     { telefone, codigo: "123456" }
   ↓
9. Se sucesso (200 OK):
   - Armazena token JWT em localStorage
   - Armazena dados do usuário
   - Redireciona para tela inicial
   ↓
10. Se erro (401):
    - Tenta novamente (máx 3 tentativas)
    - Se atingir limite: "Solicite novo código"
```

### 💡 O que precisa ser criado/modificado:

#### 1. **Modificar `/pages/shared/Login.tsx`**
```
- Adicionar nova aba: "Entrar via Telefone"
- Manter aba existente: "Entrar" (email + senha)
- Manter aba existente: "Criar Conta"
```

#### 2. **Criar novo arquivo `/pages/shared/PhoneLogin.tsx`**
Componente que implementa:
- Etapa 1: Input de telefone + botão "Enviar Código"
- Etapa 2: InputOTP para 6 dígitos + botão "Validar"
- Estados:
  - `Loading`: Aguardando resposta da API
  - `WaitingCode`: Aguardando usuário digitar código
  - `Success`: Login realizado
  - `Error`: Mostrar mensagem de erro

#### 3. **Adicionar métodos ao `AuthContext.tsx`**
```typescript
// Novo método para login OTP
phone: (telefone: string, codigo: string) => Promise<{ success: boolean; error?: string }>;

// Novo método para solicitação de código
requestOtpCode: (telefone: string) => Promise<{ success: boolean; error?: string }>;
```

#### 4. **Usar componente `InputOTP` existente**
- Arquivo já existe: `/components/ui/input-otp.tsx`
- Basta importar e usar como:
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

<InputOTP maxLength={6} onChange={setCode} value={code}>
  <InputOTPGroup>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <InputOTPSlot key={i} index={i} />
    ))}
  </InputOTPGroup>
</InputOTP>
```

#### 5. **Tratamento de Erros**
- `429`: "Muitas requisições. Aguarde 45 segundos"
- `401`: "Código inválido. Tente novamente (2 de 3 tentativas)"
- `503`: "Serviço de SMS indisponível. Tente novamente"
- `400`: "Telefone inválido. Use formato: +55 11 98765-4321"

#### 6. **UX Melhorias**
- Timer visual na tela de validação (5 minutos)
- Botão "Reenviar Código" ativo após expiração
- Feedback visual de progresso durante verificação
- Máscara de telefone automaticamente aplicada
- Formatação de telefone exibido confirmado aos usuários

---

## 🚀 Resumo do Status

### Backend (Spring Boot)
```
✅ Endpoints: OK
✅ Serviços: OK
✅ Banco de dados: OK (tabela criada com índices)
✅ Segurança: OK (rate limiting, TTL, retry)
✅ Configuração: OK (variáveis de ambiente prontas)
✅ Documentação: OK

STATUS: 95% COMPLETO
```

### Frontend (React + Vite)
```
❌ Tela de login com aba OTP: NÃO EXISTE
❌ Lógica de solicitação de código: NÃO EXISTE
❌ Interface de validação OTP: NÃO EXISTE
❌ Integração com AuthContext: NÃO EXISTE
✅ Componente InputOTP: PRONTO

STATUS: 5% COMPLETO (só componente UI)
```

---

## 📝 Próximos Passos (Ordem de Prioridade)

1. **Adicionar métodos ao `AuthContext.tsx`**:
   - `requestOtpCode(telefone)` - Chama POST `/api/v1/auth/request-code`
   - `verifyOtpCode(telefone, codigo)` - Chama POST `/api/v1/auth/verify-code`

2. **Criar componente `PhoneLogin.tsx`**:
   - Formulário com 2 fases (solicitar código + validar código)
   - Usando InputOTP para entrada de 6 dígitos
   - Timer de 5 minutos
   - Gerenciamento de estados e erros

3. **Modificar página `Login.tsx`**:
   - Adicionar aba "Entrar via Telefone"
   - Importar novo componente `PhoneLogin`

4. **Testar fluxo completo**:
   - Solicitar código (receberá SMS se Twilio configurado)
   - Validar código
   - Verificar se JWT é armazenado e usuário faz login

5. **Configurar Twilio em produção**:
   - Atualmente usa valores de teste em `.env`
   - Precisará de:
     - `TWILIO_ACCOUNT_SID` real
     - `TWILIO_AUTH_TOKEN` real
     - `TWILIO_FROM_NUMBER` real (número verificado no Twilio)

---

## 🔗 Referências

- **Backend**: [OTP_IMPLEMENTATION_GUIDE.md](_DOCS/API/OTP_IMPLEMENTATION_GUIDE.md)
- **API Docs**: [OTP_SMS_AUTHENTICATION.md](_DOCS/API/OTP_SMS_AUTHENTICATION.md)
- **Endpoints JSON**: [endpoints.json](endpoints.json)
- **Variáveis**: [.env](.env)
