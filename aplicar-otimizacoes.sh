#!/bin/bash
# =====================================================
# Script Rápido - Aplicar Otimizações
# Para usar quando o backend já foi buildado
# =====================================================

echo "========================================"
echo "  APLICANDO OTIMIZAÇÕES DE PERFORMANCE"
echo "========================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "ERRO: Execute este script na raiz do projeto!"
    exit 1
fi

echo "[1/4] Parando containers..."
docker-compose down
echo "  ✓ Containers parados"
echo ""

echo "[2/4] Iniciando banco de dados..."
docker-compose up -d postgres
echo "  Aguardando banco inicializar..."
sleep 15
echo "  ✓ Banco de dados iniciado"
echo ""

echo "[3/4] Aplicando índices de otimização..."
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/otimizacao_indices.sql 2>&1 | grep -v "already exists"
echo "  ✓ Índices aplicados"
echo ""

echo "[4/4] Iniciando todos os serviços..."
docker-compose up -d
echo "  Aguardando serviços iniciarem..."
sleep 20
echo "  ✓ Serviços iniciados"
echo ""

echo "========================================"
echo "  OTIMIZAÇÕES APLICADAS COM SUCESSO!"
echo "========================================"
echo ""
echo "Status dos containers:"
docker-compose ps
echo ""

echo "Monitorar CPU/Memória em tempo real:"
echo "  docker stats"
echo ""

echo "Ver logs do backend:"
echo "  docker logs -f win-marketplace-backend"
echo ""
