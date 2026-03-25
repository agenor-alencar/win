# Teste de Simulacao com Coordenadas GPS Validas (Uber Sandbox)

Write-Host "Teste de Simulacao com Coordenadas GPS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{ "Content-Type" = "application/json" }

# Coordenadas reais de Sao Paulo
# Origem: Av. Paulista (Shopping Pátio)
# Destino: Av. Brigadeiro Faria Lima (próximo ao Pátio Higienópolis)

$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    
    # Origem - Av. Paulista, Sao Paulo
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000"
    origemLatitude = -23.5615  # Latitude Av. Paulista
    origemLongitude = -46.6560  # Longitude Av. Paulista
    
    # Destino - Av. Brigadeiro Faria Lima  
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro Faria Lima, 3000"
    destinoLatitude = -23.5725  # Latitude Av. Brigadeiro
    destinoLongitude = -46.6440  # Longitude Av. Brigadeiro
    
    # Outros dados
    pesoTotalKg = 5.0
    valorTotalPedido = 150.00
    nomeLojista = "Loja Teste SP"
    nomeCliente = "Cliente Teste"
} | ConvertTo-Json

Write-Host "[*] Enviando requisicao com coordenadas GPS..." -ForegroundColor Yellow
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
    
    $quoteId = $simulacao.quoteId
    
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    Write-Host "Tipo Veiculo: $($simulacao.tipoVeiculo)" -ForegroundColor White
    Write-Host "Valor Corrida Uber: R$ $($simulacao.valorCorridaUber)" -ForegroundColor Yellow
    Write-Host "Taxa WIN Market: R$ $($simulacao.taxaWinmarket)" -ForegroundColor Yellow
    Write-Host "Valor Total Frete: R$ $($simulacao.valorFreteTotal)" -ForegroundColor Green
    Write-Host "Tempo Estimado: $($simulacao.tempoEstimadoMinutos) min" -ForegroundColor White
    Write-Host "Distancia: $($simulacao.distanciaKm) km" -ForegroundColor White
    Write-Host ""
    
    # Verificar modo
    if ($quoteId -match "quo_") {
        Write-Host "[SUCESSO!] Quote ID eh REAL de Uber Sandbox!" -ForegroundColor Green
        Write-Host "           Modo: API UBER EM FUNCIONAMENTO" -ForegroundColor Green
    } elseif ($quoteId -match "MOCK") {
        Write-Host "[AVISO] Ainda em modo MOCK - fallback da API" -ForegroundColor Yellow
        Write-Host "        Motivo: $($simulacao.erro)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Dados completos da resposta:" -ForegroundColor Gray
    $simulacao | ConvertTo-Json | ForEach-Object { Write-Host "  $_" }
    
} catch {
    Write-Host "[ERRO] Falha na requisicao" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
