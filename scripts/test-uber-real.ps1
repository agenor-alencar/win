#!/usr/bin/env pwsh

$Uri = "http://localhost:8080/api/v1/uber/quotes/test"
$Body = @{
    external_id = "TEST-" + [guid]::NewGuid().ToString().Substring(0, 8)
    pickup_location = @{
        latitude = -23.5505
        longitude = -46.6333
    }
    dropoff_location = @{
        latitude = -23.5505
        longitude = -46.6333
    }
} | ConvertTo-Json -Depth 3

Write-Host "Testando: POST $Uri" -ForegroundColor Cyan
Write-Host ""

try {
    $Response = Invoke-WebRequest `
        -Uri $Uri `
        -Method POST `
        -Body $Body `
        -ContentType "application/json" `
        -TimeoutSec 20

    $Data = $Response.Content | ConvertFrom-Json
    
    Write-Host "✅ SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quote ID: $($Data.quote_id)" -ForegroundColor Cyan
    Write-Host "Modo: $($Data.modo)" -ForegroundColor Yellow
    Write-Host "Valor: R$ $($Data.valor)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($Data.modo -eq "REAL") {
        Write-Host "🎉 MODO REAL ATIVADO!" -ForegroundColor Green
        Write-Host "Usando respostas REAIS da Uber API" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MODO MOCK" -ForegroundColor Yellow
        Write-Host "Ainda usando respostas falsas" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERRO!" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
}
