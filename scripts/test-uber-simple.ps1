#!/usr/bin/env pwsh

Write-Host "=========================================" -ForegroundColor Green
Write-Host "TEST: Simple Uber Quote Test" -ForegroundColor Green  
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$url = "http://localhost:8080/api/uber/quote/test"
$body = '{"numCep":"04543130","numCepDestino":"04543131","tipoVeiculo":"UBER_MOTO"}'

Write-Host "Sending request to: $url" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "HTTP Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host ""
    
    $data = $response.Content | ConvertFrom-Json
    
    $quoteId = $data.quoteId
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    
    if ($quoteId -match "^MOCK-") {
        Write-Host "[MOCK MODE] Still using MOCK responses" -ForegroundColor Yellow
    } elseif ($quoteId -match "^quo_") {
        Write-Host "[REAL MODE] Real Uber API enabled!" -ForegroundColor Green
    } else {
        Write-Host "[UNKNOWN] Quote ID format: $quoteId" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Vehicle Type: $($data.tipoVeiculo)" 
    Write-Host "Total Freight: R$" $($data.valorFreteTotal)
    Write-Host "Success: $($data.sucesso)"
    Write-Host "Error: $($data.erro)"
    Write-Host ""
    
    Write-Host "=== FULL RESPONSE ===" -ForegroundColor Cyan
    $data | ConvertTo-Json -Depth 3 | Write-Host
    
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try checking backend logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs backend --tail 30" -ForegroundColor Gray
}
