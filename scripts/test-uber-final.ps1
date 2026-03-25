#!/usr/bin/env pwsh

Write-Host "Testando Uber API..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8080/api/uber/quote/test" `
        -Method POST `
        -Body '{"numCep":"04543130","numCepDestino":"04543131","tipoVeiculo":"UBER_MOTO"}' `
        -ContentType "application/json" `
        -TimeoutSec 15

    $data = $response.Content | ConvertFrom-Json
    $quoteId = $data.quoteId

    Write-Host "✅ Sucesso! Resposta recebida:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quote ID: $quoteId" -ForegroundColor Cyan
    
    if ($quoteId -match "^MOCK-") {
        Write-Host "❌ MODO MOCK (responses ainda falsas)" -ForegroundColor Red
    } elseif ($quoteId -match "^quo_") {
        Write-Host "✅ MODO REAL ATIVADO! (responses reais da Uber)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Formato desconhecido" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Tipo de Veículo: $($data.tipoVeiculo)"
    Write-Host "Valor Total: R$ $($data.valorFreteTotal)"
    Write-Host "Distância: $($data.distanciaKm) km"
    Write-Host "Tempo: $($data.tempoEstimadoMinutos) minutos"
    Write-Host ""
    Write-Host "=== RESPOSTA COMPLETA ===" -ForegroundColor Magenta
    Write-Host ($data | ConvertTo-Json -Depth 3)
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}
