#!/bin/bash
# Script de deploy completo do sistema de geolocalização
# Para Lojistas, Usuários e Endereços
# Uso: ./deploy-geolocalizacao.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do sistema de geolocalização..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/root/win-marketplace"

# 1. Atualizar código
echo -e "${YELLOW}📥 Atualizando código do repositório...${NC}"
cd "$PROJECT_DIR"
git pull origin main
echo -e "${GREEN}✅ Código atualizado${NC}"
echo ""

# 2. Aplicar migrations SQL
echo -e "${YELLOW}🗄️  Aplicando migrations do banco de dados...${NC}"

# Migration para lojistas
echo "Aplicando migration para lojistas..."
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_lojista_coordinates.sql
echo -e "${GREEN}✅ Lojistas: latitude/longitude adicionados${NC}"

# Migration para usuários e endereços
echo "Aplicando migration para usuários e endereços..."
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_usuario_endereco_coordinates.sql
echo -e "${GREEN}✅ Usuários e Endereços: latitude/longitude adicionados${NC}"
echo ""

# 3. Verificar estrutura do banco
echo -e "${YELLOW}🔍 Verificando estrutura do banco...${NC}"
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('lojistas', 'usuarios', 'enderecos')
AND column_name IN ('latitude', 'longitude')
ORDER BY table_name, column_name;
"
echo ""

# 4. Recompilar backend
echo -e "${YELLOW}🔨 Recompilando backend...${NC}"
docker-compose build backend
echo -e "${GREEN}✅ Backend recompilado${NC}"
echo ""

# 5. Reiniciar serviços
echo -e "${YELLOW}🔄 Reiniciando serviços...${NC}"
docker-compose down
docker-compose up -d
echo -e "${GREEN}✅ Serviços reiniciados${NC}"
echo ""

# 6. Aguardar backend iniciar
echo -e "${YELLOW}⏳ Aguardando backend iniciar (30s)...${NC}"
sleep 30

# 7. Verificar status dos serviços
echo -e "${YELLOW}📊 Status dos serviços:${NC}"
docker-compose ps
echo ""

# 8. Verificar logs do backend
echo -e "${YELLOW}📝 Últimas linhas do log do backend:${NC}"
docker-compose logs --tail=50 backend
echo ""

# 9. Estatísticas de geocodificação
echo -e "${YELLOW}📍 Estatísticas de geocodificação:${NC}"
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT 
    'lojistas' as tabela,
    COUNT(*) as total,
    COUNT(latitude) as com_coordenadas,
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM lojistas
UNION ALL
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total,
    COUNT(latitude) as com_coordenadas,
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM usuarios
UNION ALL
SELECT 
    'enderecos' as tabela,
    COUNT(*) as total,
    COUNT(latitude) as com_coordenadas,
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM enderecos;
"
echo ""

# 10. Teste de saúde da API
echo -e "${YELLOW}🏥 Testando saúde da API...${NC}"
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API está respondendo${NC}"
else
    echo -e "${RED}❌ API não está respondendo${NC}"
    echo "Verificar logs: docker-compose logs backend"
fi
echo ""

echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📚 Próximos passos:${NC}"
echo "1. Testar cadastro de usuário com endereço"
echo "2. Testar cadastro de lojista"
echo "3. Testar cálculo de frete (deve estar 80% mais rápido)"
echo "4. Monitorar logs: docker-compose logs -f backend"
echo ""
echo -e "${YELLOW}🔗 Documentação:${NC}"
echo "- _DOCS/IMPLEMENTACAO_GEOLOCALIZACAO_LOJISTAS.md"
echo "- _DOCS/SISTEMA_GEOLOCALIZACAO_COMPLETO.md"
