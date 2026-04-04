# 🚀 Guia Prático - Teste Completo de Fluxo de Entrega

Este guia fornece passos práticos para testar o fluxo completo de entrega do WIN Marketplace.

## ⚡ Quick Start (5 minutos)

### Passo 1: Verificar Backend
```powershell
curl http://localhost:8080/actuator/health
# Deve retornar: {"status":"UP"}
```

### Passo 2: Testar Simulação de Frete
```powershell
$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
    pesoTotalKg = 5.0
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Resultado Esperado:**
```json
{
  "quoteId": "MOCK-QUOTE-xxx",
  "distanciaKm": 18.88,
  "valorFrete": 25.50,
  "tempoEstimado": 45
}
```

---

## 📝 Teste Completo (15 minutos)

### Pré-requisitos

1. **Backend rodando** (verifique com health check)
2. **PostgreSQL acessível** via Docker
3. **PowerShell 7.0+**

### Fase 1: Popular Banco com Dados de Teste

**Opção A: Via Docker + SQL**

```bash
# 1. Conectar ao container PostgreSQL
docker exec -it win-marketplace-db bash

# 2. Rodar SQL
psql -U postgres marketplace_db << 'EOF'

-- 1. Criar usuário de teste
INSERT INTO usuarios (
    id, email, senha, nome, telefone, 
    criado_em, atualizado_em, ativo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'usuario@teste.com',
    '$2a$10$...',  -- hash bcrypt de "senha123"
    'Usuario Teste',
    '11999999999',
    NOW(), NOW(), true
) ON CONFLICT DO NOTHING;

-- 2. Criar lojista de teste
INSERT INTO lojistas (
    id, usuario_id, nome_loja, nome_fantasia, cnpj, 
    email, telefone, tipo_negocio,
    criado_em, atualizado_em, ativo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Loja Teste LTDA',
    'Loja Teste',
    '12.345.678/0001-90',
    'loja@teste.com',
    '11988888888',
    'ALIMENTACAO',
    NOW(), NOW(), true
) ON CONFLICT DO NOTHING;

-- 3. Criar endereço de origem (lojista)
INSERT INTO enderecos (
    id, usuario_id, logradouro, numero, complemento,
    bairro, cidade, estado, cep, tipo_endereco,
    criado_em, atualizado_em, ativo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Av. Paulista',
    '1000',
    'Sala 101',
    'Bela Vista',
    'Sao Paulo',
    'SP',
    '01310-100',
    'COMERCIAL',
    NOW(), NOW(), true
) ON CONFLICT DO NOTHING;

-- 4. Criar categoria de produto
INSERT INTO categorias (
    id, nome, descricao, imagem_url,
    criado_em, atualizado_em, ativo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'Alimentos',
    'Alimentos em geral',
    'https://...',
    NOW(), NOW(), true
) ON CONFLICT DO NOTHING;

-- 5. Criar produto de teste
INSERT INTO produtos (
    id, lojista_id, nome, descricao, preco,
    categoria_id, estoque,
    criado_em, atualizado_em, ativo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    'Produto Teste',
    'Produto para teste de fluxo',
    99.90,
    '550e8400-e29b-41d4-a716-446655440003',
    100,
    NOW(), NOW(), true
) ON CONFLICT DO NOTHING;

-- 6. Criar pedido de teste
INSERT INTO pedidos (
    id, usuario_id, lojista_id, endereco_entrega_id,
    valor_total, status, data_pedido,
    criado_em, atualizado_em
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    99.90,
    'CONFIRMADO',
    NOW(),
    NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- 7. Criar item do pedido
INSERT INTO itens_pedido (
    id, pedido_id, produto_id, quantidade, preco_unitario,
    criado_em, atualizado_em
) VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440004',
    1,
    99.90,
    NOW(), NOW()
) ON CONFLICT DO NOTHING;

EOF

exit
```

**Opção B: Via SQL direto no PowerShell**

```powershell
$sqlScript = @"
-- SQL aqui (copie do Opção A)
"@

