# Teste Simples de Entrega - Versao Debug

Write-Host "Teste Simples de Entrega - Debug Mode" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Headers
$headers = @{
    "Content-Type" = "application/json"
}

# 1. Test Backend
Write-Host "[1] Verificando Backend..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -ErrorAction Stop
    Write-Host "[OK] Backend esta rodando" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Backend nao esta respondendo" -ForegroundColor Red
    exit 1
}

# 2. Test Simulacao
Write-Host ""
Write-Host "[2] Testando Endpoint de Simular Frete..." -ForegroundColor Yellow

$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000"
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro, 3000"
    pesoTotalKg = 5.0
} | ConvertTo-Json

try {
    $simulacao = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "[OK] Simulacao obtida:" -ForegroundColor Green
    Write-Host "     Quote ID: $($simulacao.quoteId)"
    Write-Host "     Valor: $($simulacao.valorFrete)"
    
    $quoteId = $simulacao.quoteId
} catch {
    Write-Host "[ERRO] Falha ao simular:" -ForegroundColor Red
    Write-Host "       Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "       Mensagem: $($_.Exception.Message)"
    
    # Tentar ler o corpo da resposta de erro
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "       Body: $($errorResponse | ConvertTo-Json)"
    } catch {
        Write-Host "       Body: $($_.ErrorDetails.Message)"
    }
    exit 1
}

# 3. Test Criar Entrega
Write-Host ""
Write-Host "[3] Testando Endpoint de Criar Entrega..." -ForegroundColor Yellow

$entregaBodyObj = @{
    quoteId = $quoteId
    emailLojista = "lojista@test.com"
    emailCliente = "cliente@test.com"
    instrucoesRetirada = "Toque a campainha"
    instrucoesEntrega = "Deixar com porteiro"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
}

$entregaBody = $entregaBodyObj | ConvertTo-Json
$pedidoId = "550e8400-e29b-41d4-a716-446655440001"

Write-Host "     Body enviado:"
$entregaBody | ForEach-Object { Write-Host "       $_" }

try {
    $entrega = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$pedidoId/solicitar" `
        -Method Post `
        -Headers $headers `
        -Body $entregaBody `
        -ErrorAction Stop
    
    Write-Host "[OK] Entrega criada:" -ForegroundColor Green
    Write-Host "     ID: $($entrega.id)"
    Write-Host "     Status: $($entrega.status)"
    
    $entregaId = $entrega.id
    
} catch {
    Write-Host "[ERRO] Falha ao criar entrega:" -ForegroundColor Red
    Write-Host "       Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "       Mensagem: $($_.Exception.Message)"
    
    # Tentar ler o corpo da resposta de erro
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "       Response Body:"
        $errorResponse | ConvertTo-Json | ForEach-Object { Write-Host "         $_" }
    } catch {
        Write-Host "       Response Body: $($_.ErrorDetails.Message)"
    }
    
    # Mesmo assim, tentar consultar status para ver se foi criado
    Write-Host ""
    Write-Host "[4] Tentando consultar status mesmo com erro..." -ForegroundColor Yellow
    
    try {
        $status = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/entregas/$pedidoId/status" `
            -Method Get `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "[OK] Status consultado:" -ForegroundColor Green
        Write-Host "     $($status | ConvertTo-Json)"
    } catch {
        Write-Host "[ERRO] Nao conseguiu consultar status" -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "[5] Teste Completo!" -ForegroundColor Green
Write-Host ""
