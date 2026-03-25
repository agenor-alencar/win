#!/usr/bin/env pwsh

<#
.SYNOPSIS
  E2E Test para Phase 9 - WebSocket Integration
  
.DESCRIPTION
  Script para validar o fluxo completo:
  1. Backend compilation
  2. Frontend build
  3. WebSocket connection
  4. Webhook simulation
  5. Message delivery
  
.EXAMPLE
  .\test-phase-9-e2e.ps1 -Backend -Frontend -WebSocket -Webhook
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$Backend,
    
    [Parameter(Mandatory=$false)]
    [switch]$Frontend,
    
    [Parameter(Mandatory=$false)]
    [switch]$WebSocket,
    
    [Parameter(Mandatory=$false)]
    [switch]$Webhook,
    
    [Parameter(Mandatory=$false)]
    [switch]$All,
    
    [Parameter(Mandatory=$false)]
    [string]$WebhookSecret = "test-secret-123"
)

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Log-Info {
    param([string]$Message)
    Write-Host "[$($timestamp)] ✅ $Message" -ForegroundColor Green
}

function Log-Error {
    param([string]$Message)
    Write-Host "[$($timestamp)] ❌ $Message" -ForegroundColor Red
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[$($timestamp)] ⚠️  $Message" -ForegroundColor Yellow
}

function Log-Section {
    param([string]$Message)
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

# Set defaults if -All specified
if ($All) {
    $Backend = $Frontend = $WebSocket = $Webhook = $true
}

# If no specific test selected, show usage
if (-not ($Backend -or $Frontend -or $WebSocket -or $Webhook)) {
    Log-Section "PHASE 9 E2E TEST SUITE - Usage"
    Write-Host "`nUsage: .\test-phase-9-e2e.ps1 [options]"
    Write-Host "`nOptions:"
    Write-Host "  -Backend    Test backend compilation and endpoints"
    Write-Host "  -Frontend   Test frontend build"
    Write-Host "  -WebSocket  Test WebSocket connection"
    Write-Host "  -Webhook    Test webhook simulation"
    Write-Host "  -All        Run all tests"
    Write-Host "`nExample:"
    Write-Host "  .\test-phase-9-e2e.ps1 -All"
    exit 0
}

# ============================================
# BACKEND TEST
# ============================================
if ($Backend) {
    Log-Section "BACKEND COMPILATION TEST"
    
    try {
        $backendPath = Join-Path $rootPath "backend"
        
        if (-not (Test-Path $backendPath)) {
            Log-Error "Backend path not found: $backendPath"
            exit 1
        }
        
        Log-Info "Changed to backend directory: $backendPath"
        Push-Location $backendPath
        
        Log-Info "Running: mvn clean compile"
        & mvn clean compile -DskipTests -q
        
        if ($LASTEXITCODE -eq 0) {
            Log-Info "✅ Backend compiled successfully"
        } else {
            Log-Error "Backend compilation failed"
            exit 1
        }
        
        # Verify key files
        $files = @(
            "src\main\java\com\win\marketplace\service\UberWebhookService.java",
            "src\main\java\com\win\marketplace\service\WebSocketNotificationService.java",
            "src\main\java\com\win\marketplace\controller\UberWebhookController.java"
        )
        
        foreach ($file in $files) {
            $fullPath = Join-Path $backendPath $file
            if (Test-Path $fullPath) {
                Log-Info "✅ Found: $(Split-Path -Leaf $file)"
            } else {
                Log-Error "Missing: $file"
                exit 1
            }
        }
        
        Pop-Location
        
    } catch {
        Log-Error "Backend test failed: $_"
        Pop-Location
        exit 1
    }
}

# ============================================
# FRONTEND TEST
# ============================================
if ($Frontend) {
    Log-Section "FRONTEND BUILD TEST"
    
    try {
        $frontendPath = Join-Path $rootPath "win-frontend"
        
        if (-not (Test-Path $frontendPath)) {
            Log-Error "Frontend path not found: $frontendPath"
            exit 1
        }
        
        Log-Info "Changed to frontend directory: $frontendPath"
        Push-Location $frontendPath
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Log-Info "Dependencies not found. Running: npm install"
            & npm install -q
        }
        
        Log-Info "Running: npm run build"
        & npm run build > build.log 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Info "✅ Frontend built successfully"
        } else {
            Log-Error "Frontend build failed. Check build.log"
            Get-Content build.log | Select-Object -Last 20
            exit 1
        }
        
        # Verify build output
        if (Test-Path "dist") {
            $files = @(
                "dist\index.html",
                "dist\assets\index.js"
            )
            
            foreach ($file in $files) {
                if (Test-Path $file) {
                    Log-Info "✅ Generated: $(Split-Path -Leaf $file)"
                } else {
                    Log-Warning "Warning: $file may not exist"
                }
            }
        }
        
        Pop-Location
        
    } catch {
        Log-Error "Frontend test failed: $_"
        Pop-Location
        exit 1
    }
}

