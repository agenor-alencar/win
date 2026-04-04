Write-Host "Analise profunda do fluxo Uber Delivery" -ForegroundColor Cyan
Write-Host ""

$issues = @()

# ----- 1. VERIFICAR ENDPOINTS IMPLEMENTADOS -----
Write-Host "1. Verificando Endpoints..." -ForegroundColor Yellow

$controller = "backend\src\main\java\com\win\marketplace\controller\UberDeliveryController.java"
$content = Get-Content $controller -Raw 2>$null

$endpoints = @(
    "/api/v1/uber/deliveries",
    "/api/v1/uber/deliveries/{deliveryId}/status",
    "/api/v1/uber/deliveries/generate-pin"
)

foreach ($ep in $endpoints) {
    if ($content -match [regex]::Escape($ep)) {
        Write-Host "  OK - $ep" -ForegroundColor Green
    } else {
        Write-Host "  FALTA - $ep" -ForegroundColor Red
        $issues += $ep
    }
}

# ----- 2. VERIFICAR VALIDACAO HMAC -----
Write-Host ""
Write-Host "2. Verificando HMAC-SHA256 Validation..." -ForegroundColor Yellow

$webhookSvc = "backend\src\main\java\com\win\marketplace\service\UberWebhookService.java"
$wbContent = Get-Content $webhookSvc -Raw 2>$null

if ($wbContent -match "validarAssinatura|HMAC|SHA256") {
    Write-Host "  OK - Validacao HMAC encontrada" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Nao ha validacao HMAC" -ForegroundColor Red
    $issues += "HMAC Validation nao implementada"
}

# ----- 3. VERIFICAR PIN CODES -----
Write-Host ""
Write-Host "3. Verificando Geracao de PIN Codes..." -ForegroundColor Yellow

if ($content -match "generate.*pin|generatePin|PIN|pin") {
    Write-Host "  OK - Geracao de PIN encontrada" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Nao ha geracao de PIN codes" -ForegroundColor Red
    $issues += "PIN Code generation nao implementada"
}

# ----- 4. VERIFICAR PERSISTENCIA EM BANCO -----
Write-Host ""
Write-Host "4. Verificando Persistencia...  " -ForegroundColor Yellow

$repo = "backend\src\main\java\com\win\marketplace\repository\EntregaRepository.java"
$repoContent = Get-Content $repo -Raw 2>$null

if ($repoContent -match "findByIdCorridaUber|idCorridaUber|deliveryId") {
    Write-Host "  OK - Metodos de repositorio encontrados" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Faltam metodos no repositorio" -ForegroundColor Red
    $issues += "EntregaRepository incompleto"
}

# ----- 5. VERIFICAR WEBHOOK EVENTS -----
Write-Host ""
Write-Host "5. Verificando Processamento de Webhooks..." -ForegroundColor Yellow

$webhookEvents = @(
    "courier_assigned",
    "courier_approaching_pickup",
    "pickup_completed",
    "delivery_completed",
    "delivery_cancelled"
)

foreach ($evt in $webhookEvents) {
    if ($wbContent -match [regex]::Escape($evt)) {
        Write-Host "  OK - $evt" -ForegroundColor Green
    } else {
        Write-Host "  FALTA - $evt" -ForegroundColor Yellow
    }
}

# ----- 6. VERIFICAR INTEGRACAO COM APIS EXTERNAS -----
Write-Host ""
Write-Host "6. Verificando Integracao com APIs Externas..." -ForegroundColor Yellow

$authSvc = "backend\src\main\java\com\win\marketplace\service\UberAuthService.java"
$authContent = Get-Content $authSvc -Raw 2>$null

if ($authContent -match "obtenerAccessToken|obterAccessToken") {
    Write-Host "  OK - Autenticacao OAuth2" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Autenticacao OAuth2 nao implementada" -ForegroundColor Red
    $issues += "OAuth2 Authentication incompleta"
}

# ----- 7. VERIFICAR FRONTEND INTEGRATION -----
Write-Host ""
Write-Host "7. Verificando Integracao Frontend..." -ForegroundColor Yellow

$hook = "win-frontend\src\hooks\useUberDelivery.ts"
$hookContent = Get-Content $hook -Raw 2>$null

$hookFunctions = @(
    "geocodificar",
    "solicitarCotacao",
    "criarEntrega",
    "consultarStatus"
)

foreach ($func in $hookFunctions) {
    if ($hookContent -match $func) {
        Write-Host "  OK - $func" -ForegroundColor Green
    } else {
        Write-Host "  FALTA - $func" -ForegroundColor Red
        $issues += "Hook function $func"
    }
}

# ----- 8. VERIFICAR TESTES -----
Write-Host ""
Write-Host "8. Verificando Cobertura de Testes..." -ForegroundColor Yellow

$testFiles = @(
    "backend\src\test\java\com\win\marketplace\controller\UberDeliveryControllerTest.java",
    "backend\src\test\java\com\win\marketplace\service\UberQuoteServiceTest.java",
    "backend\src\test\java\com\win\marketplace\integration\UberDeliveryIntegrationTest.java"
)

foreach ($test in $testFiles) {
    if (Test-Path $test) {
        Write-Host "  OK - $(Split-Path $test -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  FALTA - $(Split-Path $test -Leaf)" -ForegroundColor Red
        $issues += $(Split-Path $test -Leaf)
    }
}

# ----- 9. VERIFICAR MIGRACAO DE BANCO -----
Write-Host ""
Write-Host "9. Verificando Schemas de Banco..." -ForegroundColor Yellow

$sqlFiles = Get-ChildItem "database\migrations" -Filter "*.sql" 2>$null
$hasEntrega = $sqlFiles | Where-Object { $_ -match "entrega" }

if ($hasEntrega) {
    Write-Host "  OK - Migracao de Entrega encontrada" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Migracao de Entrega" -ForegroundColor Red
    $issues += "Database migration para Entrega"
}

# ----- 10. VERIFICAR CONFIGURACAO -----
Write-Host ""
Write-Host "10. Verificando Propriedades Configuradas..." -ForegroundColor Yellow

$appProps = Get-Content "backend\src\main\resources\application.yml" -Raw 2>$null

if ($appProps -match "uber.*direct.*api" -or $appProps -match "app\.uber") {
    Write-Host "  OK - Configuracao Uber encontrada" -ForegroundColor Green
} else {
    Write-Host "  FALTA - Configuracao Uber nao encontrada" -ForegroundColor Red
    $issues += "application.yml sem configuracao Uber"
}

# ----- RESUMO -----
Write-Host ""
Write-Host "===== RESUMO =====" -ForegroundColor Magenta
Write-Host "Total de Issues Encontradas: $($issues.Count)" -ForegroundColor Red
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "ISSUES:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Revisar testes com servidor rodando" -ForegroundColor Gray
Write-Host "  2. Testar cada endpoint individualmente" -ForegroundColor Gray
Write-Host "  3. Validar fluxo completo E2E" -ForegroundColor Gray
