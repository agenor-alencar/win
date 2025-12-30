# ============================================
# Script para aplicar Migration 004
# ============================================
# Adiciona suporte ao DigitalOcean Spaces
# PowerShell (Windows)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Migration 004: DigitalOcean Spaces Support" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na raiz do projeto
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Opções de ambiente
Write-Host "Escolha o ambiente:" -ForegroundColor Yellow
Write-Host "1. Desenvolvimento (localhost)"
Write-Host "2. Produção (Docker)"
Write-Host ""
$env = Read-Host "Digite 1 ou 2"

if ($env -eq "1") {
    # Desenvolvimento Local
    Write-Host ""
    Write-Host "📋 Conectando ao PostgreSQL local..." -ForegroundColor Cyan
    
    $PGPASSWORD = "postgres123"
    $env:PGPASSWORD = $PGPASSWORD
    
    psql -U postgres -d winmarketplace -f "database/migrations/004_add_spaces_support.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao aplicar migration!" -ForegroundColor Red
        exit 1
    }
    
} elseif ($env -eq "2") {
    # Produção Docker
    Write-Host ""
    Write-Host "📋 Conectando ao container PostgreSQL..." -ForegroundColor Cyan
    
    docker exec -i win-marketplace-db psql -U postgres -d winmarketplace < "database/migrations/004_add_spaces_support.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao aplicar migration!" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "❌ Opção inválida!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚀 Banco pronto para DigitalOcean Spaces!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
