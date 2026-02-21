#!/bin/bash

# Script para aplicar correção da página de pedidos no VPS
# Data: 21/02/2026
# Descrição: Corrige TypeError na página de pedidos

set -e

echo "========================================"
echo "CORREÇÃO DA PÁGINA DE PEDIDOS"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variáveis
WORKSPACE_DIR="/var/www/win"
BACKUP_DIR="/var/backups/win/pagina_pedidos_$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}[1/8] Criando backup...${NC}"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/dto" "$BACKUP_DIR/dto_backup"
sudo cp -r "$WORKSPACE_DIR/win-frontend/src/lib/api" "$BACKUP_DIR/api_backup"
sudo cp -r "$WORKSPACE_DIR/win-frontend/src/pages/user" "$BACKUP_DIR/user_pages_backup"
echo -e "${GREEN}✓ Backup criado em: $BACKUP_DIR${NC}"

echo -e "${YELLOW}[2/8] Navegando para diretório do workspace...${NC}"
cd "$WORKSPACE_DIR"

echo -e "${YELLOW}[3/8] Atualizando código do repositório...${NC}"
git stash
git pull origin main
echo -e "${GREEN}✓ Código atualizado${NC}"

echo -e "${YELLOW}[4/8] Parando serviços...${NC}"
sudo docker-compose down
echo -e "${GREEN}✓ Serviços parados${NC}"

echo -e "${YELLOW}[5/8] Compilando backend...${NC}"
cd backend
./mvnw clean package -DskipTests
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend compilado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao compilar backend${NC}"
    echo -e "${YELLOW}Restaurando backup...${NC}"
    sudo cp -r "$BACKUP_DIR/dto_backup" "$WORKSPACE_DIR/backend/src/main/java/com/win/marketplace/dto"
    exit 1
fi
cd ..

echo -e "${YELLOW}[6/8] Compilando frontend...${NC}"
cd win-frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend compilado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao compilar frontend${NC}"
    echo -e "${YELLOW}Restaurando backup...${NC}"
    sudo cp -r "$BACKUP_DIR/api_backup" "$WORKSPACE_DIR/win-frontend/src/lib/api"
    sudo cp -r "$BACKUP_DIR/user_pages_backup" "$WORKSPACE_DIR/win-frontend/src/pages/user"
    exit 1
fi
cd ..

echo -e "${YELLOW}[7/8] Reconstruindo imagens Docker...${NC}"
sudo docker-compose build --no-cache
echo -e "${GREEN}✓ Imagens reconstruídas${NC}"

echo -e "${YELLOW}[8/8] Iniciando serviços...${NC}"
sudo docker-compose up -d
echo -e "${GREEN}✓ Serviços iniciados${NC}"

echo ""
echo -e "${GREEN}========================================"
echo "DEPLOY CONCLUÍDO COM SUCESSO!"
echo "========================================${NC}"
echo ""
echo "Verificando status dos containers..."
sudo docker-compose ps
echo ""
echo "Logs disponíveis em:"
echo "  Backend:  sudo docker-compose logs -f backend"
echo "  Frontend: sudo docker-compose logs -f frontend"
echo ""
echo "Documentação: _DOCS/CORRECAO_PAGINA_PEDIDOS.md"
echo ""

# Aguardar serviços iniciarem
echo "Aguardando 15 segundos para os serviços iniciarem..."
sleep 15

# Verificar se serviços estão rodando
echo "Verificando saúde dos serviços..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$BACKEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Backend respondendo (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Backend retornou HTTP $BACKEND_STATUS${NC}"
fi

if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Frontend respondendo (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend retornou HTTP $FRONTEND_STATUS${NC}"
fi

echo ""
echo "Teste a página de pedidos em: https://seu-dominio.com/orders"
echo ""
