# Guia de Configuração e Teste - Pagar.me (Stone)

## ✅ Alterações Implementadas

### Frontend (Checkout.tsx)
- ✅ Adicionado campo "Nome Completo" ao formulário PIX
- ✅ Atualizado endpoint para `/v1/pagamentos/pagarme/pix/{pedidoId}`
- ✅ Enviando `nome`, `cpf` e `email` para o backend
- ✅ Logs atualizados para "Pagar.me" (Stone)

### Backend
- ✅ Endpoint `/api/v1/pagamentos/pagarme/pix/{pedidoId}` já implementado
- ✅ Integração com API Pagar.me v5 (PIX)
- ✅ Retorna: `qr_code`, `qr_code_url`, `status`, `expires_at`

### Docker Compose
- ✅ Adicionadas variáveis de ambiente do Pagar.me

---

## 📋 Pré-requisitos

### 1. Criar Conta no Pagar.me

1. Acesse: https://dashboard.pagar.me/signup
2. Complete o cadastro
3. Verifique seu email

### 2. Obter Chaves de API (Ambiente de Teste)

1. Acesse o Dashboard: https://dashboard.pagar.me/
2. Vá em **Configurações** → **Chaves de API** → **Teste**
3. Copie:
   - **Secret Key** (sk_test_...)
   - **Public Key** (pk_test_...)

---

## ⚙️ Configuração Local

### 1. Criar arquivo `.env` na raiz do projeto

```bash
# Na raiz do projeto (C:\Users\user\OneDrive\Documentos\win\)
New-Item -Path .env -ItemType File -Force
```

### 2. Adicionar credenciais no `.env`

```env
# Pagar.me (Stone) - Ambiente de Teste
PAGARME_API_KEY=sk_test_SEU_SECRET_KEY_AQUI
PAGARME_PUBLIC_KEY=pk_test_SEU_PUBLIC_KEY_AQUI
PAGARME_ENABLED=true
PAGARME_ENVIRONMENT=test
```

### 3. Rebuild do Backend

```powershell
# Parar containers
docker compose down

# Rebuild com novas variáveis
docker compose up -d --build backend

# Verificar logs
docker compose logs -f backend
```

**Esperado nos logs:**
```
Pagar.me está HABILITADO (environment: test)
```

---

## 🧪 Testando Localmente

### 1. Acessar Checkout
```
http://localhost:3000/checkout
```

### 2. Fluxo de Teste

1. **Adicionar produto ao carrinho**
2. **Ir para checkout**
3. **Preencher endereço:**
   - CEP: `72006200` (Brasília)
   - Número: `1`
4. **Selecionar "PIX" como forma de pagamento**
5. **Preencher dados do pagador:**
   - **Nome Completo**: `João da Silva`
   - **CPF**: `123.456.789-00` (CPF de teste)
   - **Email**: `seu-email@example.com`
6. **Clicar em "Finalizar Pedido"**

### 3. Resultado Esperado

✅ **Backend cria pedido com sucesso**
```
✅ Pedido criado: {id: "uuid-do-pedido"}
```

✅ **Backend chama Pagar.me API**
```
💳 Criando cobrança PIX Pagar.me - Pedido: uuid, Valor: R$ XX.XX
✅ Cobrança PIX criada - ID: order_xxxxxxxxxxxxx
```

✅ **Frontend recebe resposta**
```json
{
  "success": true,
  "message": "Pagamento PIX Pagar.me criado com sucesso!",
  "billing": {
    "id": "order_xxxxx",
    "qr_code": "00020126580014...",
    "qr_code_url": "https://api.pagar.me/...",
    "status": "pending",
    "expires_at": "2026-02-14T21:00:00Z"
  }
}
```

### 4. Verificar no Console do Navegador (F12)

```
💳 Iniciando pagamento PIX via Pagar.me para pedido: uuid
👤 Nome: João da Silva
📧 Email: seu-email@example.com
✅ Resposta do backend Pagar.me: {success: true, ...}
```

---

## ❌ Possíveis Erros e Soluções

### Erro: "PAGARME_NAO_CONFIGURADO"

**Causa:** `PAGARME_ENABLED=false` ou credenciais não configuradas

**Solução:**
```powershell
# Verificar se .env está correto
Get-Content .env | Select-String "PAGARME"

# Rebuild forçando reload das variáveis
docker compose down
docker compose up -d --build backend
```

### Erro: "Gateway Pagar.me não está habilitado"

**Causa:** Variável `PAGARME_ENABLED` não está `true`

