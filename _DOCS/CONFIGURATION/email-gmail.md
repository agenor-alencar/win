# 📧 Configuração de Email - Win Marketplace

Este documento explica como configurar o envio de emails para o recurso de "Esqueci minha senha".

## 🔧 Configuração Rápida (Gmail)

### Passo 1: Configurar Gmail

1. **Ative a verificação em 2 etapas:**
   - Acesse: https://myaccount.google.com/security
   - Clique em "Verificação em duas etapas"
   - Siga as instruções para ativar

2. **Gere uma senha de app:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App: Mail" e "Dispositivo: Outro (nome personalizado)"
   - Digite: "Win Marketplace"
   - Clique em "Gerar"
   - **COPIE A SENHA GERADA** (16 caracteres sem espaços)

### Passo 2: Configurar Docker Compose

Edite o arquivo `docker-compose.yml` e adicione as variáveis de ambiente no serviço `backend`:

```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: win-marketplace-backend
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/win_marketplace
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres123
      - SPRING_PROFILES_ACTIVE=docker
      - MAIL_HOST=smtp.gmail.com
      - MAIL_PORT=587
      - MAIL_USERNAME=seu-email@gmail.com      # ⬅️ SUBSTITUA
      - MAIL_PASSWORD=sua-senha-de-app-aqui   # ⬅️ SUBSTITUA
      - FRONTEND_URL=http://localhost:3000
```

### Passo 3: Reiniciar Backend

```bash
docker-compose down
docker-compose up -d --build backend
```

## 🧪 Testando

1. Acesse: `http://localhost:3000/forgot-password`
2. Digite seu email
3. Clique em "Enviar Email de Recuperação"
4. Verifique sua caixa de entrada

## ⚠️ Problemas Comuns

### Email não é enviado

**Erro**: `Failed to authenticate using USERNAME and PASSWORD`

**Solução**: 
- Certifique-se de usar a **senha de app**, não sua senha normal do Gmail
- Verifique se a verificação em 2 etapas está ativada

### Email vai para spam

**Solução**:
- Marque o email como "Não é spam"
- Adicione `noreply@winmarketplace.com` aos contatos

### Token expirado

**Solução**:
- O token é válido por apenas **1 hora**
- Solicite um novo reset de senha

## 📝 Outros Provedores de Email

### Outlook/Hotmail

```yaml
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@outlook.com
MAIL_PASSWORD=sua-senha
```

### SendGrid (Recomendado para produção)

```yaml
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=sua-api-key-do-sendgrid
```

## 🎨 Personalização

Para personalizar o template do email, edite o método `enviarEmailResetSenha` em:
```
backend/src/main/java/com/win/marketplace/service/EmailService.java
```

## 🔒 Segurança

- ✅ Tokens expiram em 1 hora
- ✅ Tokens são invalidados após uso
- ✅ Senhas são criptografadas com BCrypt
- ✅ Limpeza automática de tokens antigos a cada 6 horas

## 📚 Endpoints da API

### Solicitar Reset
```http
POST /api/v1/password-reset/request
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### Validar Token
```http
GET /api/v1/password-reset/validate/{token}
```

### Confirmar Reset
```http
POST /api/v1/password-reset/confirm
Content-Type: application/json

{
  "token": "token-uuid-aqui",
  "novaSenha": "NovaSenha123"
}
```

## 🆘 Suporte

Se tiver problemas, verifique os logs do backend:

```bash
docker logs win-marketplace-backend
```

Procure por mensagens contendo:
- `Email de reset de senha enviado`
- `Erro ao enviar email`
