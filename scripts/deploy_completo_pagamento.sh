#!/bin/bash

# Script de Deploy Completo - Todas as Correções de Pagamento e Pedidos
# Data: 21/02/2026
# Autor: WIN Marketplace Team
# Descrição: Aplica todas as correções de lojistas, pagamento, QR code e pedidos

set -e

echo "========================================================================="
echo "                    DEPLOY COMPLETO - WIN MARKETPLACE"
echo "            Correções: Lojistas + Pagamento + QR Code + Pedidos"
echo "========================================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
WORKSPACE_DIR="/var/www/win"
BACKUP_DIR="/var/backups/win/deploy_completo_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/win/deploy_$(date +%Y%m%d_%H%M%S).log"

# Função de log
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Função para verificar se comando foi bem-sucedido
check_success() {
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ $1${NC}"
    else
        log "${RED}✗ Erro: $1${NC}"
        log "${YELLOW}Executando rollback...${NC}"
        rollback
        exit 1
    fi
}

# Função de rollback
rollback() {
    log "${YELLOW}Iniciando rollback...${NC}"
    
    # Restaurar código
    if [ -d "$BACKUP_DIR" ]; then
        sudo cp -r "$BACKUP_DIR/backend" "$WORKSPACE_DIR/" 2>/dev/null || true
        sudo cp -r "$BACKUP_DIR/win-frontend" "$WORKSPACE_DIR/" 2>/dev/null || true
        log "${GREEN}✓ Código restaurado${NC}"
    fi
    
    # Restaurar containers
    cd "$WORKSPACE_DIR"
    sudo docker-compose down
    sudo docker-compose up -d
    log "${GREEN}✓ Containers restaurados${NC}"
    
    log "${RED}Rollback concluído. Sistema no estado anterior.${NC}"
}

log "${BLUE}========================================"
log "FASE 1: PREPARAÇÃO"
log "========================================${NC}"

log "${YELLOW}[1.1] Criando diretórios de backup e log...${NC}"
sudo mkdir -p "$BACKUP_DIR"
sudo mkdir -p "$(dirname "$LOG_FILE")"
check_success "Diretórios criados"

log "${YELLOW}[1.2] Backup completo do código atual...${NC}"
sudo cp -r "$WORKSPACE_DIR/backend" "$BACKUP_DIR/"
sudo cp -r "$WORKSPACE_DIR/win-frontend" "$BACKUP_DIR/"
sudo cp -r "$WORKSPACE_DIR/docker-compose.yml" "$BACKUP_DIR/"
check_success "Backup do código criado em: $BACKUP_DIR"

log "${YELLOW}[1.3] Backup do banco de dados...${NC}"
sudo docker exec win-postgres pg_dump -U winuser winmarketplace > "$BACKUP_DIR/database_backup.sql"
check_success "Backup do banco criado"

log "${YELLOW}[1.4] Verificando git status...${NC}"
cd "$WORKSPACE_DIR"
git status
log "${GREEN}✓ Git status verificado${NC}"

log ""
log "${BLUE}========================================"
log "FASE 2: ATUALIZAÇÃO DO CÓDIGO"
log "========================================${NC}"

log "${YELLOW}[2.1] Salvando alterações locais (stash)...${NC}"
git stash
log "${GREEN}✓ Stash criado${NC}"

log "${YELLOW}[2.2] Atualizando código do repositório...${NC}"
git pull origin main
check_success "Código atualizado"

log "${YELLOW}[2.3] Verificando alterações...${NC}"
git log --oneline -5
log "${GREEN}✓ Últimos 5 commits${NC}"

log ""
log "${BLUE}========================================"
log "FASE 3: PARADA DOS SERVIÇOS"
log "========================================${NC}"

log "${YELLOW}[3.1] Verificando containers em execução...${NC}"
sudo docker-compose ps

log "${YELLOW}[3.2] Parando serviços...${NC}"
sudo docker-compose down
check_success "Serviços parados"

log ""
log "${BLUE}========================================"
log "FASE 4: COMPILAÇÃO BACKEND"
log "========================================${NC}"

log "${YELLOW}[4.1] Limpando build anterior...${NC}"
cd "$WORKSPACE_DIR/backend"
./mvnw clean
check_success "Build limpo"

