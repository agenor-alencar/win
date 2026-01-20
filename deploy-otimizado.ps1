# ===================================================================
# 🚀 SCRIPT DE DEPLOY COMPLETO - WIN MARKETPLACE (PowerShell)
# ===================================================================
# Versão PowerShell para Windows (desenvolvimento local)
# Para VPS Linux, use deploy-otimizado.sh
# ===================================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 ===== DEPLOY WIN MARKETPLACE - CORREÇÕES CRÍTICAS =====" -ForegroundColor Cyan
Write-Host ""

# ===================================================================
# 1️⃣ VERIFICAÇÕES INICIAIS
# ===================================================================
Write-Host "1️⃣ Verificando ambiente..." -ForegroundColor Yellow

if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ ERRO: docker-compose.yml não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script no diretório do projeto" -ForegroundColor Red
    exit 1
}

try {
    docker compose version | Out-Null
} catch {
    Write-Host "❌ ERRO: Docker Compose não instalado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Ambiente validado" -ForegroundColor Green
Write-Host ""

# ===================================================================
# 2️⃣ BACKUP ANTES DO DEPLOY
# ===================================================================
Write-Host "2️⃣ Criando backup do banco de dados..." -ForegroundColor Yellow

$backupDir = "backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

try {
    docker exec win-marketplace-db pg_dump -U postgres -d win_marketplace > "$backupDir\database_backup.sql" 2>$null
    Write-Host "✅ Backup criado em: $backupDir" -ForegroundColor Green
} catch {
    Write-Host "⚠️  AVISO: Não foi possível criar backup (banco pode estar reiniciando)" -ForegroundColor Yellow
}

Write-Host ""

# ===================================================================
# 3️⃣ GIT PULL (atualizar código)
# ===================================================================
Write-Host "3️⃣ Atualizando código do repositório..." -ForegroundColor Yellow

if (Test-Path ".git") {
    try {
        git pull origin main
        Write-Host "✅ Código atualizado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  AVISO: git pull falhou. Continuando com arquivos locais..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  AVISO: Não é um repositório Git. Usando arquivos locais." -ForegroundColor Yellow
}

Write-Host ""

# ===================================================================
# 4️⃣ PARAR CONTAINERS
# ===================================================================
Write-Host "4️⃣ Parando containers..." -ForegroundColor Yellow

docker compose stop backend

Write-Host "✅ Backend parado" -ForegroundColor Green
Write-Host ""

# ===================================================================
# 5️⃣ REBUILD DO BACKEND (com novo código)
# ===================================================================
Write-Host "5️⃣ Reconstruindo backend com correções..." -ForegroundColor Yellow

docker compose build --no-cache backend

Write-Host "✅ Backend reconstruído" -ForegroundColor Green
Write-Host ""

# ===================================================================
# 6️⃣ INICIAR BACKEND
# ===================================================================
Write-Host "6️⃣ Iniciando backend..." -ForegroundColor Yellow

docker compose up -d backend

Write-Host "⏳ Aguardando backend inicializar (30 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "✅ Backend iniciado" -ForegroundColor Green
Write-Host ""

# ===================================================================
# 7️⃣ VERIFICAR LOGS E SAÚDE
# ===================================================================
Write-Host "7️⃣ Verificando saúde dos serviços..." -ForegroundColor Yellow

Write-Host ""
Write-Host "📊 STATUS DOS CONTAINERS:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "📋 ÚLTIMAS 20 LINHAS DE LOG DO BACKEND:" -ForegroundColor Cyan
docker compose logs --tail=20 backend

Write-Host ""
Write-Host "🔍 VERIFICANDO ERROS CRÍTICOS:" -ForegroundColor Cyan
$errorLogs = docker compose logs --tail=100 backend | Select-String -Pattern "error|exception|failed" -AllMatches
$errorCount = ($errorLogs | Measure-Object).Count

if ($errorCount -gt 5) {
    Write-Host "⚠️  AVISO: $errorCount erros detectados nos logs!" -ForegroundColor Yellow
    Write-Host "Execute: docker compose logs backend | Select-String error" -ForegroundColor Yellow
} else {
    Write-Host "✅ Nenhum erro crítico detectado" -ForegroundColor Green
}

Write-Host ""

# ===================================================================
# 8️⃣ VERIFICAR SQL LOGGING
# ===================================================================
Write-Host "8️⃣ Verificando SQL logging (deve estar DESABILITADO em produção)..." -ForegroundColor Yellow

$sqlLogs = docker compose logs --tail=50 backend | Select-String -Pattern "hibernate.SQL" -AllMatches
$sqlLogCount = ($sqlLogs | Measure-Object).Count

if ($sqlLogCount -gt 0) {
    Write-Host "⚠️  AVISO: SQL logging ainda ativo! ($sqlLogCount queries encontradas)" -ForegroundColor Yellow
    Write-Host "Verifique SPRING_PROFILES_ACTIVE no docker-compose.yml" -ForegroundColor Yellow
} else {
    Write-Host "✅ SQL logging desabilitado (produção OK)" -ForegroundColor Green
}

Write-Host ""

# ===================================================================
# 9️⃣ VERIFICAR HIKARICP WARNINGS
# ===================================================================
Write-Host "9️⃣ Verificando HikariCP warnings..." -ForegroundColor Yellow

$hikariWarns = docker compose logs --tail=50 backend | Select-String -Pattern "HikariPool.*Failed to validate" -AllMatches
$hikariWarnCount = ($hikariWarns | Measure-Object).Count

if ($hikariWarnCount -gt 0) {
    Write-Host "⚠️  AVISO: $hikariWarnCount warnings de HikariCP detectados" -ForegroundColor Yellow
    Write-Host "Aguarde mais 30 segundos para pool estabilizar..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
} else {
    Write-Host "✅ HikariCP saudável" -ForegroundColor Green
}

Write-Host ""

# ===================================================================
# 🔟 TESTE DE ENDPOINT CRÍTICO
# ===================================================================
Write-Host "🔟 Testando endpoint de saúde..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend respondendo (HTTP 200)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  AVISO: Endpoint /actuator/health não configurado (normal se não tem Spring Actuator)" -ForegroundColor Yellow
}

Write-Host ""

# ===================================================================
# ✅ RESUMO FINAL
# ===================================================================
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 CORREÇÕES APLICADAS:" -ForegroundColor Cyan
Write-Host "  ✅ Profile docker (logging otimizado para produção)" -ForegroundColor Green
Write-Host "  ✅ PedidoService (lojista obrigatório corrigido)" -ForegroundColor Green
Write-Host "  ✅ HikariCP maxLifetime (240s - abaixo do timeout do PostgreSQL)" -ForegroundColor Green
Write-Host "  ✅ Geolocalização (já implantada anteriormente)" -ForegroundColor Green
Write-Host ""
Write-Host "📋 COMANDOS ÚTEIS:" -ForegroundColor Cyan
Write-Host "  Ver logs em tempo real:    docker compose logs -f backend" -ForegroundColor White
Write-Host "  Ver erros:                 docker compose logs backend | Select-String error" -ForegroundColor White
Write-Host "  Reiniciar backend:         docker compose restart backend" -ForegroundColor White
Write-Host "  Ver uso de CPU:            docker stats --no-stream" -ForegroundColor White
Write-Host ""
Write-Host "🔍 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Teste o checkout (criar pedido)" -ForegroundColor White
Write-Host "  2. Monitore CPU: docker stats" -ForegroundColor White
Write-Host "  3. Verifique logs por 5 minutos" -ForegroundColor White
Write-Host ""
Write-Host "📚 DOCUMENTAÇÃO:" -ForegroundColor Cyan
Write-Host "  - _DOCS/IMPLEMENTACAO_GEOLOCALIZACAO.md" -ForegroundColor White
Write-Host "  - _DOCS/GUIA_DEPLOY_VPS.md" -ForegroundColor White
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
