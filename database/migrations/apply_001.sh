#!/bin/bash
# ============================================================================
# Script de Aplicação: Remoção da Tabela Administradores
# ============================================================================

set -e  # Parar em caso de erro

echo "==========================================="
echo "REMOÇÃO DA TABELA ADMINISTRADORES"
echo "==========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto (onde está docker-compose.yml)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto${NC}"
echo ""

# 2. Fazer backup do banco
echo "📦 Passo 1: Fazendo backup do banco de dados..."
BACKUP_FILE="backup_pre_remove_admin_$(date +%Y%m%d_%H%M%S).sql"
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Falha ao criar backup. Abortando.${NC}"
    exit 1
fi
echo ""

# 3. Testar o script SQL (modo teste com ROLLBACK)
echo "🧪 Passo 2: Testando script SQL (modo ROLLBACK)..."
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/001_remove_administradores_table.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Script testado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao testar script. Verifique os logs acima.${NC}"
    exit 1
fi
echo ""

# 4. Perguntar confirmação
echo -e "${YELLOW}⚠️  ATENÇÃO: O próximo passo aplicará as mudanças PERMANENTEMENTE${NC}"
echo ""
read -p "Deseja continuar? (sim/não): " confirm

if [ "$confirm" != "sim" ]; then
    echo -e "${YELLOW}❌ Operação cancelada pelo usuário${NC}"
    exit 0
fi
echo ""

# 5. Aplicar mudanças definitivamente
echo "🚀 Passo 3: Aplicando mudanças no banco de dados..."

# Criar versão do script com COMMIT
cat database/migrations/001_remove_administradores_table.sql | sed 's/ROLLBACK;/COMMIT;/' > /tmp/001_remove_administradores_COMMIT.sql

docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < /tmp/001_remove_administradores_COMMIT.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mudanças aplicadas com sucesso${NC}"
    rm /tmp/001_remove_administradores_COMMIT.sql
else
    echo -e "${RED}❌ Erro ao aplicar mudanças${NC}"
    echo -e "${YELLOW}💾 Você pode restaurar o backup com:${NC}"
    echo "docker exec -i win-marketplace-db psql -U postgres win_marketplace < $BACKUP_FILE"
    exit 1
fi
echo ""

# 6. Recompilar backend
echo "🔨 Passo 4: Recompilando backend..."
cd backend
./mvnw clean compile -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend recompilado${NC}"
else
    echo -e "${RED}❌ Erro ao recompilar backend${NC}"
    exit 1
fi
cd ..
echo ""

# 7. Reiniciar containers
echo "🔄 Passo 5: Reiniciando containers..."
docker-compose down
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers reiniciados${NC}"
else
    echo -e "${RED}❌ Erro ao reiniciar containers${NC}"
    exit 1
fi
echo ""

# 8. Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem (30 segundos)..."
sleep 30
echo ""

# 9. Validar resultado
echo "🔍 Passo 6: Validando resultado..."
echo "Verificando se tabela administradores foi removida..."

TABELA_EXISTE=$(docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'administradores';")

if [ "$TABELA_EXISTE" -eq 0 ]; then
    echo -e "${GREEN}✅ Tabela 'administradores' removida com sucesso${NC}"
else
    echo -e "${RED}❌ Tabela 'administradores' ainda existe${NC}"
    exit 1
fi
echo ""

# 10. Resultado final
echo "==========================================="
echo -e "${GREEN}✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "==========================================="
echo ""
echo "📋 Próximos passos:"
echo "  1. Testar login de administrador"
echo "  2. Verificar endpoints protegidos com ADMIN"
echo "  3. Verificar dashboard de administração"
echo ""
echo "📦 Backup criado em: $BACKUP_FILE"
echo ""
echo "🔄 Se precisar reverter:"
echo "  docker exec -i win-marketplace-db psql -U postgres win_marketplace < $BACKUP_FILE"
echo "  docker-compose restart"
echo ""
