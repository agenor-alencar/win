#!/bin/bash
# Script para aplicar migration 005 - Criar tabela de banners
# Data: 03/01/2026

echo "======================================"
echo "🚀 Aplicando Migration 005"
echo "Criação da tabela de banners"
echo "======================================"
echo ""

# Verificar se o arquivo existe
if [ ! -f "database/migrations/005_create_banners_table.sql" ]; then
    echo "❌ Erro: Arquivo de migration não encontrado!"
    echo "Esperado: database/migrations/005_create_banners_table.sql"
    exit 1
fi

# Aplicar migration
echo "📝 Aplicando migration no banco de dados..."
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration aplicada com sucesso!"
    echo ""
    
    # Verificar se a tabela foi criada
    echo "🔍 Verificando estrutura da tabela banners..."
    docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d banners"
    
    echo ""
    echo "📊 Verificando banners inseridos..."
    docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT id, titulo, ordem, ativo FROM banners;"
    
    echo ""
    echo "======================================"
    echo "✅ Migration 005 concluída!"
    echo "======================================"
else
    echo ""
    echo "❌ Erro ao aplicar migration!"
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
