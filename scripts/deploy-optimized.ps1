# ============================================================================
# Script de Deploy com Otimizações - Win Marketplace (PowerShell)
# ============================================================================
# Data: 11 de dezembro de 2025
# Ambiente: VPS DigitalOcean (2 vCPUs, 4GB RAM)
# Windows/PowerShell Version
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🚀 Win Marketplace - Deploy com Otimizações" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. VALIDAÇÃO DE PRÉ-REQUISITOS
# ============================================================================

Write-Host "ℹ️  Validando pré-requisitos..." -ForegroundColor Blue

# Verificar se está no diretório correto
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Arquivo docker-compose.yml não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script no diretório raiz do projeto." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
    exit 1
}

# Verificar se arquivo de configuração PostgreSQL existe
if (-not (Test-Path "config\postgres.conf")) {
    Write-Host "❌ Arquivo config\postgres.conf não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pré-requisitos validados!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 2. BACKUP DE DADOS (OPCIONAL)
# ============================================================================

$backupChoice = Read-Host "Deseja fazer backup do banco de dados antes de continuar? (s/n)"

if ($backupChoice -eq "s" -or $backupChoice -eq "S") {
    Write-Host "ℹ️  Criando backup..." -ForegroundColor Blue
    
    $backupDir = ".\backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$backupDir\backup_$timestamp.sql"
    
    $containerRunning = docker ps --filter "name=win-marketplace-db" --format "{{.Names}}"
    if ($containerRunning -eq "win-marketplace-db") {
        docker exec win-marketplace-db pg_dump -U postgres win_marketplace | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Host "✅ Backup criado: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Container do banco não está rodando. Pulando backup." -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================================================
# 3. PARAR CONTAINERS
# ============================================================================

Write-Host "ℹ️  Parando containers..." -ForegroundColor Blue
docker compose down
Write-Host "✅ Containers parados!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 4. LIMPAR RECURSOS (OPCIONAL)
# ============================================================================

$pruneChoice = Read-Host "Deseja limpar imagens antigas? (s/n)"

if ($pruneChoice -eq "s" -or $pruneChoice -eq "S") {
    Write-Host "ℹ️  Limpando imagens antigas..." -ForegroundColor Blue
    docker image prune -f
    Write-Host "✅ Imagens antigas removidas!" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# 5. REBUILD E RESTART
# ============================================================================

Write-Host "ℹ️  Recriando containers com novas configurações..." -ForegroundColor Blue
docker compose up -d --build --force-recreate

Write-Host "✅ Containers recriados!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 6. AGUARDAR INICIALIZAÇÃO
# ============================================================================

Write-Host "ℹ️  Aguardando inicialização dos serviços..." -ForegroundColor Blue
Write-Host ""

# Aguardar PostgreSQL (max 30 segundos)
Write-Host "ℹ️  Aguardando PostgreSQL..." -ForegroundColor Blue
$pgReady = $false
for ($i = 1; $i -le 30; $i++) {
    $result = docker exec win-marketplace-db pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL pronto! (${i}s)" -ForegroundColor Green
        $pgReady = $true
        break
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

if (-not $pgReady) {
    Write-Host ""
    Write-Host "❌ PostgreSQL não iniciou em 30 segundos!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Aguardar Backend (max 30 segundos)
Write-Host "ℹ️  Aguardando Backend Spring Boot..." -ForegroundColor Blue
$backendReady = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend pronto! (${i}s)" -ForegroundColor Green
            $backendReady = $true
            break
        }
    } catch {
        # Ignorar erros
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "⚠️  Backend não respondeu em 30 segundos (pode estar iniciando ainda)" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# 7. VALIDAR CONFIGURAÇÕES
# ============================================================================

Write-Host "ℹ️  Validando configurações PostgreSQL..." -ForegroundColor Blue
Write-Host ""

# Verificar shared_buffers
$sharedBuffers = docker exec win-marketplace-db psql -U postgres -t -c "SHOW shared_buffers;" | ForEach-Object { $_.Trim() }
Write-Host "ℹ️  shared_buffers: $sharedBuffers (esperado: 768MB)" -ForegroundColor Blue

# Verificar effective_cache_size
$cacheSize = docker exec win-marketplace-db psql -U postgres -t -c "SHOW effective_cache_size;" | ForEach-Object { $_.Trim() }
Write-Host "ℹ️  effective_cache_size: $cacheSize (esperado: 2GB)" -ForegroundColor Blue

# Verificar work_mem
$workMem = docker exec win-marketplace-db psql -U postgres -t -c "SHOW work_mem;" | ForEach-Object { $_.Trim() }
Write-Host "ℹ️  work_mem: $workMem (esperado: 16MB)" -ForegroundColor Blue

# Verificar max_connections
$maxConn = docker exec win-marketplace-db psql -U postgres -t -c "SHOW max_connections;" | ForEach-Object { $_.Trim() }
Write-Host "ℹ️  max_connections: $maxConn (esperado: 100)" -ForegroundColor Blue

Write-Host ""

# ============================================================================
# 8. VERIFICAR USO DE RECURSOS
# ============================================================================

Write-Host "ℹ️  Uso de recursos (aguarde 5 segundos para estabilizar)..." -ForegroundColor Blue
Start-Sleep -Seconds 5
Write-Host ""

docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.MemPerc}}"

Write-Host ""

# ============================================================================
# 9. VERIFICAR LOGS
# ============================================================================

Write-Host "ℹ️  Verificando logs (últimas 20 linhas)..." -ForegroundColor Blue
Write-Host ""

Write-Host "=== BACKEND ===" -ForegroundColor Cyan
docker logs win-marketplace-backend --tail 20
Write-Host ""

Write-Host "=== POSTGRESQL ===" -ForegroundColor Cyan
docker logs win-marketplace-db --tail 20
Write-Host ""

# ============================================================================
# 10. TESTES DE SAÚDE
# ============================================================================

Write-Host "ℹ️  Executando testes de saúde..." -ForegroundColor Blue
Write-Host ""

# Testar Backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5
    if ($health.status -eq "UP") {
        Write-Host "✅ Backend respondendo: http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend não está respondendo (verifique logs)" -ForegroundColor Yellow
}

# Testar Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ Frontend respondendo: http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend não está respondendo" -ForegroundColor Yellow
}

# Testar PostgreSQL
$result = docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL conectado e operacional" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL não está respondendo" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 11. RESUMO FINAL
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 URLs dos Serviços:" -ForegroundColor Blue
Write-Host "  • Frontend:    http://localhost:3000"
Write-Host "  • Backend API: http://localhost:8080/api"
Write-Host "  • Health:      http://localhost:8080/actuator/health"
Write-Host ""

Write-Host "📈 Monitoramento:" -ForegroundColor Blue
Write-Host "  • Recursos:     docker stats"
Write-Host "  • Logs Backend: docker logs -f win-marketplace-backend"
Write-Host "  • Logs DB:      docker logs -f win-marketplace-db"
Write-Host ""

Write-Host "🔧 Configurações Aplicadas:" -ForegroundColor Blue
Write-Host "  • Backend:    CPU 1.25 vCPU, MEM 2GB, JVM Heap 1.5GB"
Write-Host "  • PostgreSQL: CPU 0.5 vCPU, MEM 1GB, Shared Buffers 768MB"
Write-Host ""

Write-Host "⚠️  PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "  1. Monitore o uso de CPU/Memória por 24-48h"
Write-Host "  2. Verifique se CPU total VPS < 70%"
Write-Host "  3. Ajuste limites se necessário"
Write-Host "  4. Configure alertas no painel DigitalOcean"
Write-Host ""

Write-Host "📚 Documentação completa: _DOCS\OTIMIZACAO_PRODUCAO.md" -ForegroundColor Blue
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "✅ Sistema otimizado e pronto para uso!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
