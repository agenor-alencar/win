#!/bin/bash

# Script para rebuild e redeploy do sistema
# Uso: ./rebuild-deploy.sh

set -e  # Para na primeira falha

FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "🔄 Iniciando rebuild e redeploy do WinMarketplace..."

# 1. Parar containers
echo "⏸️  Parando containers..."
docker compose down

# 2. Rebuild backend
echo "🔨 Rebuilding backend..."
docker compose build --no-cache backend

# 3. Rebuild frontend  
echo "🎨 Rebuilding frontend..."
docker compose build --no-cache frontend

# 4. Subir tudo
echo "🚀 Iniciando containers..."
docker compose up -d

# 5. Aguardar 10s
echo "⏳ Aguardando inicialização (10s)..."
sleep 10

# 6. Mostrar status
echo "📊 Status dos containers:"
docker compose ps

# 7. Mostrar logs do backend (últimas 30 linhas)
echo ""
echo "📋 Logs do backend:"
docker compose logs --tail=30 backend

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔍 Ver logs: docker compose logs -f backend"
