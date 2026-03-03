#!/usr/bin/env pwsh
# ============================================
# Script de Teste Uber Direct API - WIN Marketplace
# ============================================
# Data: 24/02/2026
# Descrição: Testa integração real com Uber Direct API

Write-Host "🚀 WIN Marketplace - Teste Uber Direct API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se backend está rodando
Write-Host "1️⃣  Verificando se backend está ativo..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -ErrorAction Stop
    Write-Host "✅ Backend ativo: $($healthCheck.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está rodando!" -ForegroundColor Red
    Write-Host "   Execute: cd backend; mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Verificar configuração Uber
Write-Host ""
Write-Host "2️⃣  Verificando configuração Uber..." -ForegroundColor Yellow

$envFile = ".env.vps.corrigido"
if (Test-Path $envFile) {
    $uberEnabled = (Get-Content $envFile | Select-String "UBER_API_ENABLED").ToString()
    $uberClientId = (Get-Content $envFile | Select-String "UBER_CLIENT_ID").ToString()
    $uberBaseUrl = (Get-Content $envFile | Select-String "UBER_API_BASE_URL").ToString()
    
    Write-Host "   $uberEnabled" -ForegroundColor Cyan
    Write-Host "   $uberClientId" -ForegroundColor Cyan
    Write-Host "   $uberBaseUrl" -ForegroundColor Cyan
    
    if ($uberEnabled -match "true") {
        Write-Host "✅ API Uber HABILITADA - Testes vão usar API REAL!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API Uber DESABILITADA - Testes vão usar MOCK" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Arquivo $envFile não encontrado" -ForegroundColor Red
    exit 1
}

# Solicitar JWT Token
Write-Host ""
Write-Host "3️⃣  Autenticação..." -ForegroundColor Yellow
$jwtToken = Read-Host "Digite seu JWT Token (ou pressione Enter para usar token de teste)"

if ([string]::IsNullOrWhiteSpace($jwtToken)) {
    Write-Host "⚠️  Usando request sem autenticação (endpoints públicos apenas)" -ForegroundColor Yellow
    $headers = @{
        "Content-Type" = "application/json"
    }
} else {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    }
}

# ============================================
# TESTE 1: Simular Frete
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TESTE 1: Simular Frete (Quote)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$simulacaoBody = @{
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
    enderecoOrigem = "Av. Paulista, 1000"
    enderecoDestino = "Av. Brigadeiro Faria Lima, 3000"
    valorTotalPedido = 150.00
    nomeLojista = "Loja Teste"
    telefoneLojista = "+5511999999999"
    nomeCliente = "Cliente Teste"
    telefoneCliente = "+5511988888888"
    pedidoId = [guid]::NewGuid().ToString()
} | ConvertTo-Json

Write-Host ""
Write-Host "📤 Enviando requisição..." -ForegroundColor Yellow

