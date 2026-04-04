# =================================================================
# 🔍 ANÁLISE ESTÁTICA - Fluxo Uber Delivery
# =================================================================
# Objetivo: Identificar o que está faltando no fluxo de entrega
# sem depender de servidor rodando
# =================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🔍 ANÁLISE ESTÁTICA - FLUXO UBER DELIVERY                 ║" -ForegroundColor Cyan
Write-Host "║ Verificando implementação sem depender de servidor        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$Global:IssuesFount = @()
$Global:MissingComponents = @()
$Global:ImplementedFeatures = @()

function Add-Issue {
    param(
        [string]$Component,
        [string]$Issue,
        [string]$Severity = "Medium",  # Low, Medium, High, Critical
        [string]$File = "",
        [string]$Suggestion = ""
    )
    
    $Global:IssiesFount += @{
        Component = $Component
        Issue = $Issue
        Severity = $Severity
        File = $File
        Suggestion = $Suggestion
    }
    
    $color = switch($Severity) {
        "Critical" { "Red" }
        "High" { "Yellow" }
        "Medium" { "Cyan" }
        "Low" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$Severity] $Component - $Issue" -ForegroundColor $color
    if ($Suggestion) { Write-Host "           👉 Sugestão: $Suggestion" -ForegroundColor Gray }
    if ($File) { Write-Host "           📄 Arquivo: $File" -ForegroundColor Gray }
}

function Add-MissingComponent {
    param(
        [string]$Name,
        [string]$File,
        [string]$Description = ""
    )
    
    $Global:MissingComponents += @{
        Name = $Name
        File = $File
        Description = $Description
    }
    
    Write-Host "❌ $Name" -ForegroundColor Red
    if ($Description) { Write-Host "   └─ $Description" -ForegroundColor Gray }
}

function Add-Feature {
    param(
        [string]$Name,
        [string]$File = "",
        [string]$Status = "Implementado"
    )
    
    $Global:ImplementedFeatures += @{
        Name = $Name
        File = $File
        Status = $Status
    }
    
    Write-Host "✅ $Name" -ForegroundColor Green
    if ($File) { Write-Host "   📄 $File" -ForegroundColor Gray }
}

# =================================================================
# FASE 1: Verificar Controllers
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 1: Verificando CONTROLLERS (Endpoints)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$controllerFolder = "backend\src\main\java\com\win\marketplace\controller"
$controllers = @(
    @{ Name = "UberQuoteController"; File = "$controllerFolder\UberQuoteController.java" },
    @{ Name = "UberDeliveryController"; File = "$controllerFolder\UberDeliveryController.java" },
    @{ Name = "UberAuthController"; File = "$controllerFolder\UberAuthController.java" },
    @{ Name = "UberWebhookController"; File = "$controllerFolder\UberWebhookController.java" },
    @{ Name = "GeocodingController"; File = "$controllerFolder\GeocodingController.java" }
)

foreach ($controller in $controllers) {
    if (Test-Path $controller.File) {
        Add-Feature -Name $controller.Name -File $controller.File -Status "Implementado"
    } else {
        Add-MissingComponent -Name $controller.Name -File $controller.File -Description "Controller não encontrado"
    }
}

# =================================================================
# FASE 2: Verificar Services
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 2: Verificando SERVICES (Lógica de Negócio)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$serviceFolder = "backend\src\main\java\com\win\marketplace\service"
$services = @(
    @{ Name = "UberQuoteService"; File = "$serviceFolder\UberQuoteService.java"; Critical = $true },
    @{ Name = "UberDeliveryService"; File = "$serviceFolder\UberDeliveryService.java"; Critical = $true },
    @{ Name = "UberAuthService"; File = "$serviceFolder\UberAuthService.java"; Critical = $true },
    @{ Name = "UberWebhookService"; File = "$serviceFolder\UberWebhookService.java"; Critical = $true },
    @{ Name = "GeocodingService"; File = "$serviceFolder\GeocodingService.java"; Critical = $false },
    @{ Name = "EntregaService"; File = "$serviceFolder\EntregaService.java"; Critical = $true }
)

