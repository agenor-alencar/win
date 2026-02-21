#!/bin/bash

# Script para aplicar correção de Join Fetch na página de pedidos
# Data: 21/02/2026
# Descrição: Corrige LazyInitializationException com join fetch otimizado

set -e

echo "========================================"
echo "CORREÇÃO JOIN FETCH - PÁGINA DE PEDIDOS"
echo "========================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WORKSPACE_DIR="/var/www/win"
BACKUP_DIR="/var/backups/win/join_fetch_$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}[1/7] Criando backup...${NC}"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/repository/PedidoRepository.java" "$BACKUP_DIR/"
sudo cp -r "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/service/PedidoService.java" "$BACKUP_DIR/"
sudo cp -r "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/controller/PedidoController.java" "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup criado em: $BACKUP_DIR${NC}"

echo -e "${YELLOW}[2/7] Atualizando código...${NC}"
cd "$WORKSPACE_DIR"
git stash
git pull origin main
echo -e "${GREEN}✓ Código atualizado${NC}"

echo -e "${YELLOW}[3/7] Parando backend...${NC}"
sudo docker-compose stop backend
echo -e "${GREEN}✓ Backend parado${NC}"

echo -e "${YELLOW}[4/7] Compilando backend...${NC}"
cd backend
./mvnw clean package -DskipTests
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend compilado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao compilar backend${NC}"
    echo -e "${YELLOW}Restaurando backup...${NC}"
    sudo cp -r "$BACKUP_DIR/"* "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/"
    sudo docker-compose start backend
    exit 1
fi
cd ..

echo -e "${YELLOW}[5/7] Reconstruindo imagem Docker do backend...${NC}"
sudo docker-compose build backend
echo -e "${GREEN}✓ Imagem reconstruída${NC}"

echo -e "${YELLOW}[6/7] Iniciando backend...${NC}"
sudo docker-compose up -d backend
echo -e "${GREEN}✓ Backend iniciado${NC}"

echo -e "${YELLOW}[7/7] Aguardando backend inicializar e verificando logs...${NC}"
sleep 15

echo ""
echo -e "${GREEN}========================================"
echo "DEPLOY CONCLUÍDO!"
echo "========================================${NC}"
echo ""
echo "Verificando status..."
sudo docker-compose ps backend
echo ""
echo "Últimos logs:"
sudo docker-compose logs --tail=30 backend
echo ""
echo -e "${YELLOW}Teste acessando: https://winmarketplace.com.br/orders${NC}"
echo ""
echo "Para monitorar logs em tempo real:"
echo "  sudo docker-compose logs -f backend | grep pedidos"
echo ""
echo "Para verificar se está funcionando, procure por:"
echo '  "Encontrados X pedidos para o usuário"'
echo ""