**Solução:**
```env
# No .env
PAGARME_ENABLED=true
```

### Erro 401 - Unauthorized na API Pagar.me

**Causa:** Secret Key incorreta

**Solução:**
1. Verifique se copiou a **Secret Key** completa (sk_test_...)
2. Confirme que está usando as chaves de **Teste** (não produção)
3. Verifique no Dashboard se a chave está ativa

### Erro: "Falha ao processar pagamento PIX"

**Logs do backend:**
```powershell
docker compose logs backend | Select-String "ERRO\|ERROR"
```

**Causas comuns:**
- Timeout na API Pagar.me
- Dados do cliente inválidos (CPF em formato errado)
- Problema de rede no VPS

---

## 🚀 Deploy na VPS

### 1. Fazer commit das alterações

```powershell
# Na máquina local
cd C:\Users\user\OneDrive\Documentos\win

git add .
git commit -m "feat: integrar pagamentos Pagar.me (Stone) com PIX"
git push origin main
```

### 2. Conectar na VPS

```bash
ssh root@137.184.87.106
cd ~/win
```

### 3. Atualizar código

```bash
git pull origin main
```

### 4. Configurar variáveis de ambiente na VPS

```bash
# Criar/editar .env na VPS
nano .env
```

**Adicionar:**
```env
PAGARME_API_KEY=sk_test_SUA_CHAVE_AQUI
PAGARME_PUBLIC_KEY=pk_test_SUA_CHAVE_AQUI
PAGARME_ENABLED=true
PAGARME_ENVIRONMENT=test
```

**Salvar:** `Ctrl+X` → `Y` → `Enter`

### 5. Rebuild na VPS

```bash
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### 6. Verificar logs

```bash
docker compose logs -f backend | grep -i pagarme
```

**Esperado:**
```
Pagar.me está HABILITADO (environment: test)
```

---

## 📊 Testando em Produção (VPS)

1. **Acessar:** https://winmarketplace.com.br/checkout
2. **Seguir mesmo fluxo de teste local**
3. **Verificar logs na VPS:**
```bash
docker compose logs -f backend
```

---

## 🔒 Produção (Quando Estiver Pronto)

### Obter Chaves de Produção

1. No Dashboard Pagar.me: **Chaves de API** → **Produção**
2. Copiar Secret Key (sk_live_...)
3. Copiar Public Key (pk_live_...)

### Atualizar .env na VPS

```env
PAGARME_API_KEY=sk_live_SUA_CHAVE_DE_PRODUCAO
PAGARME_PUBLIC_KEY=pk_live_SUA_CHAVE_DE_PRODUCAO
PAGARME_ENABLED=true
PAGARME_ENVIRONMENT=production
```

⚠️ **IMPORTANTE:**
- Chaves de produção processam pagamentos REAIS
- Test first com valores pequenos
- Configure Webhooks para receber notificações de pagamento

---

## 🎯 Próximos Passos

### 1. Componente de Exibição do PIX

Atualmente o código redireciona para `checkoutUrl` externa. Você pode:

**Opção A:** Exibir QR Code diretamente no site
- Usar `billing.qr_code` para gerar QR Code
- Mostrar código copia-cola
- Polling para verificar status do pagamento

**Opção B:** Manter redirecionamento
- Usuário é redirecionado para página do Pagar.me
- Pagar.me exibe QR Code
- Após pagamento, redireciona de volta

### 2. Webhooks (Notificações de Pagamento)

Configure no Dashboard Pagar.me:
- URL: `https://winmarketplace.com.br/api/v1/pagamentos/webhooks/pagarme`
- Eventos: `order.paid`, `order.canceled`

Endpoint já implementado no backend!

### 3. Consulta de Status

Endpoint já implementado:
```
GET /api/v1/pagamentos/pagarme/ordem/{orderId}
```

---

## 📞 Suporte Pagar.me

- **Documentação:** https://docs.pagar.me/
- **Support:** https://pagar.me/contato/
- **Dashboard:** https://dashboard.pagar.me/

---

## ✅ Checklist de Validação

- [ ] Conta Pagar.me criada
- [ ] Chaves de teste obtidas
- [ ] `.env` configurado localmente
- [ ] Backend rebuild com sucesso
- [ ] Teste local funcionando
- [ ] Pedido criado no banco
- [ ] Resposta da API Pagar.me recebida
- [ ] QR Code gerado
- [ ] Commit feito
- [ ] Deploy na VPS realizado
- [ ] Teste na VPS funcionando

---

**Autor:** Win Marketplace Team
**Última atualização:** 14/02/2026
