# 📌 Checklist de Implementação: Frontend OTP

## ✅ Pré-requisitos Verificados

- [x] Backend está 95% completo (endpoints implementados)
- [x] Tabela `otp_tokens` criada no banco
- [x] Componente `InputOTP` já existe no frontend
- [x] `AuthContext` existe e está funcional
- [x] Configurações Twilio estão no `.env`

---

## 🔧 Tarefas de Implementação (Ordem de Execução)

### **Fase 1: Estender AuthContext** 
*(Arquivo: `win-frontend/src/contexts/AuthContext.tsx`)*

- [ ] Adicionar interface `OtpCodeResponse`
- [ ] Adicionar método `requestOtpCode(telefone: string)`
- [ ] Adicionar método `verifyOtpCode(telefone: string, codigo: string)`
- [ ] Testar métodos com console.log

### **Fase 2: Criar Componente PhoneLogin**
*(Arquivo: `win-frontend/src/pages/shared/PhoneLogin.tsx`)*

- [ ] Criar arquivo novo
- [ ] Implementar estágio 1: Entrada de telefone
- [ ] Implementar estágio 2: Entrada de OTP
- [ ] Implementar timer (5 minutos)
- [ ] Implementar tratamento de erros
- [ ] Importar e usar componente `InputOTP`

### **Fase 3: Integrar ao Login**
*(Arquivo: `win-frontend/src/pages/shared/Login.tsx`)*

- [ ] Importar componente `PhoneLogin`
- [ ] Adicionar aba "Entrar via Telefone"
- [ ] Testar navegação entre abas

### **Fase 4: Testes End-to-End**
- [ ] Solicitar código para telefone válido
- [ ] Validar código recebido
- [ ] Verificar JWT em localStorage
- [ ] Verificar redirecionamento após login
- [ ] Testar erros (código inválido, expirado, etc)

---

## 📊 Checklist de Testes

### Backend (Execute com curl/Postman)

```bash
# 1. Solicitar código
curl -X POST http://localhost:8080/api/v1/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321"}'

# Esperado: 200 OK
# {
#   "telefone": "+5511987654321",
#   "mensagem": "Código de verificação enviado com sucesso via SMS",
#   "tempo_expiracao_segundos": 300
# }
```

```bash
# 2. Validar código
curl -X POST http://localhost:8080/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"telefone": "+5511987654321", "codigo": "123456"}'

# Esperado: 200 OK
# {
#   "access_token": "eyJhbGc...",
#   "usuario": { ... },
#   "token_type": "Bearer",
#   "expires_in": 86400
# }
```

### Frontend (Manual)

- [ ] Aba "Entrar via Telefone" aparece
- [ ] Validação de formato de telefone funciona
- [ ] Botão "Enviar Código" é clicável
- [ ] Após clicar, transição para tela de OTP
- [ ] Timer de 5 minutos aparece e funciona
- [ ] Botão "Reenviar" está desabilitado durante timer
- [ ] InputOTP aceita 6 dígitos
- [ ] Validação de código funciona
- [ ] Redirecionamento após sucesso
- [ ] Mensagem de erro exibe corretamente

---

## 🐛 Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|--------|
| "Munas requisições" | Rate limit atingido | Aguardar 60 segundos |
| "Código inválido ou expirado" | Código errado ou expirado | Solicitar novo código |
| "Limite de tentativas atingido" | 3 tentativas com código errado | Fazer novo request-code |
| "Serviço de SMS indisponível" | Twilio down | Retry automático (3x) |
| "Telefone deve ter formato válido" | Telefone em formato errado | Usar +55 DDD número |
| CORS error | CORS não configurado | Verificar `ALLOWED_ORIGINS` em .env |

---

## 📱 Exemplo de Tela (Wireframe)

```
╔════════════════════════════════════╗
║        LOGIN - WIN Marketplace      ║
╠════════════════════════════════════╣
║  [Entrar] [Entrar via Telefone] ◄─ NOVA ABA
║           [Criar Conta]             ║
╠════════════════════════════════════╣
║                                    ║
║  📞 Número de Telefone              ║
║  ┌──────────────────────────────┐  ║
║  │ +55 11 98765-4321            │  ║
║  └──────────────────────────────┘  ║
║                                    ║
║  [📤 Enviar Código]                ║
║                                    ║
╚════════════════════════════════════╝

              ⬇️ CLICA EM ENVIAR

╔════════════════════════════════════╗
║        VALIDAR CÓDIGO OTP           ║
╠════════════════════════════════════╣
║                                    ║
║  ✅ Código enviado para:            ║
║  +55 11 98765-4323                 ║
║                                    ║
║  Código de Verificação:             ║
║  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐         ║
║  │1│ │2│ │3│ │4│ │5│ │6│         ║
║  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘         ║
║                                    ║
║  Expira em: 04:50 ⏱️                ║
║                                    ║
║  [🔄 Reenviar] (desabilitado)      ║
║                                    ║
╚════════════════════════════════════╝
```

---

## 🔐 Proteções de Segurança Implementadas

- ✅ Rate limiting: 3 SMS/min por IP+Telefone
- ✅ Bloqueio automático: 60s após limite
- ✅ TTL: Código expira em 5 minutos
- ✅ Limite de tentativas: 3 por código
- ✅ Token JWT: Autorização em requisições subsequentes

---

## 📞 Configuração Twilio para Produção

Quando listar de teste:

1. Acessar https://console.twilio.com/
2. Copiar:
   - **Account SID**: Começar com "AC"
   - **Auth Token**: Chave de autenticação
   - **Phone Number**: Número verificado (ex: +15551234567)
3. Atualizar `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxx...
   TWILIO_AUTH_TOKEN=your_token...
   TWILIO_FROM_NUMBER=+15551234567
   TWILIO_ENABLED=true
   ```
4. Redeploy backend

---

## 🎯 Resultado Final Esperado

✅ Usuário pode fazer login usando:
- **Apenas número de telefone**
- **Código OTP enviado por SMS**
- **Sem necessidade de senha**
- **Compatível com todo o sistema existente** (JWT, perfis, etc)

---

Documento criado: 6 de Abril de 2026
