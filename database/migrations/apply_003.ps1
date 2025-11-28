# ========================================
# Script PowerShell para Aplicar Migration 003
# Integração Uber Flash
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration 003: Uber Flash Integration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "win_marketplace"
$DB_USER = "postgres"
$MIGRATION_FILE = "003_create_entregas_table.sql"

Write-Host "⚠️  ATENÇÃO: Esta migration irá:" -ForegroundColor Yellow
Write-Host "  1. DELETAR a tabela 'entregas' antiga" -ForegroundColor Yellow
Write-Host "  2. ADICIONAR coluna 'lojista_id' na tabela 'pedidos'" -ForegroundColor Yellow
Write-Host "  3. CRIAR nova tabela 'entregas' para Uber Flash" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Deseja continuar? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operação cancelada" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Criando backup antes da migration..." -ForegroundColor Cyan

# Backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_before_migration_003_$timestamp.sql"

try {
    $env:PGPASSWORD = Read-Host "Digite a senha do PostgreSQL" -AsSecureString | ConvertFrom-SecureString
    docker exec win-marketplace-db pg_dump -U $DB_USER -d $DB_NAME > $backupFile
    Write-Host "✅ Backup criado: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar backup: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Aplicando migration 003..." -ForegroundColor Cyan

# Aplicar migration
$migrationPath = Join-Path $PSScriptRoot $MIGRATION_FILE

if (-not (Test-Path $migrationPath)) {
    Write-Host "❌ Arquivo de migration não encontrado: $migrationPath" -ForegroundColor Red
    exit 1
}

try {
    Get-Content $migrationPath | docker exec -i win-marketplace-db psql -U $DB_USER -d $DB_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration 003 aplicada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao aplicar migration. Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "🔄 Para reverter, use o backup: $backupFile" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao aplicar migration: $_" -ForegroundColor Red
    Write-Host "🔄 Para reverter, use o backup: $backupFile" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔍 Verificando estrutura criada..." -ForegroundColor Cyan

# Verificar tabela entregas
$checkQuery = @"
SELECT 
    'entregas' as tabela,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'entregas'
UNION ALL
SELECT 
    'pedidos.lojista_id' as tabela,
    COUNT(*) as existe
FROM information_schema.columns 
WHERE table_name = 'pedidos' AND column_name = 'lojista_id';
"@

docker exec -i win-marketplace-db psql -U $DB_USER -d $DB_NAME -c "$checkQuery"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Migration 003 concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Rebuild containers: docker-compose up --build -d" -ForegroundColor White
Write-Host "  2. Verificar logs: docker-compose logs -f backend" -ForegroundColor White
Write-Host "  3. Testar endpoint: POST /entregas/simular-frete" -ForegroundColor White
Write-Host ""
