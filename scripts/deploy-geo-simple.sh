#!/bin/bash
# Script simplificado de deploy do sistema de geolocalização
# Executar de dentro do diretório do projeto: ./deploy-geo-simple.sh

set -e

echo "🚀 Deploy do Sistema de Geolocalização"
echo "========================================"
echo ""

# 1. Verificar diretório
echo "📂 Diretório atual: $(pwd)"
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERRO: docker-compose.yml não encontrado!"
    echo "   Execute este script de dentro do diretório do projeto"
    exit 1
fi
echo ""

# 2. Atualizar código
echo "📥 Atualizando código..."
git pull || echo "⚠️  Git pull falhou, continuando..."
echo ""

# 3. Verificar migrations
echo "🔍 Verificando migrations SQL..."
if [ -f "database/add_lojista_coordinates.sql" ]; then
    echo "  ✅ add_lojista_coordinates.sql encontrado"
else
    echo "  ❌ add_lojista_coordinates.sql NÃO encontrado"
fi

if [ -f "database/add_usuario_endereco_coordinates.sql" ]; then
    echo "  ✅ add_usuario_endereco_coordinates.sql encontrado"
else
    echo "  ❌ add_usuario_endereco_coordinates.sql NÃO encontrado"
fi
echo ""

# 4. Aplicar migrations
echo "🗄️  Aplicando migrations..."

echo "  → Lojistas..."
if docker exec postgres-db psql -U postgres -d winmarketplace -f /database/add_lojista_coordinates.sql 2>/dev/null; then
    echo "    ✅ Migration lojistas aplicada"
else
    echo "    ⚠️  Executando via stdin..."
    docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_lojista_coordinates.sql
fi

echo "  → Usuários e Endereços..."
if docker exec postgres-db psql -U postgres -d winmarketplace -f /database/add_usuario_endereco_coordinates.sql 2>/dev/null; then
    echo "    ✅ Migration usuários/endereços aplicada"
else
    echo "    ⚠️  Executando via stdin..."
    docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_usuario_endereco_coordinates.sql
fi
echo ""

# 5. Verificar estrutura
echo "🔍 Verificando colunas criadas..."
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('lojistas', 'usuarios', 'enderecos')
AND column_name IN ('latitude', 'longitude')
ORDER BY table_name, column_name;
" 2>/dev/null || echo "⚠️  Não foi possível verificar estrutura"
echo ""

# 6. Rebuild e restart
echo "🔨 Rebuilding backend..."
docker-compose build backend
echo ""

echo "🔄 Reiniciando serviços..."
docker-compose down
docker-compose up -d
echo ""

# 7. Aguardar
echo "⏳ Aguardando backend iniciar (30s)..."
sleep 30
echo ""

# 8. Verificar status
echo "📊 Status dos containers:"
docker-compose ps
echo ""

# 9. Últimas linhas do log
echo "📝 Logs do backend (últimas 30 linhas):"
docker-compose logs --tail=30 backend
echo ""

# 10. Estatísticas
echo "📍 Estatísticas de geocodificação:"
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT 
    'lojistas' as tabela,
    COUNT(*) as total,
    COUNT(latitude) as com_coordenadas,
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) || '%' as percentual
FROM lojistas
UNION ALL
SELECT 'usuarios', COUNT(*), COUNT(latitude),
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) || '%'
FROM usuarios
UNION ALL
SELECT 'enderecos', COUNT(*), COUNT(latitude),
    ROUND(COUNT(latitude)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) || '%'
FROM enderecos;
" 2>/dev/null || echo "⚠️  Não foi possível obter estatísticas"
echo ""

echo "🎉 Deploy concluído!"
echo ""
echo "📚 Próximos passos:"
echo "  1. Monitorar logs: docker-compose logs -f backend"
echo "  2. Buscar geocodificações: docker-compose logs backend | grep -i geocodif"
echo "  3. Testar cadastro de usuário/lojista"
echo ""
echo "🔗 Documentação: _DOCS/SISTEMA_GEOLOCALIZACAO_COMPLETO.md"
