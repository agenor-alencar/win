# Guia: Configuração de Split de Pagamento - Pagar.me

## 📋 Visão Geral

Este guia explica como configurar o **split de pagamento** (divisão automática de valores) entre o marketplace e os lojistas no Pagar.me.

### 💰 Como Funciona o Split

Quando um cliente realiza uma compra:

1. **12%** do valor dos produtos + **100% do frete** → Conta do Marketplace
2. **88%** do valor dos produtos → Conta do Lojista que vendeu

**Exemplo:**
- Valor dos produtos: R$ 100,00
- Valor do frete: R$ 8,00
- **Total do pedido: R$ 108,00**

**Split automático:**
- Marketplace recebe: R$ 12,00 (comissão) + R$ 8,00 (frete) = **R$ 20,00**
- Lojista recebe: R$ 88,00 (produto) = **R$ 88,00**

---

## 🔧 Passo 1: Criar Recipients no Dashboard Pagar.me

### 1.1 Criar Recipient do Marketplace (Conta Principal)

1. Acesse: https://dash.pagar.me/recipients
2. Clique em **"Criar recebedor"**
3. Preencha os dados da sua empresa (WIN Marketplace):
   - **Nome**: WIN Marketplace
   - **Tipo**: Pessoa Jurídica (CNPJ)
   - **CNPJ**: [SEU_CNPJ]
   - **Email**: [SEU_EMAIL]
   - **Dados bancários**: Conta que receberá as comissões
4. Clique em **"Criar"**
5. **COPIE O ID DO RECIPIENT** (ex: `re_ck123abc456def789`)

### 1.2 Criar Recipients dos Lojistas

Para cada lojista que venderá na plataforma:

1. Vá em https://dash.pagar.me/recipients
2. Clique em **"Criar recebedor"**
3. Preencha com os dados do lojista:
   - **Nome**: [Nome fantasia do lojista]
   - **Tipo**: Pessoa Jurídica ou Física
   - **CPF/CNPJ**: [Documento do lojista]
   - **Email**: [Email do lojista]
   - **Dados bancários**: Conta do lojista
4. Clique em **"Criar"**
5. **COPIE O ID DO RECIPIENT** (ex: `re_ck987xyz654abc321`)

---

## 🗄️ Passo 2: Configurar IDs no Banco de Dados

### 2.1 Aplicar Migration

Execute a migration SQL no banco de dados:

```bash
# No servidor
ssh root@137.184.87.106

# Conectar ao PostgreSQL
docker exec -it win-marketplace-db psql -U winuser -d winmarketplace

# Executar migration
\i /docker-entrypoint-initdb.d/migrations/V7__add_pagarme_recipient_ids.sql

# Verificar se as colunas foram criadas
\d lojistas
\d configuracoes
```

### 2.2 Configurar Recipient ID do Marketplace

```sql
-- Atualizar configuração global com ID do marketplace
UPDATE configuracoes 
SET pagarme_recipient_id_marketplace = 're_ck123abc456def789'  -- SUBSTITUA pelo ID real
WHERE id = (SELECT id FROM configuracoes LIMIT 1);

-- Confirmar
SELECT pagarme_recipient_id_marketplace, taxa_comissao_win 
FROM configuracoes;
```

### 2.3 Configurar Recipients dos Lojistas

```sql
-- Atualizar cada lojista com seu recipient ID
UPDATE lojistas 
SET pagarme_recipient_id = 're_ck987xyz654abc321'  -- SUBSTITUA pelo ID do lojista
WHERE cnpj = '12345678000199';  -- Use CNPJ ou ID do lojista

-- Listar lojistas e seus recipients
SELECT 
    id, 
    nome_fantasia, 
    cnpj, 
    pagarme_recipient_id 
FROM lojistas 
ORDER BY nome_fantasia;
```

---

## ⚙️ Passo 3: Ajustar Percentual de Comissão (Opcional)

O padrão é **12%** de comissão. Para alterar:

```sql
-- Atualizar percentual de comissão
UPDATE configuracoes 
SET taxa_comissao_win = 15.00  -- Exemplo: 15%
WHERE id = (SELECT id FROM configuracoes LIMIT 1);

-- Ajustar automaticamente o repasse ao lojista
UPDATE configuracoes 
SET taxa_repasse_lojista = 100.00 - taxa_comissao_win
WHERE id = (SELECT id FROM configuracoes LIMIT 1);

-- Verificar
SELECT 
    taxa_comissao_win AS "Comissão Marketplace (%)",
    taxa_repasse_lojista AS "Repasse Lojista (%)"
FROM configuracoes;
```

---

## 🚢 Passo 4: Deploy das Alterações

### 4.1 Fazer commit e push

```bash
cd /c/Users/user/OneDrive/Documentos/win

git add .
git commit -m "feat: Implementar split de pagamento Pagar.me

- Adicionar campos pagarme_recipient_id em lojistas
- Adicionar campo pagarme_recipient_id_marketplace em configuracoes
- Modificar PagarMeService para incluir splits no pagamento PIX
- Marketplace recebe comissão + frete integral
- Lojista recebe valor dos produtos menos comissão"

git push origin main
```

