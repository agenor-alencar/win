# Teste de Simulacao de Frete com API Uber Real (Sandbox)

Write-Host "Teste de Simulacao de Frete - Uber Sandbox" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Headers
$headers = @{
    "Content-Type" = "application/json"
}

# Request body
$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000 - Loja Teste"
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro Faria Lima, 3000 - Apto 505"
    pesoTotalKg = 5.0
    valorTotalPedido = 150.00
} | ConvertTo-Json

Write-Host "[*] Enviando requisicao para simular frete..."
Write-Host ""

try {
    $simulacao = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop

    Write-Host "[OK] Resposta recebida!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quote ID: $($simulacao.quoteId)" -ForegroundColor Cyan
    Write-Host "Valor Frete: R$ $($simulacao.valorFrete)" -ForegroundColor Yellow
    Write-Host "Distancia: $($simulacao.distanciaKm) km" -ForegroundColor White
    Write-Host "Tempo Estimado: $($simulacao.tempoEstimado) min" -ForegroundColor White
    Write-Host ""
    
    # Verificar se é Quote real ou MOCK
    if ($simulacao.quoteId -match "quo_") {
        Write-Host "[SUCESSO] Quote ID eh REAL da Uber API!" -ForegroundColor Green
        Write-Host "    Status: Modo REAL (nao MOCK)" -ForegroundColor Green
    } elseif ($simulacao.quoteId -match "MOCK") {
        Write-Host "[AVISO] Ainda em modo MOCK" -ForegroundColor Yellow
        Write-Host "    Verificar se UBER_API_ENABLED esta como true" -ForegroundColor Yellow
    } else {
        Write-Host "[INFO] Quote ID: $($simulacao.quoteId)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Resposta completa:" -ForegroundColor White
    $simulacao | ConvertTo-Json -Depth 5 | ForEach-Object { Write-Host "  $_" }

} catch {
    Write-Host "[ERRO] Falha na requisicao" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status HTTP: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
