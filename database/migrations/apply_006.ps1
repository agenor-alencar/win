# Script para aplicar a migration 006_create_favoritos_table.sql
# Este script cria a tabela favoritos no banco de dados

Write-Host "=== Aplicando Migration 006: Criar tabela favoritos ===" -ForegroundColor Cyan

# Verificar se o Docker está rodando
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker não está rodando!" -ForegroundColor Red
    exit 1
}

# Verificar se o container do banco existe
$containerExists = docker ps -a --filter "name=win-marketplace-db" --format "{{.Names}}"
if (-not $containerExists) {
    Write-Host "ERRO: Container 'win-marketplace-db' não encontrado!" -ForegroundColor Red
    Write-Host "Execute: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

# Verificar se o container está rodando
$containerRunning = docker ps --filter "name=win-marketplace-db" --format "{{.Names}}"
if (-not $containerRunning) {
    Write-Host "Iniciando container do banco de dados..." -ForegroundColor Yellow
    docker start win-marketplace-db
    Start-Sleep -Seconds 3
}

Write-Host "Aplicando migration 006_create_favoritos_table.sql..." -ForegroundColor Yellow

# Aplicar migration
Get-Content ".\006_create_favoritos_table.sql" | docker exec -i win-marketplace-db psql -U winmarketplace -d winmarketplace

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration 006 aplicada com sucesso!" -ForegroundColor Green
    
    # Verificar se a tabela foi criada
    Write-Host "`nVerificando criação da tabela..." -ForegroundColor Cyan
    $tableCheck = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favoritos');"
    $result = echo $tableCheck | docker exec -i win-marketplace-db psql -U winmarketplace -d winmarketplace -t
    
    if ($result -match "t") {
        Write-Host "✅ Tabela 'favoritos' criada com sucesso!" -ForegroundColor Green
        
        # Mostrar estrutura da tabela
        Write-Host "`nEstrutura da tabela favoritos:" -ForegroundColor Cyan
        $describeTable = "\d+ favoritos"
        echo $describeTable | docker exec -i win-marketplace-db psql -U winmarketplace -d winmarketplace
    } else {
        Write-Host "⚠️  Aviso: Não foi possível verificar a criação da tabela" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Erro ao aplicar migration 006!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Processo concluído ===" -ForegroundColor Cyan
