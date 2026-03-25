#!/usr/bin/env pwsh

Write-Host "=========================================" -ForegroundColor Green
Write-Host "TEST: Checking UBER_API_ENABLED (REAL vs MOCK)" -ForegroundColor Green  
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$url = "http://localhost:8080/api/uber/quote/test"
$body = @{
    numCep = "04543130"
    numCepDestino = "04543131"
    tipoVeiculo = "UBER_MOTO"
} | ConvertTo-Json

Write-Host "Sending request to: $url" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "[OK] Success! Response:" -ForegroundColor Green
    Write-Host ""
    
    $quoteId = $data.quoteId
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    
    if ($quoteId -match "^MOCK-") {
        Write-Host "[MOCK MODE] Still using MOCK responses" -ForegroundColor Yellow
        Write-Host "    Reason: UBER_API_ENABLED not working correctly" -ForegroundColor Yellow
    } elseif ($quoteId -match "^quo_") {
        Write-Host "[REAL MODE] Real Uber API enabled!" -ForegroundColor Green
        Write-Host "    Success! Using REAL Uber API responses" -ForegroundColor Green
    } else {
        Write-Host "[UNKNOWN] Quote ID format: $quoteId" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Vehicle Type: $($data.tipoVeiculo)" 
    Write-Host "Total Freight: R$" $($data.valorFreteTotal)
    Write-Host "Success: $($data.sucesso)"
    Write-Host ""
    
    Write-Host "=== FULL RESPONSE ===" -ForegroundColor Cyan
    $data | ConvertTo-Json -Depth 3 | Write-Host
    
} catch {
    Write-Host "[ERROR] Request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check if:" -ForegroundColor Yellow
    Write-Host " 1. Docker is running: docker ps" -ForegroundColor Yellow
    Write-Host " 2. Backend started: docker logs win-marketplace-backend | tail -20" -ForegroundColor Yellow
    Write-Host " 3. Port 8080 is open" -ForegroundColor Yellow
}