foreach ($service in $services) {
    if (Test-Path $service.File) {
        Add-Feature -Name $service.Name -File $service.File
    } else {
        $severity = if ($service.Critical) { "Critical" } else { "High" }
        Add-MissingComponent -Name $service.Name -File $service.File
        Add-Issue -Component $service.Name -Issue "Service não encontrado" -Severity $severity -File $service.File
    }
}

# =================================================================
# FASE 3: Verificar DTOs (Request/Response)
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 3: Verificando DTOs (Data Transfer Objects)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$dtoReqFolder = "backend\src\main\java\com\win\marketplace\dto\request"
$dtoResFolder = "backend\src\main\java\com\win\marketplace\dto\response"

$dtoReqs = @(
    "UberQuoteRequestDTO",
    "UberDeliveryRequestDTO",
    "GeocodingRequestDTO"
)

$dtoRes = @(
    "UberQuoteResponseDTO",
    "UberDeliveryResponseDTO",
    "GeocodingResponseDTO"
)

Write-Host "Request DTOs:" -ForegroundColor Yellow
foreach ($dto in $dtoReqs) {
    $file = "$dtoReqFolder\$dto.java"
    if (Test-Path $file) {
        Add-Feature -Name $dto -File $file
    } else {
        Add-Issue -Component "DTOs" -Issue "$dto não encontrado" -Severity "High" -File $file
    }
}

Write-Host ""
Write-Host "Response DTOs:" -ForegroundColor Yellow
foreach ($dto in $dtoRes) {
    $file = "$dtoResFolder\$dto.java"
    if (Test-Path $file) {
        Add-Feature -Name $dto -File $file
    } else {
        Add-Issue -Component "DTOs" -Issue "$dto não encontrado" -Severity "High" -File $file
    }
}

# =================================================================
# FASE 4: Verificar Models/Entidades
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 4: Verificando MODELS (JPA Entities)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$modelFolder = "backend\src\main\java\com\win\marketplace\model"
$models = @(
    @{ Name = "Entrega"; File = "$modelFolder\Entrega.java" },
    @{ Name = "Pedido"; File = "$modelFolder\Pedido.java" },
    @{ Name = "Lojista"; File = "$modelFolder\Lojista.java" },
    @{ Name = "Cliente"; File = "$modelFolder\Cliente.java" }
)

foreach ($model in $models) {
    if (Test-Path $model.File) {
        Add-Feature -Name $model.Name -File $model.File
    } else {
        Add-Issue -Component "Models" -Issue $model.Name -Severity "High" -File $model.File
    }
}

# =================================================================
# FASE 5: Verificar Repositories
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 5: Verificando REPOSITORIES (Data Access)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$repoFolder = "backend\src\main\java\com\win\marketplace\repository"
$repos = @(
    @{ Name = "EntregaRepository"; File = "$repoFolder\EntregaRepository.java" },
    @{ Name = "PedidoRepository"; File = "$repoFolder\PedidoRepository.java" },
    @{ Name = "QuoteRepository"; File = "$repoFolder\QuoteRepository.java" }
)

foreach ($repo in $repos) {
    if (Test-Path $repo.File) {
        Add-Feature -Name $repo.Name -File $repo.File
    } else {
        Add-Issue -Component "Repositories" -Issue $repo.Name -Severity "Medium" -File $repo.File
    }
}

# =================================================================
# FASE 6: Verificar Frontend - Componentes React
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 6: Verificando COMPONENTES FRONTEND (React)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$frontendComponents = @(
    @{ Name = "FreteCalculador"; File = "win-frontend\src\components\checkout\FreteCalculador.tsx" },
    @{ Name = "ConfirmarEntrega"; File = "win-frontend\src\components\merchant\ConfirmarEntrega.tsx" },
    @{ Name = "RastreamentoEntrega"; File = "win-frontend\src\components\orders\RastreamentoEntrega.tsx" },
    @{ Name = "CEPWidget"; File = "win-frontend\src\components\CEPWidget.tsx" },
    @{ Name = "useUberDelivery Hook"; File = "win-frontend\src\hooks\useUberDelivery.ts" }
)

