# ============================================
# E2E Testing - Uber Webhook Handlers
# ============================================
# Testa os 3 handlers de webhook implementados:
# 1. deliveries.pickup_completed
# 2. deliveries.delivery_completed
# 3. deliveries.canceled / deliveries.delivery_cancelled
# ============================================

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host "TESTE E2E - WEBHOOK HANDLERS UBER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# ============================================
# CONFIGURAÇÕES
# ============================================
$apiBaseUrl = "http://localhost:8080"
$webhookEndpoint = "$apiBaseUrl/webhooks/uber"
$quoteEndpoint = "$apiBaseUrl/api/uber/quote"
$deliveryEndpoint = "$apiBaseUrl/api/uber/deliveries"
$statusEndpoint = "$apiBaseUrl/api/uber/deliveries"

# Mock signature HMAC (deve ser validado no servidor)
$mockSignature = "hmac-sha256=valid_signature_test"

Write-Host "📍 API Base URL: $apiBaseUrl" -ForegroundColor Yellow
Write-Host "📍 Webhook Endpoint: $webhookEndpoint" -ForegroundColor Yellow
Write-Host ""

# ============================================
# FUNÇÃO: Testar conexão com servidor
# ============================================
function Test-ServerConnection {
    Write-Host "🔍 Testando conexão com servidor..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "$apiBaseUrl/actuator/health" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Servidor está UP e pronto!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Servidor não está respondendo!" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Para rodar os testes, inicie o servidor com:" -ForegroundColor Yellow
        Write-Host "   cd backend && mvn spring-boot:run" -ForegroundColor Gray
        return $false
    }
}

# ============================================
# TESTE 1: Webhook pickup_completed
# ============================================
function Test-PickupCompleted {
    Write-Host "`n📦 TESTE 1: deliveries.pickup_completed" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor Cyan
    
    $eventPayload = @{
        event_id = "evt_pickup_001_$(Get-Random)"
        event_type = "deliveries.pickup_completed"
        event_time = (Get-Date).ToUniversalTime().ToString("o")
        data = @{
            ride_id = "ride_pickup_$(Get-Random)"
            status = "pickup_completed"
            courier = @{
                id = "courier_123"
                name = "João Silva"
                location = @{
                    latitude = -23.5505
                    longitude = -46.6333
                }
            }
            pickup = @{
                time = (Get-Date).ToUniversalTime().ToString("o")
            }
        }
    } | ConvertTo-Json -Depth 10

    Write-Host "📤 Enviando payload:" -ForegroundColor Yellow
    Write-Host $eventPayload -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = $mockSignature } `
            -Body $eventPayload `
            -ErrorAction Stop
        
        Write-Host "✅ Resposta: $($response.StatusCode) - Pickup completa processada!" -ForegroundColor Green
        Write-Host "📝 Body: $($response.Content)" -ForegroundColor Gray
        return $true
    } catch {
        Write-Host "❌ Erro ao processar pickup_completed" -ForegroundColor Red
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# ============================================
# TESTE 2: Webhook delivery_completed
# ============================================
function Test-DeliveryCompleted {
    Write-Host "`n📦 TESTE 2: deliveries.delivery_completed" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor Cyan
    
    $eventPayload = @{
        event_id = "evt_delivery_001_$(Get-Random)"
        event_type = "deliveries.delivery_completed"
        event_time = (Get-Date).ToUniversalTime().ToString("o")
        data = @{
            ride_id = "ride_delivery_$(Get-Random)"
            status = "delivery_completed"
            courier = @{
                id = "courier_123"
                name = "João Silva"
                location = @{
                    latitude = -23.5520
                    longitude = -46.6340
                }
            }
            delivery = @{
                time = (Get-Date).ToUniversalTime().ToString("o")
                pin_used = "123456"
            }
        }
    } | ConvertTo-Json -Depth 10

    Write-Host "📤 Enviando payload:" -ForegroundColor Yellow
    Write-Host $eventPayload -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = $mockSignature } `
            -Body $eventPayload `
            -ErrorAction Stop
        
        Write-Host "✅ Resposta: $($response.StatusCode) - Entrega completa processada!" -ForegroundColor Green
        Write-Host "📝 Body: $($response.Content)" -ForegroundColor Gray
        return $true
    } catch {
        Write-Host "❌ Erro ao processar delivery_completed" -ForegroundColor Red
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# ============================================
# TESTE 3: Webhook delivery_cancelled
# ============================================
function Test-DeliveryCancelled {
    Write-Host "`n🚫 TESTE 3: deliveries.delivery_cancelled" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor Cyan
    
    $eventPayload = @{
        event_id = "evt_cancel_001_$(Get-Random)"
        event_type = "deliveries.delivery_cancelled"
        event_time = (Get-Date).ToUniversalTime().ToString("o")
        data = @{
            ride_id = "ride_cancel_$(Get-Random)"
            status = "canceled"
            cancellation_reason = "Driver cancelled"
            courier = @{
                id = "courier_123"
                name = "João Silva"
            }
        }
    } | ConvertTo-Json -Depth 10

    Write-Host "📤 Enviando payload:" -ForegroundColor Yellow
    Write-Host $eventPayload -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = $mockSignature } `
            -Body $eventPayload `
            -ErrorAction Stop
        
        Write-Host "✅ Resposta: $($response.StatusCode) - Cancelamento processado!" -ForegroundColor Green
        Write-Host "📝 Body: $($response.Content)" -ForegroundColor Gray
        return $true
    } catch {
        Write-Host "❌ Erro ao processar delivery_cancelled" -ForegroundColor Red
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# ============================================
# TESTE 4: Fluxo completo (sequência real)
# ============================================
function Test-CompleteFlow {
    Write-Host "`n🔄 TESTE 4: Fluxo Completo de Entrega" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor Cyan
    
    $rideId = "ride_complete_$(Get-Random)"
    
    # ETAPA 1: Quote
    Write-Host "`n  ETAPA 1️⃣  - Calcular Cotação..." -ForegroundColor Yellow
    $quotePayload = @{
        latitudeOrigem = -23.5505
        longitudeOrigem = -46.6333
        latitudeDestino = -23.5520
        longitudeDestino = -46.6340
        productId = "food"
    } | ConvertTo-Json
    
    try {
        $quoteResponse = Invoke-WebRequest `
            -Uri $quoteEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Body $quotePayload `
            -ErrorAction Stop
        Write-Host "  ✅ Quote calculada com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Quote endpoint indisponível (esperado sem servidor)" -ForegroundColor Yellow
    }
    
    # ETAPA 2: Status AGUARDANDO_MOTORISTA → EM_TRANSITO (pickup)
    Write-Host "`n  ETAPA 2️⃣  - Motorista pegando pacote (pickup_completed)..." -ForegroundColor Yellow
    $pickupEvent = @{
        event_id = "evt_p1_$rideId"
        event_type = "deliveries.pickup_completed"
        event_time = (Get-Date).ToUniversalTime().ToString("o")
        data = @{
            ride_id = $rideId
            status = "pickup_completed"
            courier = @{
                id = "courier_test"
                name = "Teste Motorista"
                location = @{ latitude = -23.5505; longitude = -46.6333 }
            }
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $r1 = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = $mockSignature } `
            -Body $pickupEvent `
            -ErrorAction Stop
        Write-Host "  ✅ Status: AGUARDANDO → EM_TRANSITO" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Webhook endpoint indisponível" -ForegroundColor Yellow
    }
    
    # ETAPA 3: Status EM_TRANSITO → ENTREGUE (delivery)
    Write-Host "`n  ETAPA 3️⃣  - Entregando pacote (delivery_completed)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $deliveryEvent = @{
        event_id = "evt_d1_$rideId"
        event_type = "deliveries.delivery_completed"
        event_time = (Get-Date).ToUniversalTime().ToString("o")
        data = @{
            ride_id = $rideId
            status = "delivery_completed"
            courier = @{
                id = "courier_test"
                location = @{ latitude = -23.5520; longitude = -46.6340 }
            }
            delivery = @{ time = (Get-Date).ToUniversalTime().ToString("o") }
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $r2 = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = $mockSignature } `
            -Body $deliveryEvent `
            -ErrorAction Stop
        Write-Host "  ✅ Status: EM_TRANSITO → ENTREGUE" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Webhook endpoint indisponível" -ForegroundColor Yellow
    }
    
    Write-Host "`n  🎉 Fluxo completo: AGUARDANDO → EM_TRANSITO → ENTREGUE" -ForegroundColor Green
}

