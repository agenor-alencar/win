# Guia de Teste - Sistema de Cadastro Bancário

## 🧪 Teste Rápido no VPS

### Pré-requisitos

1. Backend rodando
2. Frontend rodando  
3. Pagar.me configurado no `.env`
4. Usuário lojista criado

### Passo 1: Acessar Configurações

```bash
# URL
https://winmarketplace.com.br/merchant/settings

# Navegar até: Aba "Conta Bancária"
```

### Passo 2: Preencher Formulário

**Dados de Teste (use dados reais do lojista):**

```
Banco: Itaú (341)
Tipo de Conta: Conta Corrente
Agência: 5244
Dígito da Agência: (deixar vazio se não tiver)
Número da Conta: 61891
Dígito da Conta: 1
Tipo de Titular: Pessoa Física
Nome do Titular: AGENOR ALENCAR DE CARVALHO
CPF do Titular: 050.580.571-10
```

### Passo 3: Salvar e Verificar

**Clique em "Adicionar Conta"**

Você deve ver:
- ✅ Notificação de sucesso
- ✅ "Recipient criado automaticamente no Pagar.me"
- ✅ Dados bancários mascarados exibidos

### Passo 4: Verificar no Backend

```bash
# SSH no VPS
ssh root@seu-vps

# Verificar logs
cd ~/win
docker-compose logs backend | grep -i recipient

# Deve mostrar:
# ✅ Recipient criado automaticamente - ID: rp_xxxxx para lojista: uuid-xxx
```

### Passo 5: Verificar no Banco de Dados

```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U winuser -d windb

# Verificar dados bancários salvos
SELECT 
  db.id,
  l.nome_fantasia,
  db.titular_nome,
  db.codigo_banco,
  db.validado,
  l.pagarme_recipient_id
FROM dados_bancarios_lojista db
JOIN lojistas l ON l.id = db.lojista_id;

# Sair
\q
```

**Resultado esperado:**
```
validado | TRUE
pagarme_recipient_id | rp_xxxxxxxxxx
```

### Passo 6: Testar Split de Pagamento

1. **Criar um pedido como cliente:**
   - Adicione produtos do lojista
   - Finalize com PIX

2. **Verificar nos logs se o split foi aplicado:**
```bash
docker-compose logs backend | grep -i split

# Deve mostrar:
# 💰 Split configurado - Marketplace: R$ 27.0 (12.0% + frete), Lojista: R$ 88.0
```

3. **Verificar no dashboard do Pagar.me:**
   - Acesse https://dashboard.pagar.me
   - Vá em "Transações"
   - Busque pela transação
   - Verifique se aparece "Split" com 2 recipients

### Passo 7: Recriar Recipient (Se Necessário)

Se houve erro na primeira tentativa:

```bash
# Endpoint
POST /api/v1/lojistas/{lojistaId}/dados-bancarios/recriar-recipient

# Ou pela interface (se implementado)
# Botão "Recriar Recipient"
```

## 🐛 Resolução de Problemas

### Erro: "Gateway Pagar.me não está habilitado"

**Solução:**
```bash
# Verificar .env
cat .env | grep PAGARME

# Deve ter:
PAGARME_ENABLED=true
PAGARME_API_KEY=sk_live_xxxxx
```

### Erro: "Dados bancários inválidos"

**Soluções:**
1. Verificar se o código do banco tem 3 dígitos (ex: 341, não 0341)
2. Verificar se o CPF tem 11 dígitos (sem pontos e traços)
3. Verificar se titular_tipo é "individual" ou "company"

### Erro: Recipient não é criado

**Verificar:**
```bash
# Logs detalhados
docker-compose logs backend | grep -A 10 "Criando recipient"

# API do Pagar.me
# Verifique se as credenciais estão corretas
curl -X GET https://api.pagar.me/core/v5/recipients \
  -u "sk_live_xxxxx:"
```

### Split não aparece no pagamento

**Verificar:**
```sql
-- Recipient do marketplace configurado?
SELECT pagarme_recipient_id_marketplace FROM configuracoes;

-- Recipient do lojista preenchido?
SELECT nome_fantasia, pagarme_recipient_id 
FROM lojistas 
WHERE id = 'uuid-do-lojista';
```

## ✅ Checklist de Teste

- [ ] Backend rodando sem erros
- [ ] Frontend carregando página de configurações
- [ ] Formulário de cadastro bancário visível
- [ ] Cadastro de dados bancários funciona
- [ ] Notificação de sucesso aparece
- [ ] Dados mascarados exibidos corretamente
- [ ] Logs mostram "Recipient criado"
- [ ] Banco de dados tem validado=true
- [ ] pagarmeRecipientId preenchido no lojista
- [ ] Pedido de teste com PIX funciona
- [ ] Logs mostram split configurado
- [ ] Dashboard Pagar.me mostra split

## 📊 Exemplo de Teste Completo

### Cenário: Pedido de R$ 115,00

```javascript
// Dados do pedido
{
  "produtos": [
    { "nome": "Produto A", "valor": 50.00 },
    { "nome": "Produto B", "valor": 50.00 }
  ],
  "subtotal": 100.00,
  "frete": 15.00,
  "total": 115.00
}

// Split esperado (12% comissão)
{
  "marketplace": {
    "comissao": 12.00,  // 12% de R$ 100
    "frete": 15.00,     // 100% do frete
    "total": 27.00
  },
  "lojista": {
    "produtos": 88.00,  // R$ 100 - R$ 12
    "total": 88.00
  }
}

// Verificação
console.log(27.00 + 88.00 === 115.00); // true ✅
```

### Verificar no Backend:

```bash
# Deve aparecer no log:
💰 Split configurado - Marketplace: R$ 27.0 (12.0% + frete), Lojista: R$ 88.0
```

### Verificar no Pagar.me:

Dashboard → Transação → Split:
```
Recipient 1 (Marketplace): R$ 27,00
Recipient 2 (Lojista): R$ 88,00
Total: R$ 115,00 ✅
```

## 🎯 Próximos Testes

Depois de validar o básico, teste:

1. **Múltiplos lojistas:** Pedido com produtos de lojistas diferentes
2. **Valores variados:** Testar com diferentes valores e comissões
3. **Atualização:** Atualizar dados bancários existentes
4. **Recriação:** Forçar erro e recriar recipient
5. **Webhook:** Verificar se webhook atualiza status do pagamento

## 📞 Suporte

Em caso de dúvidas:
- Documentação: `_DOCS/SISTEMA_CADASTRO_BANCARIO_AUTOMATICO.md`
- Logs: `docker-compose logs -f backend`
- Dashboard Pagar.me: https://dashboard.pagar.me

---

**Versão:** 1.0  
**Data:** 03/03/2026  
**Status:** Pronto para teste
