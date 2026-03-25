#!/usr/bin/env pwsh

Write-Host "Testing Uber API..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest `
        -Uri http://localhost:8080/api/uber/quote/test `
        -Method POST `
        -Body '{"numCep":"04543130","numCepDestino":"04543131","tipoVeiculo":"UBER_MOTO"}' `
        -ContentType application/json `
        -TimeoutSec 10
    
    $data = $response.Content | ConvertFrom-Json
    
    $quoteId = $data.quoteId
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    
    if ($quoteId -match "^MOCK-") {
        Write-Host "[MOCK MODE] Still using MOCK" -ForegroundColor Yellow
    } elseif ($quoteId -match "^quo_") {
        Write-Host "[REAL MODE] Success!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host ($data | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
