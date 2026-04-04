# =================================================================
# 🚀 RUN COMPLETE - Iniciar Servidores e Executar Testes Uber
# =================================================================

param(
    [Parameter(Mandatory=$false)]
    [bool]$StartServers = $true,
    
    [Parameter(Mandatory=$false)]
    [bool]$GetToken = $true,
    
    [Parameter(Mandatory=$false)]
    [bool]$RunTests = $true
)

# Obter diretório base do projeto
$projectDir = Get-Location
$backendDir = Join-Path $projectDir "backend"
$frontendDir = Join-Path $projectDir "win-frontend"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TESTE COMPLETO - FLUXO UBER DELIVERY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Project Dir: $projectDir" -ForegroundColor Yellow
Write-Host "Backend Dir: $backendDir" -ForegroundColor Yellow
Write-Host "Frontend Dir: $frontendDir" -ForegroundColor Yellow
Write-Host ""

# =================================================================
# PASSO 1: INICIAR SERVIDORES
# =================================================================

if ($StartServers) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "PASSO 1/3: Iniciando Servidores..." -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    
    # Verificar se backend existe
    if (-not (Test-Path $backendDir)) {
        Write-Host "❌ Diretório backend não encontrado: $backendDir" -ForegroundColor Red
        exit 1
    }
    
    # Iniciar Backend
    Write-Host ""
    Write-Host "[1/2] Iniciando Backend (Spring Boot na porta 8080)..." -ForegroundColor Yellow
    Write-Host "      Executando em: $backendDir" -ForegroundColor Gray
    
    try {
        Push-Location $backendDir
        
        # Verificar se mvnw existe
        $mvnw = if (Test-Path "mvnw.cmd") { "mvnw.cmd" } elseif (Test-Path "mvnw") { "./mvnw" } else { "mvn" }
        Write-Host "      Maven cmd: $mvnw" -ForegroundColor Gray
        
        $backendJob = Start-Job -ScriptBlock {
            param($dir, $mvn)
            Set-Location $dir
            & cmd /c "$mvn spring-boot:run"
        } -ArgumentList $backendDir, $mvnw -Name "backend-server"
        
        Write-Host "      ✓ Backend iniciado em background (Job: $($backendJob.Id))" -ForegroundColor Green
        Write-Host "      ⏳ Aguardando inicialização (15 segundos)..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
        
        Pop-Location
    }
    catch {
        Write-Host "      ❌ Erro ao iniciar backend: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location
    }
    
    # Iniciar Frontend
    Write-Host ""
    Write-Host "[2/2] Iniciando Frontend (Vite na porta 5173)..." -ForegroundColor Yellow
    Write-Host "      Executando em: $frontendDir" -ForegroundColor Gray
    
    try {
        if (-not (Test-Path $frontendDir)) {
            Write-Host "      ⚠️  Diretório frontend não encontrado, pulando..." -ForegroundColor Yellow
        } else {
            Push-Location $frontendDir
            
            $frontendJob = Start-Job -ScriptBlock {
                param($dir)
                Set-Location $dir
                npm run dev
            } -ArgumentList $frontendDir -Name "frontend-server"
            
            Write-Host "      ✓ Frontend iniciado em background (Job: $($frontendJob.Id))" -ForegroundColor Green
            Start-Sleep -Seconds 5
            
            Pop-Location
        }
    }
    catch {
        Write-Host "      ⚠️  Erro ao iniciar frontend: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "✅ Servidores iniciados com sucesso" -ForegroundColor Green
    Write-Host ""
}

# =================================================================
# PASSO 2: OBTER TOKEN DE AUTENTICAÇÃO
# =================================================================

$token = ""

if ($GetToken) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "PASSO 2/3: Obtendo Token de Autenticação..." -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    
    Write-Host ""
    Write-Host "Testando conectividade com Backend..." -ForegroundColor Yellow
    
    try {
        # Teste simples de conectividade
        $response = Invoke-RestMethod `
            -Uri "http://localhost:8080/actuator/health" `
            -Method GET `
            -TimeoutSec 5
        
        if ($response.status -eq "UP") {
            Write-Host "✅ Backend está ativo e responsivo" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  Backend pode não estar pronto ainda: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Continuando mesmo assim..." -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Tentando obter token..." -ForegroundColor Yellow
    
    # Tentar diferentes endpoints de login
    $loginEndpoints = @(
        @{ url = "http://localhost:8080/api/v1/auth/login"; email = "admin@winmarketplace.com"; password = "admin123" },
        @{ url = "http://localhost:8080/api/auth/login"; email = "admin@winmarketplace.com"; password = "admin123" },
        @{ url = "http://localhost:8080/api/v1/login"; email = "admin@winmarketplace.com"; password = "admin123" }
    )
    
    $tokenObtido = $false
    
    foreach ($login in $loginEndpoints) {
        try {
            Write-Host "  Tentando: $($login.url)..." -ForegroundColor Gray
            
            $body = @{
                email = $login.email
                senha = $login.password
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod `
                -Uri $login.url `
                -Method POST `
                -ContentType "application/json" `
                -Body $body `
                -TimeoutSec 5
            
            if ($response.token) {
                $token = $response.token
                Write-Host "  ✅ Token obtido!" -ForegroundColor Green
                Write-Host "  Token: $($token.Substring(0, 50))..." -ForegroundColor Cyan
                $tokenObtido = $true
                break
            }
        }
        catch {
            # Continuar tentando
        }
    }
    
    if (-not $tokenObtido) {
        Write-Host ""
        Write-Host "⚠️  Não foi possível obter token automaticamente" -ForegroundColor Yellow
        Write-Host "   Usando token de demonstração" -ForegroundColor Gray
        
        # Token de demo (pode não funcionar em produção)
        $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.test"
    }
    
    Write-Host ""
}

# =================================================================
# PASSO 3: EXECUTAR TESTES DE ENTREGA UBER
# =================================================================

if ($RunTests) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "PASSO 3/3: Executando Testes Uber Delivery..." -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    
    Write-Host ""
    
    # Executar script de testes
    $testScript = Join-Path (Get-Location) "test-uber-delivery-flow.ps1"
    
    if (Test-Path $testScript) {
        & $testScript -BaseUrl "http://localhost:8080" -Token $token -Environment "local"
    } else {
        Write-Host "❌ Script de testes não encontrado: $testScript" -ForegroundColor Red
    }
}

# =================================================================
# RESUMO FINAL
# =================================================================

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ EXECUÇÃO COMPLETA" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Servidores em execução:" -ForegroundColor Yellow
Write-Host "  • Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verifique o relatório de testes gerado" -ForegroundColor Gray
Write-Host "  2. Analise os erros descobertos" -ForegroundColor Gray
Write-Host "  3. Corrija os problemas identificados" -ForegroundColor Gray
Write-Host ""
