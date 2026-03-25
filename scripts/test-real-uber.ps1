#!/usr/bin/env pwsh

Write-Host "=========================================" -ForegroundColor Green
Write-Host "TEST: Verificando UBER_API_ENABLED (REAL vs MOCK)" -ForegroundColor Green  
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$url = "http://localhost:8080/api/uber/quote/test"
$body = @{
    numCep = "04543130"
    numCepDestino = "04543131"
    tipoVeiculo = "UBER_MOTO"
} | ConvertTo-Json

Write-Host "Enviando request para: $url" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "[OK] Sucesso! Resposta:" -ForegroundColor Green
    Write-Host ""
    
    $quoteId = $data.quoteId
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    
    if ($quoteId -match "^MOCK-") {
        Write-Host "[!] AINDA EM MODO MOCK" -ForegroundColor Yellow
        Write-Host "    Motivo: UBER_API_ENABLED não foi ativado corretamente" -ForegroundColor Yellow
    } elseif ($quoteId -match "^quo_") {
        Write-Host "[✓] MODO REAL ATIVADO!" -ForegroundColor Green
        Write-Host "    Sucesso! Usando respostas REAIS da Uber API" -ForegroundColor Green
    } else {
        Write-Host "[?] Quote ID incomum: $quoteId" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Tipo de Veículo: $($data.tipoVeiculo)" 
    Write-Host "Valor Frete Total: R$ $($data.valorFreteTotal)"
    Write-Host "Sucesso: $($data.sucesso)"
    Write-Host ""
    
    Write-Host "=== RESPOSTA COMPLETA ===" -ForegroundColor Cyan
    $data | ConvertTo-Json -Depth 3 | Write-Host
    
} catch {
    Write-Host "[ERROR] Erro ao fazer requisição: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifique se:" -ForegroundColor Yellow
    Write-Host " 1. Docker está rodando: docker ps" -ForegroundColor Yellow
    Write-Host " 2. Backend iniciou: docker logs win-marketplace-backend | tail -20" -ForegroundColor Yellow
    Write-Host " 3. Porta 8080 está aberta" -ForegroundColor Yellow
}
