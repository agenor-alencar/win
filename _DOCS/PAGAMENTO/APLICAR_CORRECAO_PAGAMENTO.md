# Correção do Pagamento PIX - Pagar.me

## ❗ Problema Identificado

O código na VPS estava com mapeamento JPA incorreto:
- **Código antigo**: `@Column(name = "metodo_pagamento")` ❌
- **Banco de dados**: coluna `metodo` ✅
- **Resultado**: Hibernate tentava inserir em coluna inexistente, deixando `metodo` null

## ✅ Solução Aplicada

1. ✅ Corrigido mapeamento JPA para `@Column(name = "metodo")`
2. ✅ Adicionada migration para colunas faltantes (parcelas, informacoes_cartao, observacoes)
3. ✅ Commit e push realizados

## 🚀 Deploy na VPS

Execute os comandos abaixo **na VPS**:

### 1. Conectar na VPS
```bash
ssh root@137.184.87.106
```

### 2. Aplicar Migration no Banco
```bash
# Navegar para o diretório do projeto
cd ~/win

# Fazer pull das alterações
git pull origin main

# Aplicar migration no banco
docker compose exec postgres psql -U winuser -d winmarketplace -f /docker-entrypoint-initdb.d/migrations/011_fix_pagamentos_schema.sql

# OU, se o comando acima não funcionar:
cat database/migrations/011_fix_pagamentos_schema.sql | docker compose exec -T postgres psql -U winuser -d winmarketplace
```

### 3. Rebuild e Restart do Backend
```bash
# Rebuild do backend com novo código
docker compose build backend

# Restart do backend
docker compose restart backend

# Verificar logs
docker compose logs -f backend
```

### 4. Verificar se Backend Iniciou Corretamente
```bash
# Ver últimas 50 linhas dos logs
docker compose logs --tail=50 backend

# Espere ver:
# ✅ "Started WinMarketplaceApplication in X seconds"
# ✅ Nenhum erro de inicialização
```

## 🧪 Testar Pagamento PIX

Após o deploy, teste o fluxo completo:

1. Acesse o site: https://winmarketplace.com.br
2. Adicione produtos ao carrinho
3. Vá para o checkout
4. Selecione **PIX** como forma de pagamento
5. Selecione **Pagar.me** como gateway
6. Finalize o pedido

**Resultado esperado:**
- ✅ QR Code PIX deve ser exibido
- ✅ Registro de pagamento salvo no banco com `metodo = 'PIX_PAGARME'`
- ✅ Nenhum erro de constraint violation

## 🔍 Verificar no Banco

```bash
# Conectar no banco
docker compose exec postgres psql -U winuser -d winmarketplace

# Verificar últimos pagamentos
SELECT id, metodo, status, valor, transacao_id, criado_em 
FROM pagamentos 
ORDER BY criado_em DESC 
LIMIT 5;

# Verificar estrutura da tabela
\d pagamentos
```

**Você deve ver:**
- Coluna `metodo` (VARCHAR 50) NOT NULL ✅
- Colunas `parcelas`, `informacoes_cartao`, `observacoes` ✅

## 📊 Alterações Realizadas

### Arquivo: `Pagamento.java`
```java
// ANTES (errado)
@Column(name = "metodo_pagamento", length = 50, nullable = false)
private String metodoPagamento;

// DEPOIS (correto)
@Column(name = "metodo", length = 50, nullable = false)
private String metodoPagamento;
```

### Migration: `011_fix_pagamentos_schema.sql`
```sql
-- Adiciona colunas faltantes
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS parcelas INTEGER;
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS informacoes_cartao VARCHAR(100);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS observacoes VARCHAR(200);
```

## ❓ Se Houver Problemas

### Erro: "coluna metodo_pagamento não existe"
- Verifique se o git pull foi executado corretamente
- Rebuild do backend é obrigatório

### Erro: Backend não inicia
```bash
# Ver logs completos
docker compose logs backend

# Se necessário, rebuild completo
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### Erro: Migration não aplicada
```bash
# Verificar se arquivo existe no container
docker compose exec postgres ls -la /docker-entrypoint-initdb.d/migrations/

# Aplicar manualmente
docker compose exec postgres psql -U winuser -d winmarketplace <<EOF
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS parcelas INTEGER;
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS informacoes_cartao VARCHAR(100);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS observacoes VARCHAR(200);
EOF
```

---

**Status**: Pronto para deploy ✅  
**Commit**: 7430739  
**Branch**: main
