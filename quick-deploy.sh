#!/bin/bash
# Deploy ultra-rápido - Apenas o essencial
# Execute: chmod +x quick-deploy.sh && ./quick-deploy.sh

echo "🚀 Deploy Rápido - Geolocalização"
echo ""

# 1. Migrations
echo "📥 Aplicando migrations SQL..."
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_lojista_coordinates.sql
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_usuario_endereco_coordinates.sql
echo ""

# 2. Verificar
echo "✅ Verificando colunas..."
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT table_name, column_name 
FROM information_schema.columns
WHERE table_name IN ('lojistas', 'usuarios', 'enderecos')
AND column_name IN ('latitude', 'longitude')
ORDER BY table_name;"
echo ""

# 3. Restart
echo "🔄 Reiniciando backend..."
docker-compose restart backend
echo ""

# 4. Aguardar
echo "⏳ Aguardando 20s..."
sleep 20
echo ""

# 5. Status
echo "📊 Status:"
docker-compose ps | grep backend
echo ""

echo "✅ Deploy concluído!"
echo ""
echo "Verificar logs: docker-compose logs -f backend"