### 4.2 Deploy no VPS

```bash
ssh root@137.184.87.106

cd /root/win

# Atualizar código
git pull origin main

# Rebuild backend (contém as alterações)
docker-compose build --no-cache backend

# Reiniciar backend
docker-compose up -d backend

# Verificar logs
docker logs -f win-marketplace-backend --tail 50
```

---

## 🧪 Passo 5: Testar o Split

### 5.1 Teste Manual

1. Acesse: https://winmarketplace.com.br
2. Faça login como cliente
3. Adicione produtos ao carrinho
4. Vá ao checkout e selecione **PIX**
5. Finalize o pedido
6. Copie o código PIX e simule o pagamento no **dashboard Pagar.me**

### 5.2 Verificar Split no Dashboard

1. Acesse: https://dash.pagar.me/transactions
2. Localize a transação do pedido
3. Clique na transação
4. Vá na aba **"Splits"**
5. **Verifique se os valores foram divididos corretamente:**
   - Marketplace: Comissão + Frete
   - Lojista: Valor dos produtos - Comissão

### 5.3 Verificar Logs

```bash
# Ver logs do backend durante criação do pagamento
ssh root@137.184.87.106
docker logs win-marketplace-backend --tail 100 | grep -i split

# Procure por linhas como:
# 💰 Split configurado - Marketplace: R$ 20.00 (12% + frete), Lojista: R$ 88.00
```

---

## 🔍 Troubleshooting

### ❌ Split não está sendo aplicado

**Sintoma:** Logs mostram "Split NÃO configurado - Recipients não informados"

**Solução:**
```sql
-- Verificar se os IDs estão configurados
SELECT pagarme_recipient_id_marketplace FROM configuracoes;
SELECT id, nome_fantasia, pagarme_recipient_id FROM lojistas;

-- Se estiverem NULL, configurar conforme Passo 2
```

### ❌ Erro: "Recipient not found"

**Causa:** ID do recipient está incorreto ou não existe no Pagar.me

**Solução:**
1. Acesse https://dash.pagar.me/recipients
2. Verifique o ID correto do recipient
3. Atualize no banco de dados

### ❌ Valores do split não conferem

**Causa:** Percentual de comissão incorreto

**Solução:**
```sql
-- Verificar configuração
SELECT 
    taxa_comissao_win,
    taxa_repasse_lojista,
    (taxa_comissao_win + taxa_repasse_lojista) AS "Soma (deve ser 100)"
FROM configuracoes;

-- Se soma != 100, corrigir
UPDATE configuracoes 
SET taxa_repasse_lojista = 100.00 - taxa_comissao_win;
```

---

## 📊 Monitoramento

### Verificar Splits de Todos os Pedidos

```sql
SELECT 
    p.numero_pedido,
    p.total,
    p.valor_frete,
    (p.total - p.valor_frete) AS valor_produtos,
    ROUND((p.total - p.valor_frete) * c.taxa_comissao_win / 100, 2) AS comissao_marketplace,
    p.valor_frete + ROUND((p.total - p.valor_frete) * c.taxa_comissao_win / 100, 2) AS total_marketplace,
    ROUND((p.total - p.valor_frete) * c.taxa_repasse_lojista / 100, 2) AS total_lojista,
    pag.status AS status_pagamento
FROM pedidos p
JOIN pagamentos pag ON pag.pedido_id = p.id
CROSS JOIN configuracoes c
WHERE pag.metodo_pagamento = 'PIX_PAGARME'
ORDER BY p.criado_em DESC
LIMIT 20;
```

---

## 📝 Checklist Final

- [ ] Recipients criados no dashboard Pagar.me (marketplace + lojistas)
- [ ] IDs dos recipients copiados e salvos
- [ ] Migration V7 aplicada no banco de dados
- [ ] Recipient ID do marketplace configurado na tabela `configuracoes`
- [ ] Recipients dos lojistas configurados na tabela `lojistas`
- [ ] Percentual de comissão ajustado (se necessário)
- [ ] Código commitado e enviado ao repositório
- [ ] Backend deployado no VPS
- [ ] Teste de pagamento PIX realizado
- [ ] Split verificado no dashboard Pagar.me
- [ ] Valores conferidos e corretos

---

## 📚 Referências

- **Documentação Pagar.me Split:** https://docs.pagar.me/reference/criar-split
- **Dashboard Pagar.me:** https://dash.pagar.me
- **Recipients API:** https://docs.pagar.me/reference/criar-recipient

---

## 💡 Dicas

1. **Comissão Variável:** Você pode ter comissões diferentes por lojista criando um campo `percentual_comissao` na tabela `lojistas`

2. **Automatizar Cadastro:** Crie uma tela de admin para cadastrar recipients automaticamente quando novos lojistas se registrarem

3. **Taxas de Processamento:** No split, configure `"charge_processing_fee": true` para o marketplace pagar as taxas do Pagar.me

4. **Repasse D+X:** Configure o prazo de repasse aos lojistas no campo `dias_repasse` da tabela `configuracoes`

---

✅ **Implementação concluída!** Agora seu marketplace divide automaticamente os pagamentos entre você e os lojistas.
