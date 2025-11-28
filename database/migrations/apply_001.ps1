# ============================================================================
# Script PowerShell: Remoção da Tabela Administradores
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "REMOÇÃO DA TABELA ADMINISTRADORES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se estamos no diretório correto
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto (onde está docker-compose.yml)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretório correto" -ForegroundColor Green
Write-Host ""

# 2. Fazer backup do banco
Write-Host "📦 Passo 1: Fazendo backup do banco de dados..." -ForegroundColor Yellow
$BackupFile = "backup_pre_remove_admin_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

docker exec win-marketplace-db pg_dump -U postgres win_marketplace > $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup criado: $BackupFile" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao criar backup. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Testar o script SQL (modo teste com ROLLBACK)
Write-Host "🧪 Passo 2: Testando script SQL (modo ROLLBACK)..." -ForegroundColor Yellow

Get-Content "database\migrations\001_remove_administradores_table.sql" | docker exec -i win-marketplace-db psql -U postgres -d win_marketplace

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script testado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao testar script. Verifique os logs acima." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Perguntar confirmação
Write-Host "⚠️  ATENÇÃO: O próximo passo aplicará as mudanças PERMANENTEMENTE" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (sim/não)"

if ($confirm -ne "sim") {
    Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# 5. Aplicar mudanças definitivamente
Write-Host "🚀 Passo 3: Aplicando mudanças no banco de dados..." -ForegroundColor Yellow

# Criar versão do script com COMMIT
$scriptContent = Get-Content "database\migrations\001_remove_administradores_table.sql" -Raw
$scriptContent = $scriptContent -replace "ROLLBACK;", "COMMIT;"
$scriptContent | Out-File -FilePath "$env:TEMP\001_remove_administradores_COMMIT.sql" -Encoding UTF8

Get-Content "$env:TEMP\001_remove_administradores_COMMIT.sql" | docker exec -i win-marketplace-db psql -U postgres -d win_marketplace

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Mudanças aplicadas com sucesso" -ForegroundColor Green
    Remove-Item "$env:TEMP\001_remove_administradores_COMMIT.sql"
} else {
    Write-Host "❌ Erro ao aplicar mudanças" -ForegroundColor Red
    Write-Host "💾 Você pode restaurar o backup com:" -ForegroundColor Yellow
    Write-Host "Get-Content $BackupFile | docker exec -i win-marketplace-db psql -U postgres win_marketplace"
    exit 1
}
Write-Host ""

# 6. Recompilar backend
Write-Host "🔨 Passo 4: Recompilando backend..." -ForegroundColor Yellow
Push-Location backend

if ($IsWindows) {
    .\mvnw.cmd clean compile -DskipTests
} else {
    ./mvnw clean compile -DskipTests
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend recompilado" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao recompilar backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host ""

# 7. Reiniciar containers
Write-Host "🔄 Passo 5: Reiniciando containers..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers reiniciados" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao reiniciar containers" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 8. Aguardar containers iniciarem
Write-Host "⏳ Aguardando containers iniciarem (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# 9. Validar resultado
Write-Host "🔍 Passo 6: Validando resultado..." -ForegroundColor Yellow
Write-Host "Verificando se tabela administradores foi removida..."

$query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'administradores';"
$result = docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -t -c $query

if ($result.Trim() -eq "0") {
    Write-Host "✅ Tabela 'administradores' removida com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Tabela 'administradores' ainda existe" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 10. Resultado final
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Testar login de administrador"
Write-Host "  2. Verificar endpoints protegidos com ADMIN"
Write-Host "  3. Verificar dashboard de administração"
Write-Host ""
Write-Host "📦 Backup criado em: $BackupFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Se precisar reverter:" -ForegroundColor Yellow
Write-Host "  Get-Content $BackupFile | docker exec -i win-marketplace-db psql -U postgres win_marketplace"
Write-Host "  docker-compose restart"
Write-Host ""
