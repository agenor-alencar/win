# PIN Validation Test - Webhook Trigger
# Este script envia um webhook com status DRIVER_ARRIVED
# Isso deve disparar a ação de validação de PIN no backend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔐 PIN VALIDATION TEST" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configurations
$backendUrl = "http://localhost:8080"
$webhookEndpoint = "$backendUrl/api/v1/webhooks/uber"
$deliveryId = "test-delivery-12345"
$entregaId = "787ce2ee-d454-47a7-8dbf-e505cd165ba1"

Write-Host "📋 CONFIGURAÇÕES:" -ForegroundColor Green
Write-Host "  Backend URL: $backendUrl"
Write-Host "  Delivery ID: $deliveryId"
Write-Host "  Entrega UUID: $entregaId"
Write-Host ""

# Step 1: Verify database
Write-Host "Step 1️⃣  Verificando banco de dados..." -ForegroundColor Cyan

$dbQuery = @"
SELECT 
    id, 
    id_corrida_uber,
    status_entrega,
    data_hora_entrega,
    nome_motorista,
    placa_veiculo
FROM entregas 
WHERE id_corrida_uber = '$deliveryId'
LIMIT 1;
"@

Write-Host "  Query: $dbQuery"
Write-Host "  (Executar no PostgreSQL se necessário)"
Write-Host ""

# Step 2: Send webhook with DRIVER_ARRIVED
Write-Host "Step 2️⃣  Enviando webhook DRIVER_ARRIVED..." -ForegroundColor Cyan

$webhookPayload = @{
    idCorridaUber = $deliveryId
    statusUber = "DRIVER_ARRIVED"
    timestampUber = (Get-Date -AsUTC | ConvertTo-Json -AsArray)[0]
    nomeMotorista = "João Silva"
    placaVeiculo = "ABC-1234"
    localizacao = @{
        latitude = -23.5505
        longitude = -46.6333
    }
} | ConvertTo-Json

Write-Host "  Payload:"
Write-Host $webhookPayload | ConvertTo-Json
Write-Host ""

try {
    Write-Host "  Enviando POST para $webhookEndpoint..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $webhookEndpoint `
        -Method Post `
        -ContentType "application/json" `
        -Body $webhookPayload `
        -TimeoutSec 10
    
    Write-Host "  ✅ Response recebida:" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json
    Write-Host ""
}
catch {
    Write-Host "  ❌ Erro ao enviar webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
}

# Step 3: Check backend logs
Write-Host "Step 3️⃣  Verificando logs do backend..." -ForegroundColor Cyan
Write-Host "  Procurando por: notificarAcaoPendente" -ForegroundColor Yellow
Write-Host ""

try {
    $logs = docker-compose logs backend --tail 20 | Select-String "VALIDAR_PIN|notificarAcaoPendente|⚠️.*ação|ACTION_REQUIRED"
    
    if ($logs) {
        Write-Host "  📌 Logs encontrados:"
        Write-Host $logs -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Nenhum log de PIN encontrado (pode estar no modo DEBUG desativado)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "  ⚠️  Não foi possível ler logs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔄 PRÓXIMOS PASSOS:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🌐 Abra o navegador em: file:///c:/Users/user/OneDrive/Documentos/win/pin-validation-test.html"
Write-Host ""
Write-Host "2. Clique no botão [Conectar WebSocket]"
Write-Host "   - Deve aparecer: '✅ Conectado'"
Write-Host ""
Write-Host "3. Aguarde a mensagem de ação no log (amarelo)"
Write-Host "   - Deve aparecer: 'Evento ACTION recebido: VALIDAR_PIN_ENTREGA'"
Write-Host "   - Deve aparecer o PIN code: '🔑 PIN recebido do servidor: XXXX'"
Write-Host ""
Write-Host "4. Clique no botão [Mostrar Modal PIN]"
Write-Host "   - Uma modal deve aparecer na tela"
Write-Host ""
Write-Host "5. Digite o PIN recebido (4 dígitos) e clique [Validar PIN]"
Write-Host ""
Write-Host "6. Se PIN correto: ✅ Modal fecha automaticamente após 2 segundos"
Write-Host "   Se PIN incorreto: ❌ Mensagem de erro com opção de tentar novamente"
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 ESPERADO:" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Cyan
Write-Host "- ✅ WebSocket conectado em /topic/entrega/{entregaId}/action"
Write-Host "- ✅ Mensagem ACTION_REQUIRED recebida com PIN code"
Write-Host "- ✅ Modal exibido com campo de entrada de PIN"
Write-Host "- ✅ Validação bem-sucedida ao digitar PIN correto"
Write-Host "- ✅ Tentativas com PIN errado incrementam contador de tentativas"
Write-Host "- ✅ Após 3 falhas: bloqueio por 15 minutos"
Write-Host ""
Write-Host "Teste iniciado!" -ForegroundColor Green
