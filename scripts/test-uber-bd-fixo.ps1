# Test Uber com DB fixo

Write-Host "========================================="
Write-Host "TEST: Uber Frete com BD Configuracoes Fixo"
Write-Host "=========================================`n"

$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
    enderecoOrigemCompleto = "Avenida Paulista 1000, Sao Paulo, SP"
    enderecoDestinoCompleto = "Rua Maria Prestes 500, Sao Paulo, SP"
    pesoTotalKg = 5.0
    nomeLojista = "Loja Teste"
    telefoneLojista = "1133334444"
    nomeCliente = "Cliente Teste"
    telefoneCliente = "1122223333"
    origemLatitude = -23.5615
    origemLongitude = -46.6560
    destinoLatitude = -23.5725
    destinoLongitude = -46.6440
} | ConvertTo-Json

Write-Host "Enviando request..."
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
    
    Write-Host "[OK] Sucesso! Resposta:" -ForegroundColor Green
    Write-Host ""
    
    if ($response.mockado -eq $false -or $response.quoteId -like "quo_*") {
        Write-Host "[REAL] RESULTADO REAL (Uber API):" -ForegroundColor Green
        Write-Host "  Quote ID: $($response.quoteId)" -Fore Green
        Write-Host "  Provider: $($response.provider)" -Fore Green
        Write-Host "  Valor: R$ $($response.valorFreteTotal)" -Fore Green
        Write-Host "  Tempo: $($response.tempoEstimadoMinutos) min" -Fore Green
    } else {
        Write-Host "[MOCK] Resultado em MOCK" -ForegroundColor Yellow
        Write-Host "  Quote ID: $($response.quoteId)" 
        Write-Host "  Motivo: DB ainda retornando MOCK" 
    }
    
    Write-Host ""
    Write-Host "Response Completo:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "[ERRO]" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
