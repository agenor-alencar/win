#!/bin/bash
# ============================================================================
# Script para Aplicar Migração 002 - Consolidar Avaliações
# ============================================================================

echo "============================================="
echo "MIGRAÇÃO 002: Consolidar Sistema de Avaliações"
echo "============================================="
echo ""

# Verificar se o arquivo SQL existe
SQL_FILE="database/migrations/002_consolidar_avaliacoes.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ ERRO: Arquivo $SQL_FILE não encontrado!"
    exit 1
fi

echo "📋 Este script irá:"
echo "  1. Migrar dados de 'avaliacoes' para 'avaliacoes_produto'"
echo "  2. Migrar dados de 'avaliacoes_produtos' para 'avaliacoes_produto'"
echo "  3. Remover tabelas redundantes (avaliacoes, avaliacoes_produtos)"
echo "  4. Criar índices para performance"
echo ""

read -p "Deseja continuar? (s/N): " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo "❌ Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "🚀 Executando migração..."

# Executar o script SQL
if docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < "$SQL_FILE"; then
    echo ""
    echo "✅ Migração executada com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "  1. Mover Avaliacao.java para _deprecated/"
    echo "  2. Atualizar referências no código para usar apenas AvaliacaoProduto"
    echo "  3. Rebuild da aplicação: docker-compose up --build -d"
    echo ""
else
    echo ""
    echo "❌ ERRO ao executar migração!"
    exit 1
fi