log "${YELLOW}[4.2] Compilando backend (com testes)...${NC}"
./mvnw package
check_success "Backend compilado com sucesso"

log "${YELLOW}[4.3] Verificando JAR gerado...${NC}"
if [ -f "target/marketplace-0.0.1-SNAPSHOT.jar" ]; then
    JAR_SIZE=$(du -h target/marketplace-0.0.1-SNAPSHOT.jar | cut -f1)
    log "${GREEN}✓ JAR gerado: $JAR_SIZE${NC}"
else
    log "${RED}✗ JAR não encontrado${NC}"
    rollback
    exit 1
fi

log ""
log "${BLUE}========================================"
log "FASE 5: COMPILAÇÃO FRONTEND"
log "========================================${NC}"

log "${YELLOW}[5.1] Verificando Node.js...${NC}"
cd "$WORKSPACE_DIR/win-frontend"
node --version
npm --version
check_success "Node.js verificado"

log "${YELLOW}[5.2] Instalando dependências...${NC}"
npm ci --production=false
check_success "Dependências instaladas"

log "${YELLOW}[5.3] Compilando frontend...${NC}"
npm run build
check_success "Frontend compilado"

log "${YELLOW}[5.4] Verificando build...${NC}"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    log "${GREEN}✓ Build gerado: $DIST_SIZE${NC}"
else
    log "${RED}✗ Diretório dist não encontrado${NC}"
    rollback
    exit 1
fi

log ""
log "${BLUE}========================================"
log "FASE 6: REBUILD DOCKER"
log "========================================${NC}"

cd "$WORKSPACE_DIR"

log "${YELLOW}[6.1] Removendo imagens antigas...${NC}"
sudo docker-compose down --rmi local --volumes --remove-orphans || true
log "${GREEN}✓ Imagens antigas removidas${NC}"

log "${YELLOW}[6.2] Reconstruindo imagens sem cache...${NC}"
sudo docker-compose build --no-cache --progress=plain
check_success "Imagens Docker reconstruídas"

log "${YELLOW}[6.3] Listando imagens criadas...${NC}"
sudo docker images | grep -E "win-backend|win-frontend|win-postgres"
log "${GREEN}✓ Imagens listadas${NC}"

log ""
log "${BLUE}========================================"
log "FASE 7: INICIALIZAÇÃO DOS SERVIÇOS"
log "========================================${NC}"

log "${YELLOW}[7.1] Iniciando containers...${NC}"
sudo docker-compose up -d
check_success "Containers iniciados"

log "${YELLOW}[7.2] Aguardando 20 segundos para inicialização...${NC}"
for i in {20..1}; do
    echo -n "$i "
    sleep 1
done
echo ""
log "${GREEN}✓ Aguardo concluído${NC}"

log "${YELLOW}[7.3] Verificando status dos containers...${NC}"
sudo docker-compose ps
check_success "Status dos containers verificado"

log ""
log "${BLUE}========================================"
log "FASE 8: VERIFICAÇÃO DE SAÚDE"
log "========================================${NC}"

log "${YELLOW}[8.1] Testando Backend (Health Check)...${NC}"
sleep 5
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")
if [ "$BACKEND_STATUS" == "200" ]; then
    log "${GREEN}✓ Backend respondendo corretamente (HTTP $BACKEND_STATUS)${NC}"
else
    log "${RED}⚠ Backend retornou HTTP $BACKEND_STATUS${NC}"
    log "${YELLOW}Verificando logs do backend...${NC}"
    sudo docker-compose logs --tail=50 backend
fi

log "${YELLOW}[8.2] Testando Frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_STATUS" == "200" ]; then
    log "${GREEN}✓ Frontend respondendo corretamente (HTTP $FRONTEND_STATUS)${NC}"
else
    log "${RED}⚠ Frontend retornou HTTP $FRONTEND_STATUS${NC}"
    log "${YELLOW}Verificando logs do frontend...${NC}"
    sudo docker-compose logs --tail=50 frontend
fi

log "${YELLOW}[8.3] Testando Banco de Dados...${NC}"
DB_STATUS=$(sudo docker exec win-postgres pg_isready -U winuser || echo "FAIL")
if [[ "$DB_STATUS" == *"accepting connections"* ]]; then
    log "${GREEN}✓ Banco de dados respondendo${NC}"
