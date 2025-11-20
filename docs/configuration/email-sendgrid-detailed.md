# 📧 Configuração do SendGrid - WIN Marketplace

## Por que SendGrid?

✅ **12.000 emails GRÁTIS por mês** (vs Gmail: 500/dia)  
✅ **Profissional** - usado por Netflix, Uber, Airbnb  
✅ **Sem bloqueios** - não confunde com spam como Gmail  
✅ **Estatísticas** - veja quantos emails foram abertos  
✅ **Escalável** - funciona para 10 ou 10.000 usuários  

---

## 🚀 PASSO 1: Criar Conta (5 minutos)

### 1.1 Acessar SendGrid
👉 https://signup.sendgrid.com/

### 1.2 Preencher cadastro
```
Nome: Seu Nome
Email: seu-email@gmail.com
Senha: (escolha uma senha forte)
Empresa: WIN Marketplace (ou seu nome)
Site: localhost (pode deixar em branco)
```

### 1.3 Verificar email
- Cheque sua caixa de entrada
- Clique no link de verificação
- Faça login no SendGrid

### 1.4 Pular wizards (importante!)
- Eles vão tentar vender planos pagos
- Clique em **"Skip"** ou **"Maybe Later"**
- O plano FREE é suficiente!

---

## 🔑 PASSO 2: Criar API Key (2 minutos)

### 2.1 Acessar Settings
1. No menu lateral esquerdo: **Settings** → **API Keys**
2. Clique em **"Create API Key"** (botão azul)

### 2.2 Configurar a API Key
```
API Key Name: WIN Marketplace Production
Permissions: Full Access (ou Mail Send apenas)
```

### 2.3 **COPIAR A CHAVE** ⚠️
```
SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789...
```

⚠️ **ATENÇÃO**: Copie AGORA e guarde em local seguro!  
⚠️ **Você NÃO vai conseguir ver de novo depois!**

---

## 📝 PASSO 3: Verificar Sender Identity (3 minutos)

SendGrid precisa saber de qual email você vai enviar.

### 3.1 Acessar Sender Authentication
- Menu lateral: **Settings** → **Sender Authentication**
- Clique em **"Verify a Single Sender"**

### 3.2 Preencher formulário
```
From Name: WIN Marketplace
From Email: seu-email@gmail.com  ← O mesmo da conta
Reply To: seu-email@gmail.com
Company Address: Seu endereço
City: Sua cidade
State: Seu estado
Zip Code: Seu CEP
Country: Brazil
```

### 3.3 Verificar email
- Você receberá um email do SendGrid
- Clique em **"Verify Single Sender"**
- Pronto! ✅

---

## 🎯 PASSO 4: Configurar o Sistema

### 4.1 Copie sua API Key
Você deve ter algo assim:
```
SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789abcdefghijklmnopqrstuvwxyz
```

### 4.2 Abra o arquivo `docker-compose.yml`

### 4.3 Substitua as linhas do email:
```yaml
# ❌ ANTES (Gmail):
MAIL_HOST: ${MAIL_HOST:-smtp.gmail.com}
MAIL_PORT: ${MAIL_PORT:-587}
MAIL_USERNAME: ${MAIL_USERNAME:-}
MAIL_PASSWORD: ${MAIL_PASSWORD:-}

# ✅ DEPOIS (SendGrid):
MAIL_HOST: smtp.sendgrid.net
MAIL_PORT: 587
MAIL_USERNAME: apikey
MAIL_PASSWORD: ${SENDGRID_API_KEY:-}
MAIL_FROM: seu-email@gmail.com  ← O email verificado
```

### 4.4 Criar arquivo `.env` na raiz do projeto

Crie o arquivo: `win-grupo1/.env`

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.sua-chave-aqui-colada-completa

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Adicione `.env` no `.gitignore` para não subir no GitHub!

---

## 🔄 PASSO 5: Reiniciar Backend

```bash
# Parar e reiniciar o backend
docker-compose restart backend

# Ou rebuild completo (se tiver problemas)
docker-compose up -d --build backend
```

---

## ✅ PASSO 6: Testar!

### 6.1 Acessar página de reset
```
http://localhost:3000/forgot-password
```

### 6.2 Digitar um email cadastrado
```
agenoralencaar@gmail.com
```

### 6.3 Verificar resultado
- ✅ Mensagem de sucesso no frontend
- ✅ Email chega em segundos (cheque spam!)
- ✅ Email tem visual profissional

### 6.4 Ver estatísticas no SendGrid
- Dashboard SendGrid → **Activity** → **Email Activity**
- Você verá: Delivered, Opened, Clicked

---

## 🎨 Customização (Opcional)

### Alterar nome do remetente no email

Edite: `backend/src/main/resources/application.yml`

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          from: WIN Marketplace <noreply@winmarketplace.com>
```

Ou no EmailService.java, altere:
```java
helper.setFrom("noreply@winmarketplace.com", "WIN Marketplace");
```

---

## 📊 Limites do Plano FREE

| Recurso | Limite |
|---------|--------|
| **Emails/mês** | 12.000 (400/dia) |
| **Validade** | Para sempre! |
| **API Keys** | Ilimitadas |
| **Estatísticas** | 7 dias |
| **Suporte** | Comunidade |

💡 **Dica**: 12.000 emails/mês = 400 resets de senha por dia!

---

## 🔒 Segurança

### ✅ Boas Práticas:

1. **Nunca commite a API Key** no Git
2. **Use variáveis de ambiente** sempre
3. **Rotacione a chave** a cada 90 dias
4. **Use .env para desenvolvimento** local
5. **Use Secrets** em produção (Azure/AWS)

### Adicionar ao `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.production

# API Keys
sendgrid.key
```

---

## 🚨 Troubleshooting

### Erro: "The from address does not match a verified Sender Identity"
**Solução**: Verifique o email em Settings → Sender Authentication

### Erro: "Invalid API Key"
**Solução**: Copie a chave completa (começa com `SG.`)

### Email não chega
1. Cheque pasta de spam
2. Veja Activity no dashboard SendGrid
3. Verifique logs do backend: `docker-compose logs backend`

### Limite excedido
**Solução**: Upgrade para plano pago ($19.95/mês = 50k emails)

---

## 📞 Suporte SendGrid

- **Documentação**: https://docs.sendgrid.com/
- **Status**: https://status.sendgrid.com/
- **Comunidade**: https://support.sendgrid.com/

---

## 🎯 Próximos Passos

Depois de configurar SendGrid:

1. ✅ Testar reset de senha completo
2. ✅ Adicionar logo do WIN no template de email
3. ✅ Configurar domínio próprio (futuro)
4. ✅ Implementar outros tipos de email:
   - Boas-vindas ao cadastro
   - Confirmação de pedido
   - Notificação de aprovação de lojista

---

## 💰 Planos Pagos (Futuro)

Quando crescer:

| Plano | Preço/mês | Emails/mês |
|-------|-----------|------------|
| **Free** | $0 | 12.000 |
| **Essentials** | $19.95 | 50.000 |
| **Pro** | $89.95 | 1.500.000 |

Mas comece com FREE! 🎉

---

**Criado em**: 19/10/2025  
**Sistema**: WIN Marketplace  
**Versão**: 1.0
