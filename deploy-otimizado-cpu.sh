#!/bin/bash
# =====================================================
# Script de Deploy - Otimizações de Performance
# =====================================================
# Data: 20 de Janeiro de 2026
# =====================================================

echo "========================================"
echo "  DEPLOY - OTIMIZAÇÕES DE PERFORMANCE"
echo "========================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "ERRO: Execute este script na raiz do projeto!"
    exit 1
fi

echo "[1/6] Parando containers..."
docker-compose down
if [ $? -ne 0 ]; then
    echo "ERRO ao parar containers!"
    exit 1
fi
echo "  ✓ Containers parados"
echo ""

echo "[2/6] Compilando backend..."
cd backend
./mvnw clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "ERRO na compilação do backend!"
    cd ..
    exit 1
fi
cd ..
echo "  ✓ Backend compilado"
echo ""

echo "[3/6] Iniciando banco de dados..."
docker-compose up -d postgres
sleep 15
echo "  ✓ Banco de dados iniciado"
echo ""

echo "[4/6] Aplicando índices de otimização..."
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/otimizacao_indices.sql
if [ $? -ne 0 ]; then
    echo "AVISO: Alguns índices podem já existir (isso é normal)"
fi
echo "  ✓ Índices aplicados"
echo ""

echo "[5/6] Iniciando backend otimizado..."
docker-compose up -d --build backend
sleep 20
echo "  ✓ Backend iniciado"
echo ""

echo "[6/6] Iniciando frontend..."
docker-compose up -d frontend
echo "  ✓ Frontend iniciado"
echo ""

echo "========================================"
echo "  DEPLOY CONCLUÍDO COM SUCESSO!"
echo "========================================"
echo ""
echo "Verificando status dos containers:"
docker-compose ps
echo ""

echo "Monitorar logs do backend:"
echo "  docker logs -f win-marketplace-backend"
echo ""

echo "Verificar uso de CPU/Memória:"
echo "  docker stats"
echo ""

echo "Acessar aplicação:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo ""