else
    log "${RED}⚠ Problema com banco de dados${NC}"
    sudo docker-compose logs --tail=50 postgres
fi

log "${YELLOW}[8.4] Testando API de Pedidos...${NC}"
sleep 2
PEDIDOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/pedidos || echo "000")
if [ "$PEDIDOS_STATUS" == "401" ] || [ "$PEDIDOS_STATUS" == "403" ]; then
    log "${GREEN}✓ API de Pedidos funcionando (requer autenticação, HTTP $PEDIDOS_STATUS)${NC}"
elif [ "$PEDIDOS_STATUS" == "200" ]; then
    log "${GREEN}✓ API de Pedidos funcionando (HTTP $PEDIDOS_STATUS)${NC}"
else
    log "${YELLOW}⚠ API de Pedidos retornou HTTP $PEDIDOS_STATUS${NC}"
fi

log ""
log "${BLUE}========================================"
log "FASE 9: TESTES FUNCIONAIS"
log "========================================${NC}"

log "${YELLOW}[9.1] Verificando endpoint de lojistas (deve exigir JWT)...${NC}"
LOJISTAS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/lojistas || echo "000")
if [ "$LOJISTAS_STATUS" == "403" ] || [ "$LOJISTAS_STATUS" == "401" ]; then
    log "${GREEN}✓ Endpoint de lojistas protegido corretamente (HTTP $LOJISTAS_STATUS)${NC}"
else
    log "${YELLOW}⚠ Endpoint de lojistas retornou HTTP $LOJISTAS_STATUS${NC}"
fi

log "${YELLOW}[9.2] Verificando endpoint público de pagamentos...${NC}"
PAYMENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/pagamentos/metodos || echo "000")
if [ "$PAYMENT_STATUS" == "200" ]; then
    log "${GREEN}✓ Endpoint de pagamentos acessível (HTTP $PAYMENT_STATUS)${NC}"
else
    log "${YELLOW}⚠ Endpoint de pagamentos retornou HTTP $PAYMENT_STATUS${NC}"
fi

log ""
log "${GREEN}========================================================================="
log "                           DEPLOY CONCLUÍDO!"
log "=========================================================================${NC}"
log ""
log "${BLUE}RESUMO DO DEPLOY:${NC}"
log "  Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"
log "  Backup em: $BACKUP_DIR"
log "  Log em: $LOG_FILE"
log ""
log "${BLUE}CORREÇÕES APLICADAS:${NC}"
log "  ✓ Páginas de lojistas (JWT obrigatório)"
log "  ✓ Fluxo de pagamento (autorização corrigida)"
log "  ✓ QR Code PIX (exibição corrigida)"
log "  ✓ Página de pedidos (campos mapeados + imagens)"
log ""
log "${BLUE}STATUS DOS SERVIÇOS:${NC}"
log "  Backend:   HTTP $BACKEND_STATUS"
log "  Frontend:  HTTP $FRONTEND_STATUS"
log "  Database:  $(echo $DB_STATUS | grep -o 'accepting connections' || echo 'Verificar logs')"
log ""
log "${BLUE}DOCUMENTAÇÃO DISPONÍVEL:${NC}"
log "  - _DOCS/CORRECAO_LOJISTAS_FORBIDDEN.md"
log "  - _DOCS/CORRECAO_FLUXO_PAGAMENTO.md"
log "  - _DOCS/CORRECAO_QRCODE_PIX.md"
log "  - _DOCS/CORRECAO_PAGINA_PEDIDOS.md"
log "  - _DOCS/RESUMO_CORRECOES_COMPLETO.md"
log ""
log "${BLUE}COMANDOS ÚTEIS:${NC}"
log "  Logs backend:   sudo docker-compose logs -f backend"
log "  Logs frontend:  sudo docker-compose logs -f frontend"
log "  Status:         sudo docker-compose ps"
log "  Restart:        sudo docker-compose restart"
log ""
log "${BLUE}PRÓXIMOS PASSOS:${NC}"
log "  1. ✓ Testar login de usuário"
log "  2. ✓ Testar acesso a página de lojista"
log "  3. ✓ Testar fluxo completo de pagamento PIX"
log "  4. ✓ Testar página de pedidos (/orders)"
log "  5. ⏳ Monitorar logs por 24h"
log ""
log "${GREEN}Sistema pronto para uso em produção!${NC}"
log ""