foreach ($comp in $frontendComponents) {
    if (Test-Path $comp.File) {
        Add-Feature -Name $comp.Name -File $comp.File
    } else {
        Add-Issue -Component "Frontend Components" -Issue $comp.Name -Severity "High" -File $comp.File
    }
}

# =================================================================
# FASE 7: Verificar Testes
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 7: Verificando TESTES (JUnit/Cypress)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$testFolder = "backend\src\test\java\com\win\marketplace"
$tests = @(
    @{ Name = "UberDeliveryControllerTest"; File = "$testFolder\controller\UberDeliveryControllerTest.java" },
    @{ Name = "UberQuoteServiceTest"; File = "$testFolder\service\UberQuoteServiceTest.java" },
    @{ Name = "UberDeliveryServiceTest"; File = "$testFolder\service\UberDeliveryServiceTest.java" },
    @{ Name = "WebhookIntegrationTest"; File = "$testFolder\integration\WebhookIntegrationTest.java" }
)

foreach ($test in $tests) {
    if (Test-Path $test.File) {
        Add-Feature -Name $test.Name -File $test.File -Status "Implementado"
    } else {
        Add-Issue -Component "Testes" -Issue $test.Name -Severity "Medium" -File $test.File -Suggestion "Criar teste unitário"
    }
}

# =================================================================
# FASE 8: Verificar Banco de Dados
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 8: Verificando MIGRAÇÕES DE BANCO (Flyway)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$migrationFolder = "database\migrations"
$migrations = @(
    "V*__*entrega*.sql",
    "V*__*quote*.sql",
    "V*__*webhook*.sql"
)

foreach ($migration in $migrations) {
    $found = Get-ChildItem -Path $migrationFolder -Filter $migration -ErrorAction SilentlyContinue
    if ($found) {
        Add-Feature -Name $found.Name -File $found.FullName
    } else {
        Add-Issue -Component "Database" -Issue "Falta migração: $migration" -Severity "High"
    }
}

# =================================================================
# FASE 9: Verificar Configuração de Segurança
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 9: Verificando SEGURANÇA (HMAC, JWT, OAuth2)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "Verificando validação de webhook HMAC..." -ForegroundColor Yellow
$webhookServiceFile = "backend\src\main\java\com\win\marketplace\service\UberWebhookService.java"
if (Test-Path $webhookServiceFile) {
    $content = Get-Content $webhookServiceFile -Raw
    if ($content -match "validateSignature|HMAC|SHA256") {
        Add-Feature -Name "HMAC-SHA256 Validation" -Status "Implementado"
    } else {
        Add-Issue -Component "Segurança" -Issue "Validação HMAC não implementada em UberWebhookService" -Severity "Critical" -Suggestion "Adicionar validateSignature()"
    }
} else {
    Add-Issue -Component "Segurança" -Issue "UberWebhookService não encontrado" -Severity "Critical"
}

# =================================================================
# FASE 10: Analisar Fluxo E2E
# =================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "FASE 10: ANÁLISE DO FLUXO E2E COMPLETO" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$fluxoPassos = @(
    @{ Numero = 1; Nome = "Geocoding CEP"; Componente = "GeocodingController"; Tipo = "GET /api/v1/geocoding/cep/{cep}" },
    @{ Numero = 2; Nome = "Geocoding Endereço"; Componente = "GeocodingController"; Tipo = "GET /api/v1/geocoding/endereco" },
    @{ Numero = 3; Nome = "Cotação (Quote)"; Componente = "UberQuoteController"; Tipo = "POST /api/v1/uber/quotes" },
    @{ Numero = 4; Nome = "Gerar PIN"; Componente = "UberDeliveryController"; Tipo = "POST /api/v1/uber/deliveries/generate-pin" },
    @{ Numero = 5; Nome = "Criar Entrega"; Componente = "UberDeliveryController"; Tipo = "POST /api/v1/uber/deliveries" },
    @{ Numero = 6; Nome = "Consultar Status"; Componente = "UberDeliveryController"; Tipo = "GET /api/v1/uber/deliveries/{id}/status" },
    @{ Numero = 7; Nome = "Webhook Evento"; Componente = "UberWebhookController"; Tipo = "POST /api/v1/webhooks/uber" },
    @{ Numero = 8; Nome = "Rastreamento RT"; Componente = "RastreamentoEntrega"; Tipo = "WebSocket /ws/entrega/{id}" }
)

