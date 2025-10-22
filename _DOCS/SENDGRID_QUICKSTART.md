# 🚀 Início Rápido - SendGrid

## ⏱️ 10 Minutos para Configurar

### Passo 1: Criar Conta (3 min)
1. Acesse: https://signup.sendgrid.com/
2. Preencha seus dados
3. Verifique seu email
4. Faça login

### Passo 2: Criar API Key (2 min)
1. Menu lateral: **Settings** → **API Keys**
2. Clique: **Create API Key**
3. Nome: `WIN Marketplace`
4. Permissões: **Full Access**
5. **COPIE A CHAVE** (você não verá de novo!)
   ```
   SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ...
   ```

### Passo 3: Verificar Sender (2 min)
1. Menu: **Settings** → **Sender Authentication**
2. Clique: **Verify a Single Sender**
3. Preencha com seu email pessoal
4. Verifique o email que chegou
5. Clique no link de confirmação

### Passo 4: Configurar Projeto (3 min)

#### 4.1 Criar arquivo `.env` na raiz do projeto:
```bash
# win-grupo1/.env
SENDGRID_API_KEY=SG.sua-chave-completa-aqui
MAIL_FROM=seu-email-verificado@gmail.com
FRONTEND_URL=http://localhost:3000
```

#### 4.2 Reiniciar backend:
```bash
cd win-grupo1
docker-compose restart backend
```

### Passo 5: Testar! ✅

1. Acesse: http://localhost:3000/forgot-password
2. Digite: `agenoralencaar@gmail.com`
3. Clique em **Enviar Email de Recuperação**
4. Cheque seu email! 📧

---

## 📊 Verificar Dashboard

Acesse: https://app.sendgrid.com/

Veja quantos emails foram:
- ✅ Enviados (Delivered)
- 📖 Abertos (Opened)
- 🖱️ Clicados (Clicked)

---

## 🆘 Problemas?

### Email não chega?
1. Cheque pasta de **Spam**
2. Veja **Activity** no dashboard SendGrid
3. Verifique logs: `docker-compose logs backend`

### Erro: "From address does not match"?
- Você precisa verificar o email em **Sender Authentication**

### Erro: "Invalid API Key"?
- Copie a chave completa (começa com `SG.`)
- Não adicione espaços ou quebras de linha

---

## 📖 Documentação Completa

Para mais detalhes, consulte:
- `_DOCS/SENDGRID_SETUP.md` - Guia completo
- `_DOCS/EMAIL_SETUP.md` - Configuração Gmail (alternativa)

---

**Pronto!** Em 10 minutos você tem um sistema profissional de email! 🎉
