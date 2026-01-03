# Script PowerShell para aplicar migration 005 - Criar tabela de banners
# Data: 03/01/2026

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 Aplicando Migration 005" -ForegroundColor Cyan
Write-Host "Criação da tabela de banners" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo existe
if (-Not (Test-Path "database\migrations\005_create_banners_table.sql")) {
    Write-Host "❌ Erro: Arquivo de migration não encontrado!" -ForegroundColor Red
    Write-Host "Esperado: database\migrations\005_create_banners_table.sql" -ForegroundColor Yellow
    exit 1
}

# Aplicar migration
Write-Host "📝 Aplicando migration no banco de dados..." -ForegroundColor Yellow
Get-Content "database\migrations\005_create_banners_table.sql" | docker exec -i win-marketplace-db psql -U postgres -d win_marketplace

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Verificar se a tabela foi criada
    Write-Host "🔍 Verificando estrutura da tabela banners..." -ForegroundColor Yellow
    docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d banners"
    
    Write-Host ""
    Write-Host "📊 Verificando banners inseridos..." -ForegroundColor Yellow
    docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT id, titulo, ordem, ativo FROM banners;"
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "✅ Migration 005 concluída!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao aplicar migration!" -ForegroundColor Red
    Write-Host "Verifique os logs acima para mais detalhes." -ForegroundColor Yellow
    exit 1
}
