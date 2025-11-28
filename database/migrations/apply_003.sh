#!/bin/bash

# ========================================
# Script Bash para Aplicar Migration 003
# Integração Uber Flash
# ========================================

echo "========================================"
echo "Migration 003: Uber Flash Integration"
echo "========================================"
echo ""

# Configurações
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="win_marketplace"
DB_USER="postgres"
MIGRATION_FILE="003_create_entregas_table.sql"

echo "⚠️  ATENÇÃO: Esta migration irá:"
echo "  1. DELETAR a tabela 'entregas' antiga"
echo "  2. ADICIONAR coluna 'lojista_id' na tabela 'pedidos'"
echo "  3. CRIAR nova tabela 'entregas' para Uber Flash"
echo ""

read -p "Deseja continuar? (s/N): " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "📦 Criando backup antes da migration..."

# Backup
timestamp=$(date +"%Y%m%d_%H%M%S")
backupFile="backup_before_migration_003_$timestamp.sql"

docker exec win-marketplace-db pg_dump -U $DB_USER -d $DB_NAME > $backupFile

if [ $? -eq 0 ]; then
    echo "✅ Backup criado: $backupFile"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

echo ""
echo "🚀 Aplicando migration 003..."

# Aplicar migration
migrationPath="$(dirname "$0")/$MIGRATION_FILE"

if [ ! -f "$migrationPath" ]; then
    echo "❌ Arquivo de migration não encontrado: $migrationPath"
    exit 1
fi

docker exec -i win-marketplace-db psql -U $DB_USER -d $DB_NAME < "$migrationPath"

if [ $? -eq 0 ]; then
    echo "✅ Migration 003 aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar migration"
    echo "🔄 Para reverter, use o backup: $backupFile"
    exit 1
fi

echo ""
echo "🔍 Verificando estrutura criada..."

# Verificar tabela entregas
checkQuery="
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
"

docker exec -i win-marketplace-db psql -U $DB_USER -d $DB_NAME -c "$checkQuery"

echo ""
echo "========================================"
echo "✅ Migration 003 concluída!"
echo "========================================"
echo ""
echo "📋 Próximos passos:"
echo "  1. Rebuild containers: docker-compose up --build -d"
echo "  2. Verificar logs: docker-compose logs -f backend"
echo "  3. Testar endpoint: POST /entregas/simular-frete"
echo ""