try {
    $simulacao = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
        -Method Post `
        -Headers $headers `
        -Body $simulacaoBody `
        -ErrorAction Stop
    
    Write-Host "✅ Cotação obtida com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Resultado:" -ForegroundColor Cyan
    Write-Host "   Quote ID: $($simulacao.quoteId)" -ForegroundColor White
    Write-Host "   Valor: R$ $($simulacao.valorFrete)" -ForegroundColor White
    Write-Host "   Tempo estimado: $($simulacao.tempoEstimado) minutos" -ForegroundColor White
    Write-Host "   Distância: $($simulacao.distanciaKm) km" -ForegroundColor White
    Write-Host "   Expira em: $($simulacao.prazoExpiracao)" -ForegroundColor White
    
    # Verificar se é API real ou MOCK
    if ($simulacao.quoteId -like "quo_*") {
        Write-Host ""
        Write-Host "🎉 USANDO API REAL DA UBER!" -ForegroundColor Green -BackgroundColor DarkGreen
        $usingRealApi = $true
    } elseif ($simulacao.quoteId -like "MOCK_*") {
        Write-Host ""
        Write-Host "⚠️  Usando API MOCK (fallback)" -ForegroundColor Yellow
        $usingRealApi = $false
    }
    
    $quoteId = $simulacao.quoteId
    
} catch {
    Write-Host "❌ Erro ao simular frete" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Perguntar se deseja continuar
Write-Host ""
$continuar = Read-Host "Deseja criar uma entrega real com este quote? (S/N)"

if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "❌ Testes cancelados pelo usuário" -ForegroundColor Yellow
    exit 0
}

# ============================================
# TESTE 2: Criar Entrega
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TESTE 2: Criar Entrega" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Solicitar ID do pedido
$pedidoId = Read-Host "Digite o ID do Pedido (UUID) ou pressione Enter para gerar automaticamente"
if ([string]::IsNullOrWhiteSpace($pedidoId)) {
    $pedidoId = [guid]::NewGuid().ToString()
    Write-Host "✅ Pedido ID gerado: $pedidoId" -ForegroundColor Cyan
}

$entregaBody = @{
    quoteId = $quoteId
    emailLojista = "lojista@winteste.com"
    emailCliente = "cliente@winteste.com"
    instrucoesRetirada = "Tocar campainha no portão - Teste automatizado"
    instrucoesEntrega = "Deixar com porteiro se ausente - Teste WIN"
    cepOrigem = "01310-100"
    cepDestino = "04567-000"
} | ConvertTo-Json

Write-Host ""
Write-Host "📤 Criando entrega..." -ForegroundColor Yellow

try {
    $entrega = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$pedidoId/solicitar" `
        -Method Post `
        -Headers $headers `
        -Body $entregaBody `
        -ErrorAction Stop
    
    Write-Host "✅ Entrega criada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Resultado:" -ForegroundColor Cyan
    Write-Host "   Delivery ID: $($entrega.idCorridaUber)" -ForegroundColor White
    Write-Host "   Status: $($entrega.status)" -ForegroundColor White
    Write-Host "   URL Rastreamento: $($entrega.urlRastreamento)" -ForegroundColor White
    Write-Host "   Código Retirada (Lojista): $($entrega.codigoRetirada)" -ForegroundColor Yellow
    Write-Host "   Código Entrega (Cliente): $($entrega.codigoEntrega)" -ForegroundColor Yellow
    Write-Host "   Valor: R$ $($entrega.valorFrete)" -ForegroundColor White
    
    $entregaId = $entrega.id
    $deliveryId = $entrega.idCorridaUber
    
    if ($usingRealApi) {
        Write-Host ""
        Write-Host "🎉 ENTREGA REAL CRIADA NA UBER!" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "   A Uber Sandbox vai simular automaticamente:" -ForegroundColor Cyan
        Write-Host "   - +2 min: Motorista atribuído" -ForegroundColor Gray
        Write-Host "   - +5 min: Motorista a caminho da loja" -ForegroundColor Gray
        Write-Host "   - +10 min: Chegou na loja" -ForegroundColor Gray
        Write-Host "   - +15 min: Pedido coletado" -ForegroundColor Gray
        Write-Host "   - +30 min: A caminho do cliente" -ForegroundColor Gray
        Write-Host "   - +45 min: Entregue" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Erro ao criar entrega" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -match "expirado") {
        Write-Host ""
        Write-Host "💡 Quote expirado (15 min). Execute o script novamente." -ForegroundColor Yellow
    }
    
    exit 1
}

# ============================================
# TESTE 3: Consultar Status
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TESTE 3: Consultar Status em Tempo Real" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host ""
$aguardar = Read-Host "Aguardar 30 segundos antes de consultar status? (S/N)"

if ($aguardar -eq "S" -or $aguardar -eq "s") {
    Write-Host "⏳ Aguardando 30 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "📤 Consultando status..." -ForegroundColor Yellow

try {
    $status = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/v1/entregas/$entregaId/status" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Status obtido com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Resultado:" -ForegroundColor Cyan
    Write-Host "   Delivery ID: $($status.deliveryId)" -ForegroundColor White
    Write-Host "   Status: $($status.status)" -ForegroundColor White
    Write-Host "   URL: $($status.trackingUrl)" -ForegroundColor White
    
    if ($status.courier) {
        Write-Host ""
        Write-Host "   🏍️  Motorista:" -ForegroundColor Yellow
        Write-Host "      Nome: $($status.courier.name)" -ForegroundColor White
        Write-Host "      Telefone: $($status.courier.phoneNumber)" -ForegroundColor White
        Write-Host "      Localização: $($status.courier.latitude), $($status.courier.longitude)" -ForegroundColor White
        
        if ($status.courier.vehicle) {
            Write-Host "      Veículo: $($status.courier.vehicle.make) $($status.courier.vehicle.model)" -ForegroundColor White
            Write-Host "      Placa: $($status.courier.vehicle.licensePlate)" -ForegroundColor White
            Write-Host "      Cor: $($status.courier.vehicle.color)" -ForegroundColor White
        }
    } else {
        Write-Host ""
        Write-Host "   ⏳ Aguardando motorista..." -ForegroundColor Yellow
    }
    
    if ($status.dropoff -and $status.dropoff.eta) {
        Write-Host ""
        Write-Host "   📍 ETA Entrega: $($status.dropoff.eta)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Erro ao consultar status" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TESTE 4: Cancelar Entrega (Opcional)
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TESTE 4: Cancelar Entrega (Opcional)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host ""
$cancelar = Read-Host "⚠️  Deseja cancelar esta entrega? (S/N)"

if ($cancelar -eq "S" -or $cancelar -eq "s") {
    Write-Host ""
    Write-Host "📤 Cancelando entrega..." -ForegroundColor Yellow
    
    try {
        $cancelamento = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/entregas/$entregaId" `
            -Method Delete `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "✅ Entrega cancelada com sucesso!" -ForegroundColor Green
        Write-Host "   Status: $($cancelamento.status)" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Erro ao cancelar entrega" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -match "5 minutos") {
            Write-Host ""
            Write-Host "💡 Cancelamento só é permitido nos primeiros 5 minutos" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Entrega mantida ativa" -ForegroundColor Cyan
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($usingRealApi) {
    Write-Host "✅ Testes realizados com API REAL da Uber" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Aguarde webhooks da Uber (se configurado)" -ForegroundColor White
    Write-Host "   2. Consulte status periodicamente" -ForegroundColor White
    Write-Host "   3. Monitore logs do backend" -ForegroundColor White
    Write-Host "   4. Verifique dashboard da Uber" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Ver logs: cd backend; Get-Content logs/spring-boot.log -Tail 50 -Wait" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Testes realizados com API MOCK" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Para testar com API real:" -ForegroundColor Cyan
    Write-Host "   1. Verifique credenciais no .env" -ForegroundColor White
    Write-Host "   2. Configure UBER_API_ENABLED=true" -ForegroundColor White
    Write-Host "   3. Reinicie o backend" -ForegroundColor White
    Write-Host "   4. Execute este script novamente" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Testes concluídos!" -ForegroundColor Green
Write-Host ""
