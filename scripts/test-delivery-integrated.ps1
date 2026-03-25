# Teste Integrado de Fluxo de Entrega 
# Segue fluxo: Simulacao -> Criar Pedido -> Solicitar Entrega -> Status

Write-Host "Teste Integrado de Fluxo de Entrega" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{ "Content-Type" = "application/json" }

# [1] Verificar Backend
Write-Host "[1] Verificando Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -ErrorAction Stop
    Write-Host "[OK] Backend rodando: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Backend nao respondeu" -ForegroundColor Red
    exit 1
}

# [2] Simular Frete e obter Quote
Write-Host ""
Write-Host "[2] Simulando Frete..." -ForegroundColor Yellow

$lojistaId = "550e8400-e29b-41d4-a716-446655440000"
$simulacaoBody = @{
    lojistaId = $lojistaId
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000 - Loja Teste"
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro Faria Lima, 3000 - Apto 505"
    pesoTotalKg = 5.0
    valorTotalPedido = 150.00
} | ConvertTo-Json

try {
    $simulacao = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers $headers `
        -Body $simulacaoBody `
        -ErrorAction Stop
    
    Write-Host "[OK] Simulacao obtida" -ForegroundColor Green
    Write-Host "     Quote ID: $($simulacao.quoteId)"
    Write-Host "     Distancia: $($simulacao.distanciaKm) km"
    
    $quoteId = $simulacao.quoteId
} catch {
    Write-Host "[ERRO] Falha ao simular frete: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# [3] Verificar pedidos existentes
Write-Host ""
Write-Host "[3] Verificando Pedidos Existentes no Banco..." -ForegroundColor Yellow

try {
    # Este endpoint pode retornar lista de pedidos
    $pedidos = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/pedidos" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "[OK] Pedidos encontrados: $($pedidos.Length)" -ForegroundColor Green
    
    if ($pedidos.Length -gt 0) {
        Write-Host "     Primeiro pedido: $($pedidos[0].id)" -ForegroundColor Cyan
        $pedidoExistente = $pedidos[0].id
    } else {
        Write-Host "     Nenhum pedido encontrado" -ForegroundColor Yellow
        $pedidoExistente = $null
    }
} catch {
    Write-Host "[AVISO] Nao conseguiu listar pedidos: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "        Vamos criar um pedido de teste..." -ForegroundColor Yellow
    $pedidoExistente = $null
}

# [4] Solicitar Entrega (usando QUote ID)
Write-Host ""
Write-Host "[4] Testando Solicitacao de Entrega..." -ForegroundColor Yellow

# Criar diferentes pedido IDs para testar
$pedidoIdTest = [guid]::NewGuid().ToString()
Write-Host "     Usando Pedido ID: $pedidoIdTest" -ForegroundColor Cyan

$entregaBody = @{
    quoteId = $quoteId
    emailLojista = "lojista@winteste.com"
    emailCliente = "cliente@winteste.com"
    instrucoesRetirada = "Toque a campainha"
    instrucoesEntrega = "Deixar com porteiro"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
} | ConvertTo-Json

try {
    $entrega = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$pedidoIdTest/solicitar" `
        -Method Post `
        -Headers $headers `
        -Body $entregaBody `
        -ErrorAction Stop
    
    Write-Host "[OK] Entrega solicitada" -ForegroundColor Green
    Write-Host "     Entrega ID: $($entrega.id)"
    Write-Host "     Status: $($entrega.status)"
    
    $entregaId = $entrega.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "[ERRO] Falha ao solicitar entrega (HTTP $statusCode)" -ForegroundColor Red
    Write-Host "       Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    # Tentar obter mais detalhes
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "       Response Body: $errorBody" -ForegroundColor DarkRed
        } catch { }
    }
    
    # Não sair; tentar status mesmo assim
    $entregaId = $null
}

# [5] Consultar Status (se conseguiu criar)
if ($entregaId) {
    Write-Host ""
    Write-Host "[5] Consultando Status da Entrega..." -ForegroundColor Yellow
    
    try {
        $status = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/entregas/$entregaId/status" `
            -Method Get `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "[OK] Status obtido" -ForegroundColor Green
        Write-Host "     Delivery ID: $($status.deliveryId)"
        Write-Host "     Status: $($status.status)"
    } catch {
        Write-Host "[ERRO] Falha ao consultar status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Teste Concluido" -ForegroundColor Green
Write-Host ""
