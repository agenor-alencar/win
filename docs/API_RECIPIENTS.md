# API de Recipients - Guia Rápido

## 🎯 Como vincular recipients aos lojistas via API REST (Mais fácil!)

Agora você **NÃO precisa mais usar SQL**! Use as APIs REST abaixo.

---

## 📡 Endpoints Disponíveis

### Base URL
```
https://winmarketplace.com.br/api/v1/admin/recipients
```

---

## 1️⃣ Listar Lojistas e seus Recipients

**GET** `/lojistas`

```bash
curl -X GET "https://winmarketplace.com.br/api/v1/admin/recipients/lojistas" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

**Resposta:**
```json
[
  {
    "id": "uuid-do-lojista",
    "nomeFantasia": "Loja do João",
    "cnpj": "12345678000199",
    "email": "joao@loja.com",
    "recipientId": null,
    "temRecipient": false,
    "ativo": true
  }
]
```

---

## 2️⃣ Criar Recipient no Pagar.me

**POST** `/criar`

```bash
curl -X POST "https://winmarketplace.com.br/api/v1/admin/recipients/criar" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Loja do João LTDA",
    "documento": "12345678000199",
    "email": "joao@loja.com",
    "tipo": "company",
    "dadosBancarios": {
      "bank_code": "341",
      "agencia": "0001",
      "agencia_dv": "0",
      "conta": "12345",
      "conta_dv": "6",
      "type": "conta_corrente",
      "holder_name": "Loja do João LTDA",
      "holder_document": "12345678000199"
    }
  }'
```

**Resposta:**
```json
{
  "id": "re_ck123abc456def789",
  "status": "active",
  "name": "Loja do João LTDA"
}
```

**⚠️ COPIE O ID RETORNADO (`re_ck123abc456def789`)**

---

## 3️⃣ Vincular Recipient ao Lojista

**POST** `/vincular`

```bash
curl -X POST "https://winmarketplace.com.br/api/v1/admin/recipients/vincular" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "lojistaId": "uuid-do-lojista",
    "recipientId": "re_ck123abc456def789"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Recipient vinculado com sucesso",
  "lojista": "Loja do João",
  "recipientId": "re_ck123abc456def789"
}
```

---

## 4️⃣ Buscar Dados de um Recipient

**GET** `/{recipientId}`

```bash
curl -X GET "https://winmarketplace.com.br/api/v1/admin/recipients/re_ck123abc456def789" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

---

## 5️⃣ Remover Vínculo de Recipient

**DELETE** `/lojista/{lojistaId}`

```bash
curl -X DELETE "https://winmarketplace.com.br/api/v1/admin/recipients/lojista/uuid-do-lojista" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

---

## 🔑 Como Pegar o Token de Admin

### Opção 1: Login via API

```bash
curl -X POST "https://winmarketplace.com.br/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@winmarketplace.com",
    "senha": "sua_senha"
  }'
```

**Copie o `token` da resposta**

### Opção 2: Usar Postman/Insomnia

1. Crie uma requisição POST para `/api/v1/auth/login`
2. Body (JSON):
   ```json
   {
     "email": "admin@winmarketplace.com",
     "senha": "sua_senha"
   }
   ```
3. Copie o token retornado

---

## 📋 Fluxo Completo para Novo Lojista

### 1. Lojista se cadastra no sistema ✅ (já funciona)

### 2. Admin vincula recipient:

```bash
# 2.1 - Listar lojistas para pegar o ID
curl -X GET "https://winmarketplace.com.br/api/v1/admin/recipients/lojistas" \
  -H "Authorization: Bearer SEU_TOKEN"

# 2.2 - Criar recipient no Pagar.me
curl -X POST "https://winmarketplace.com.br/api/v1/admin/recipients/criar" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nome do Lojista",
    "documento": "CNPJ_SEM_PONTOS",
    "email": "email@lojista.com",
    "tipo": "company",
    "dadosBancarios": {
      "bank_code": "341",
      "agencia": "0001",
      "agencia_dv": "0",
      "conta": "12345",
      "conta_dv": "6",
      "type": "conta_corrente",
      "holder_name": "Nome Completo",
      "holder_document": "CNPJ"
    }
  }'

# 2.3 - Vincular recipient ao lojista (usar o ID retornado acima)
curl -X POST "https://winmarketplace.com.br/api/v1/admin/recipients/vincular" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lojistaId": "UUID_DO_LOJISTA",
    "recipientId": "re_ID_RETORNADO"
  }'
```

### 3. Pronto! ✅
Agora os pagamentos desse lojista serão automaticamente divididos!

---

## 🏦 Códigos Bancários Comuns

| Banco | Código |
|-------|--------|
| Itaú | 341 |
| Bradesco | 237 |
| Banco do Brasil | 001 |
| Santander | 033 |
| Caixa Econômica | 104 |
| Nubank | 260 |
| Inter | 077 |
| C6 Bank | 336 |
| Banco Original | 212 |

---

## ⚠️ Importante

- Todos os endpoints requerem **role ADMIN**
- O token tem validade, faça login novamente se expirar
- Documentos devem ser apenas números (sem pontos, traços)
- Após vincular, teste fazendo uma compra com PIX!

---

## 🧪 Testar Split

Depois de vincular:

1. Faça uma compra no site como cliente
2. Finalize com PIX
3. Simule o pagamento no dashboard Pagar.me
4. Vá em **Transactions** → Clique na transação → Aba **Splits**
5. Verifique se os valores foram divididos corretamente

---

✅ **Muito mais fácil que SQL!**