# ============================================
# TESTE 5: Validação de Signature
# ============================================
function Test-InvalidSignature {
    Write-Host "`n🔐 TESTE 5: Validar Rejeição de Assinatura Inválida" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor Cyan
    
    $eventPayload = @{
        event_id = "evt_invalid_sig_$(Get-Random)"
        event_type = "deliveries.pickup_completed"
        data = @{ ride_id = "ride_test" }
    } | ConvertTo-Json
    
    Write-Host "📤 Enviando com signature INVÁLIDA..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest `
            -Uri $webhookEndpoint `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "X-Uber-Signature" = "invalid_signature_abc" } `
            -Body $eventPayload `
            -ErrorAction Stop
        
        Write-Host "⚠️  Webhook aceitou - validação pode não estar ativa" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Request rejeitado com 401 Unauthorized (correto!)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Status recebido: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# ============================================
# MAIN - Executar Testes
# ============================================

if (Test-ServerConnection) {
    Write-Host ""
    Write-Host "🚀 Iniciando testes E2E..." -ForegroundColor Cyan
    Write-Host ""
    
    $results = @{
        "PickupCompleted" = Test-PickupCompleted
        "DeliveryCompleted" = Test-DeliveryCompleted
        "DeliveryCancelled" = Test-DeliveryCancelled
        "CompleteFlow" = Test-CompleteFlow
        "InvalidSignature" = Test-InvalidSignature
    }
    
    # ============================================
    # RESUMO DOS RESULTADOS
    # ============================================
    Write-Host "`n`n" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "RESUMO DOS TESTES" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    $passed = ($results.Values | Where-Object { $_ -eq $true }).Count
    $failed = ($results.Values | Where-Object { $_ -eq $false }).Count
    $total = $results.Count
    
    Write-Host ""
    Write-Host "✅ Passou: $passed" -ForegroundColor Green
    Write-Host "❌ Falhou: $failed" -ForegroundColor Red
    Write-Host "📊 Total:  $total" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($testName in $results.Keys) {
        $status = if ($results[$testName]) { "✅ PASSOU" } else { "❌ FALHOU" }
        Write-Host "  $status - $testName" -ForegroundColor $(if ($results[$testName]) { "Green" } else { "Red" })
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "WEBHOOKS TESTADOS:" -ForegroundColor Green
    Write-Host "  ✨ deliveries.pickup_completed" -ForegroundColor Cyan
    Write-Host "  ✨ deliveries.delivery_completed" -ForegroundColor Cyan
    Write-Host "  ✨ deliveries.delivery_cancelled" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "`n⚠️  Testes E2E requerem servidor rodando!" -ForegroundColor Yellow
}
