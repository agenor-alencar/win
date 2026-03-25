# Script de Teste de Fluxo de Entrega - WIN Marketplace
# Testa: Simulacao -> Criacao -> Status -> PIN Validacoes

Write-Host "WIN Marketplace - Teste Fluxo de Entrega" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Backend
Write-Host "[1/4] Verificando se backend esta ativo..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -ErrorAction Stop
    Write-Host "[OK] Backend esta ativo: $($healthCheck.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Backend nao esta rodando!" -ForegroundColor Red
    exit 1
}

# 2. Headers
$headers = @{
    "Content-Type" = "application/json"
}

# 3. Teste 1: Simular Frete (Quote)
Write-Host ""
Write-Host "[2/4] Teste 1: Simular Frete..." -ForegroundColor Yellow

$lojistaId = [guid]::NewGuid().ToString()
$simulacaoBody = @{
    lojistaId = $lojistaId
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000 - Apto 101"
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro Faria Lima, 3000 - Apto 505"
    pesoTotalKg = 5.0
    valorTotalPedido = 150.00
    nomeLojista = "Loja Teste"
    telefoneLojista = "+5511999999999"
    nomeCliente = "Cliente Teste"
    telefoneCliente = "+5511988888888"
    pedidoId = [guid]::NewGuid().ToString()
} | ConvertTo-Json

Write-Host "  [*] Enviando requisicao de cotacao..."

try {
    $simulacao = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers $headers `
        -Body $simulacaoBody `
        -ErrorAction Stop
    
    Write-Host "  [OK] Cotacao obtida com sucesso!" -ForegroundColor Green
    Write-Host "       - Quote ID: $($simulacao.quoteId)"
    Write-Host "       - Valor: R$ $($simulacao.valorFrete)"
    Write-Host "       - Tempo estimado: $($simulacao.tempoEstimado) min"
    Write-Host "       - Distancia: $($simulacao.distanciaKm) km"
    
    $quoteId = $simulacao.quoteId
    
} catch {
    Write-Host "  [ERRO] Falha ao simular frete" -ForegroundColor Red
    Write-Host "         $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Teste 2: Criar Entrega
Write-Host ""
Write-Host "[3/4] Teste 2: Criar Entrega..." -ForegroundColor Yellow

$pedidoId = [guid]::NewGuid().ToString()
$entregaBody = @{
    quoteId = $quoteId
    emailLojista = "lojista@winteste.com"
    emailCliente = "cliente@winteste.com"
    instrucoesRetirada = "Tocar campainha no portao"
    instrucoesEntrega = "Deixar com porteiro se ausente"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
} | ConvertTo-Json

Write-Host "  [*] Criando entrega com pedido ID: $pedidoId..."

try {
    $entrega = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$pedidoId/solicitar" `
        -Method Post `
        -Headers $headers `
        -Body $entregaBody `
        -ErrorAction Stop
    
    Write-Host "  [OK] Entrega criada com sucesso!" -ForegroundColor Green
    Write-Host "       - Delivery ID: $($entrega.idCorridaUber)"
    Write-Host "       - Status: $($entrega.status)"
    Write-Host "       - Valor: R$ $($entrega.valorFrete)"
    Write-Host "       - Codigo Retirada: $($entrega.codigoRetirada)"
    Write-Host "       - Codigo Entrega: $($entrega.codigoEntrega)"
    
    $entregaId = $entrega.id
    
} catch {
    Write-Host "  [ERRO] Falha ao criar entrega" -ForegroundColor Red
    Write-Host "         $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Teste 3: Consultar Status
Write-Host ""
Write-Host "[4/4] Teste 3: Consultar Status..." -ForegroundColor Yellow

Write-Host "  [*] Aguardando 5 segundos antes de consultar..."
Start-Sleep -Seconds 5

try {
    $status = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$entregaId/status" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "  [OK] Status obtido com sucesso!" -ForegroundColor Green
    Write-Host "       - Delivery ID: $($status.deliveryId)"
    Write-Host "       - Status: $($status.status)"
    Write-Host "       - URL Rastreamento: $($status.trackingUrl)"
    
    if ($status.courier) {
        Write-Host "       - Motorista: $($status.courier.name)"
        Write-Host "       - Telefone: $($status.courier.phoneNumber)"
    } else {
        Write-Host "       - Motorista: Aguardando atribuicao..."
    }
    
} catch {
    Write-Host "  [ERRO] Falha ao consultar status" -ForegroundColor Red
    Write-Host "         $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "TESTES CONCLUIDOS COM SUCESSO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo:"
Write-Host "  [OK] Backend esta operacional"
Write-Host "  [OK] Simulacao de frete funcionando"
Write-Host "  [OK] Criacao de entrega funcionando"
Write-Host "  [OK] Consulta de status funcionando"
Write-Host ""
Write-Host "Proximo passo: Validar PIN em entregas.pi_validacoes"
Write-Host ""