$sqlScript | docker exec -i win-marketplace-db psql -U postgres marketplace_db
```

---

### Fase 2: Gerar JWT Token de Teste

**Opção A: Chamar Endpoint de Login**

```powershell
$loginBody = @{
    email = "usuario@teste.com"
    senha = "senha123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/auth/login" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$jwtToken = $login.token
Write-Host "JWT Token: $jwtToken" -ForegroundColor Green
```

---

### Fase 3: Executar Testes com Dados Reais

**1. Simular Frete**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $jwtToken"
}

$simulacao = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{
        lojistaId = "550e8400-e29b-41d4-a716-446655440000"
        cepOrigem = "01310-100"
        enderecoOrigemCompleto = "Av. Paulista, 1000"
        cepDestino = "04567-000"
        enderecoDestinoCompleto = "Av. Brigadeiro, 3000"
        pesoTotalKg = 5.0
    } | ConvertTo-Json)

Write-Host "Quote ID: $($simulacao.quoteId)" -ForegroundColor Green
$quoteId = $simulacao.quoteId
```

**2. Solicitar Entrega**
```powershell
$entrega = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/entregas/550e8400-e29b-41d4-a716-446655440005/solicitar" `
    -Method Post `
    -Headers $headers `
    -Body (@{
        quoteId = $quoteId
        emailLojista = "loja@teste.com"
        emailCliente = "cliente@teste.com"
        instrucoesRetirada = "Toque a campainha"
        instrucoesEntrega = "Deixar com porteiro"
        cepOrigem = "01310-100"
        cepDestino = "04567-000"
    } | ConvertTo-Json)

Write-Host "Entrega ID: $($entrega.id)" -ForegroundColor Green
Write-Host "Status: $($entrega.status)" -ForegroundColor Green
```

**3. Consultar Status**
```powershell
$status = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/entregas/$($entrega.id)/status" `
    -Method Get `
    -Headers $headers

Write-Host "Status Atual: $($status.status)" -ForegroundColor Green
Write-Host "Motorista: $($status.courier.name)" -ForegroundColor Green
```

---

## 🔐 Validar PIN_VALIDACOES

```powershell
# Consultar PIN para entrega
$pin = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/pin-validacoes/entrega/$($entrega.id)" `
    -Method Get `
    -Headers $headers

Write-Host "PIN Status: $($pin.status)" -ForegroundColor Green
Write-Host "Tentativas: $($pin.numeroTentativas)" -ForegroundColor Green
Write-Host "Expira em: $($pin.expiraEm)" -ForegroundColor Green

# Validar PIN
$validacao = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/pin-validacoes/$($pin.id)/validar" `
    -Method Post `
    -Headers $headers `
    -Body (@{
        pin = "123456"  # Substituir pelo PIN real
        usuario = "motorista"
    } | ConvertTo-Json)

Write-Host "Validacao: $($validacao.sucesso)" -ForegroundColor Green
```

---

## 📊 Monitorar Logs

```bash
# Terminal 1: Logs do Backend
docker logs -f win-marketplace-backend

# Terminal 2: Logs do Banco
docker logs -f win-marketplace-db

# Terminal 3: Executar testes
# (copie os comandos PowerShell acima)
```

---

## ✅ Checklist de Sucesso

- [ ] Backend respondendo em http://localhost:8080
- [ ] Dados de teste inseridos no PostgreSQL
- [ ] JWT Token gerado com sucesso
- [ ] Simulação de frete retorna Quote ID
- [ ] Entrega criada com sucesso
- [ ] Status consultado (motorista atribuído)
- [ ] PIN_VALIDACOES estrutura validada
- [ ] PIN validado com sucesso

---

## 🐛 Troubleshooting

### "Entrega não encontrada"
→ Verificar se pedido foi criado no banco
→ Verificar ID do pedido

### "401 Unauthorized"
→ Gerar novo JWT Token
→ Verificar se token não expirou

### "500 Internal Server Error"
→ Verificar logs do backend: `docker logs win-marketplace-backend`
→ Verificar se banco tem dados de teste

### "403 Forbidden"
→ Endpoint requer autenticação
→ Adicionar header: `Authorization: Bearer {token}`

---

## 📚 Documentação Relacionada

- `RELATORIO_TESTES_ENTREGA_COMPLETO.md` - Análise técnica completa
- `EntregaController.java` - Endpoints de entrega
- `EntregaService.java` - Lógica de negócio
- `SecurityConfig.java` - Configuração de segurança

---

**Criado:** 24/02/2030  
**Última Atualização:** 24/02/2030