$fluxoPassosOk = 0
foreach ($passo in $fluxoPassos) {
    $controllerFile = "backend\src\main\java\com\win\marketplace\controller\$($passo.Componente).java"
    
    Write-Host ""
    Write-Host "[$($passo.Numero)/8] $($passo.Nome)" -ForegroundColor Cyan
    Write-Host "     Endpoint: $($passo.Tipo)" -ForegroundColor Gray
    Write-Host "     Componente: $($passo.Componente)" -ForegroundColor Gray
    
    if (Test-Path $controllerFile) {
        Write-Host "     Status: ✅ Implementado" -ForegroundColor Green
        $fluxoPassosOk++
    } else {
        Write-Host "     Status: ❌ Não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Fluxo completo: $fluxoPassosOk/8 passos implementados" -ForegroundColor Cyan

# =================================================================
# RELATÓRIO FINAL
# =================================================================

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "📊 RELATÓRIO FINAL" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta

Write-Host ""
Write-Host "✅ Componentes Implementados: $($Global:ImplementedFeatures.Count)" -ForegroundColor Green
Write-Host "❌ Componentes Faltando: $($Global:MissingComponents.Count)" -ForegroundColor Red
Write-Host "⚠️  Issues Identificadas: $($Global:IssuesFount.Count)" -ForegroundColor Yellow

if ($Global:MissingComponents.Count -gt 0) {
    Write-Host ""
    Write-Host "📋 COMPONENTES FALTANDO:" -ForegroundColor Red
    foreach ($comp in $Global:MissingComponents) {
        Write-Host "  • $($comp.Name) - $($comp.File)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Revisar componentes faltando listados acima" -ForegroundColor Gray
Write-Host "  2. Implementar os DTOs e Services necessários" -ForegroundColor Gray
Write-Host "  3. Criar os Controllers e endpoints" -ForegroundColor Gray
Write-Host "  4. Implementar validação HMAC para webhooks" -ForegroundColor Gray
Write-Host "  5. Criar migrações de banco de dados" -ForegroundColor Gray
Write-Host "  6. Adicionar testes unitários e de integração" -ForegroundColor Gray
Write-Host "  7. Executar testes E2E para validar fluxo" -ForegroundColor Gray
Write-Host ""

# Salvar relatório
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = "analysis-uber-delivery-$timestamp.txt"
$generatedDate = Get-Date -Format "dd/MM/yyyy HH:mm:ss"

$report = @"
===================================================
RELATORIO DE ANALISE - FLUXO UBER DELIVERY
Gerado em: $generatedDate
==================================================

RESUMO EXECUTIVO:
─────────────────
Componentes Implementados: $($Global:ImplementedFeatures.Count)
Componentes Faltando: $($Global:MissingComponents.Count)
Issues Encontradas: $($Global:IssuesFount.Count)
Fluxo E2E: $fluxoPassosOk/8 passos

COMPONENTES FALTANDO:
──────────────────
$($Global:MissingComponents | ConvertTo-Json -Depth 10)

ISSUES:
───────
$($Global:IssuesFount | ConvertTo-Json -Depth 10)

RECOMENDAÇÕES:
───────────────
1. Implementar componentes faltando
2. Adicionar validação de segurança (HMAC)
3. Criar migrações de banco de dados
4. Escrever testes abrangentes
5. Validar fluxo E2E após implementação

═══════════════════════════════════════════════════════════
"@

$report | Out-File $reportFile -Encoding UTF8
Write-Host ""
Write-Host "📄 Relatório salvo em: $reportFile" -ForegroundColor Green
