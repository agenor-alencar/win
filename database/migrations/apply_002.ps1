#!/usr/bin/env pwsh
# ============================================================================
# Script para Aplicar Migração 002 - Consolidar Avaliações
# ============================================================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "MIGRAÇÃO 002: Consolidar Sistema de Avaliações" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo SQL existe
$sqlFile = "database/migrations/002_consolidar_avaliacoes.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ ERRO: Arquivo $sqlFile não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Este script irá:" -ForegroundColor Yellow
Write-Host "  1. Migrar dados de 'avaliacoes' para 'avaliacoes_produto'" -ForegroundColor White
Write-Host "  2. Migrar dados de 'avaliacoes_produtos' para 'avaliacoes_produto'" -ForegroundColor White
Write-Host "  3. Remover tabelas redundantes (avaliacoes, avaliacoes_produtos)" -ForegroundColor White
Write-Host "  4. Criar índices para performance" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Deseja continuar? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Executando migração..." -ForegroundColor Green

# Executar o script SQL
try {
    docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -f /tmp/002_consolidar_avaliacoes.sql

    Write-Host ""
    Write-Host "✅ Migração executada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Mover Avaliacao.java para _deprecated/" -ForegroundColor White
    Write-Host "  2. Atualizar referências no código para usar apenas AvaliacaoProduto" -ForegroundColor White
    Write-Host "  3. Rebuild da aplicação: docker-compose up --build -d" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ ERRO ao executar migração:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