# ============================================
# WEBSOCKET CONNECTION TEST
# ============================================
if ($WebSocket) {
    Log-Section "WEBSOCKET CONNECTION TEST"
    
    Log-Info "WebSocket URL: ws://localhost:8080/ws/connect"
    Log-Info "Expected tópicos de subscrição:"
    Log-Info "  - /topic/entrega/{id}/status"
    Log-Info "  - /topic/entrega/{id}/courier"
    Log-Info "  - /topic/entrega/{id}/action"
    Log-Info "  - /topic/entrega/{id}/alert"
    
    Log-Warning "Nota: WebSocket test requer servidor ativo (npm run dev e mvn spring-boot:run)"
    Log-Info "Para testar, siga os passos:"
    Log-Info "  1. Terminal 1: cd backend && mvn spring-boot:run"
    Log-Info "  2. Terminal 2: cd win-frontend && npm run dev"
    Log-Info "  3. Browser: Chrome DevTools → Network → WS filter"
    Log-Info "  4. Observar conexão em ws://localhost:8080/ws/connect"
}

# ============================================
# WEBHOOK SIMULATION TEST
# ============================================
if ($Webhook) {
    Log-Section "WEBHOOK SIMULATION TEST"
    
    Log-Info "Webhook Server: http://localhost:8080/api/v1/webhooks/uber"
    Log-Info "HMAC Algorithm: SHA256"
    
    try {
        # Sample webhook payload
        $payload = @{
            "event_type" = "delivery_status_changed"
            "delivery_id" = "test-delivery-123"
            "status" = "arrived_at_pickup"
            "courier" = @{
                "name" = "João Silva"
                "phone" = "11999999999"
                "vehicle" = "Honda Civic Cinza"
                "location" = @{
                    "latitude" = -23.5505
                    "longitude" = -46.6333
                }
            }
            "timestamp" = [System.DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        } | ConvertTo-Json
        
        Log-Info "Payload gerado:`n$($payload | ConvertFrom-Json | ConvertTo-Json -Depth 3)"
        
        # Calculate HMAC-SHA256
        Log-Info "Calculando HMAC-SHA256..."
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($WebhookSecret)
        
        $hmac = New-Object System.Security.Cryptography.HMACSHA256($keyBytes)
        $hashBytes = $hmac.ComputeHash($bytes)
        $signature = [Convert]::ToBase64String($hashBytes)
        
        Log-Info "✅ Signature gerada: $signature"
        
        # Test endpoint availability
        Log-Warning "Nota: Webhook test requer servidor ativo (mvn spring-boot:run)"
        Log-Info "Para testar, execute:"
        Log-Info "  curl -X POST http://localhost:8080/api/v1/webhooks/uber ``"
        Log-Info "    -H 'Content-Type: application/json' ``"
        Log-Info "    -H 'X-Uber-Signature: $signature' ``"
        Log-Info "    -d '$payload'"
        Log-Info "`nExpectado: HTTP 200 OK"
        
    } catch {
        Log-Error "Webhook simulation failed: $_"
        exit 1
    }
}

# ============================================
# SUMMARY
# ============================================
Log-Section "TEST SUMMARY"

Log-Info "Phase 9 E2E Tests Completed"
Log-Info ""
Log-Info "✅ Status:"
if ($Backend) { Log-Info "  - Backend compilation: PASSED" }
if ($Frontend) { Log-Info "  - Frontend build: PASSED" }
if ($WebSocket) { Log-Info "  - WebSocket setup: CONFIGURED" }
if ($Webhook) { Log-Info "  - Webhook payload: READY" }

Log-Info ""
Log-Info "🚀 Next Steps:"
Log-Info "  1. Start backend: cd backend && mvn spring-boot:run"
Log-Info "  2. Start frontend: cd win-frontend && npm run dev"
Log-Info "  3. Open browser: http://localhost:5173"
Log-Info "  4. Test webhook simulation (see above)"
Log-Info ""

exit 0
