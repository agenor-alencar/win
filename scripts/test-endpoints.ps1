# E2E Tests - Webhooks Uber Delivery
param(
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  E2E TESTING - WEBHOOKS UBER" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Teste conexão com servidor
Write-Host "Testando conexao com servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "OK - Servidor respondendo" -ForegroundColor Green
    }
} catch {
    Write-Host "ERRO - Servidor nao respondendo" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Teste 1: Health Check
Write-Host "TESTE 1: Health Check" -ForegroundColor Cyan
$health = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -UseBasicParsing
Write-Host "Status: $($health.StatusCode)" -ForegroundColor Green

Write-Host ""

# Teste 2: Listar endpoints
Write-Host "TESTE 2: Listar Controllers" -ForegroundColor Cyan
try {
    $controllers = Invoke-WebRequest -Uri "$BaseUrl/actuator/mappings" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "Status: $($controllers.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Info: Endpoint /actuator/mappings nao disponivel" -ForegroundColor Gray
}

Write-Host ""

# Teste 3: Webhook Endpoint - verificar se existe
Write-Host "TESTE 3: Webhook Endpoint Disponivel" -ForegroundColor Cyan
$webhookUrl = "$BaseUrl/webhooks/uber"
Write-Host "URL: $webhookUrl" -ForegroundColor Gray

# Tentar POST vazio para ver resposta
try {
    $result = Invoke-WebRequest -Uri $webhookUrl -Method POST -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "Resposta: $($result.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $statusDesc = $_.Exception.Response.StatusDescription
    Write-Host "Status: $statusCode $statusDesc" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  TESTES COMPLETADOS" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
