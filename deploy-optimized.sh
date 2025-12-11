#!/bin/bash

# ============================================================================
# Script de Deploy com Otimizações - Win Marketplace
# ============================================================================
# Data: 11 de dezembro de 2025
# Ambiente: VPS DigitalOcean (2 vCPUs, 4GB RAM)
# ============================================================================

set -e  # Parar em caso de erro

echo "============================================================================"
echo "🚀 Win Marketplace - Deploy com Otimizações"
echo "============================================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# 1. VALIDAÇÃO DE PRÉ-REQUISITOS
# ============================================================================

print_info "Validando pré-requisitos..."

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Arquivo docker-compose.yml não encontrado!"
    print_error "Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# Verificar se arquivo de configuração PostgreSQL existe
if [ ! -f "config/postgres.conf" ]; then
    print_error "Arquivo config/postgres.conf não encontrado!"
    exit 1
fi

print_success "Pré-requisitos validados!"
echo ""

# ============================================================================
# 2. BACKUP DE DADOS (OPCIONAL)
# ============================================================================

print_info "Deseja fazer backup do banco de dados antes de continuar? (s/n)"
read -r backup_choice

if [ "$backup_choice" = "s" ] || [ "$backup_choice" = "S" ]; then
    print_info "Criando backup..."
    
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker ps | grep -q "win-marketplace-db"; then
        docker exec win-marketplace-db pg_dump -U postgres win_marketplace > "$BACKUP_FILE"
        print_success "Backup criado: $BACKUP_FILE"
    else
        print_warning "Container do banco não está rodando. Pulando backup."
    fi
    echo ""
fi

# ============================================================================
# 3. PARAR CONTAINERS
# ============================================================================

print_info "Parando containers..."
docker compose down
print_success "Containers parados!"
echo ""

# ============================================================================
# 4. LIMPAR RECURSOS (OPCIONAL)
# ============================================================================

print_info "Deseja limpar imagens antigas? (s/n)"
read -r prune_choice

if [ "$prune_choice" = "s" ] || [ "$prune_choice" = "S" ]; then
    print_info "Limpando imagens antigas..."
    docker image prune -f
    print_success "Imagens antigas removidas!"
    echo ""
fi

# ============================================================================
# 5. REBUILD E RESTART
# ============================================================================

print_info "Recriando containers com novas configurações..."
docker compose up -d --build --force-recreate

print_success "Containers recriados!"
echo ""

# ============================================================================
# 6. AGUARDAR INICIALIZAÇÃO
# ============================================================================

print_info "Aguardando inicialização dos serviços..."
echo ""

# Aguardar PostgreSQL (max 30 segundos)
print_info "Aguardando PostgreSQL..."
for i in {1..30}; do
    if docker exec win-marketplace-db pg_isready -U postgres &> /dev/null; then
        print_success "PostgreSQL pronto! (${i}s)"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL não iniciou em 30 segundos!"
        exit 1
    fi
    
    echo -n "."
    sleep 1
done
echo ""

# Aguardar Backend (max 30 segundos)
print_info "Aguardando Backend Spring Boot..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health &> /dev/null; then
        print_success "Backend pronto! (${i}s)"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_warning "Backend não respondeu em 30 segundos (pode estar iniciando ainda)"
    fi
    
    echo -n "."
    sleep 1
done
echo ""

# ============================================================================
# 7. VALIDAR CONFIGURAÇÕES
# ============================================================================

print_info "Validando configurações PostgreSQL..."
echo ""

# Verificar shared_buffers
SHARED_BUFFERS=$(docker exec win-marketplace-db psql -U postgres -t -c "SHOW shared_buffers;" | xargs)
print_info "shared_buffers: $SHARED_BUFFERS (esperado: 768MB)"

# Verificar effective_cache_size
CACHE_SIZE=$(docker exec win-marketplace-db psql -U postgres -t -c "SHOW effective_cache_size;" | xargs)
print_info "effective_cache_size: $CACHE_SIZE (esperado: 2GB)"

# Verificar work_mem
WORK_MEM=$(docker exec win-marketplace-db psql -U postgres -t -c "SHOW work_mem;" | xargs)
print_info "work_mem: $WORK_MEM (esperado: 16MB)"

# Verificar max_connections
MAX_CONN=$(docker exec win-marketplace-db psql -U postgres -t -c "SHOW max_connections;" | xargs)
print_info "max_connections: $MAX_CONN (esperado: 100)"

echo ""

# ============================================================================
# 8. VERIFICAR USO DE RECURSOS
# ============================================================================

print_info "Uso de recursos (aguarde 5 segundos para estabilizar)..."
sleep 5
echo ""

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""

# ============================================================================
# 9. VERIFICAR LOGS
# ============================================================================

print_info "Verificando logs (últimas 20 linhas)..."
echo ""

print_info "=== BACKEND ==="
docker logs win-marketplace-backend --tail 20
echo ""

print_info "=== POSTGRESQL ==="
docker logs win-marketplace-db --tail 20
echo ""

# ============================================================================
# 10. TESTES DE SAÚDE
# ============================================================================

print_info "Executando testes de saúde..."
echo ""

# Testar Backend
if curl -s http://localhost:8080/actuator/health | grep -q "UP"; then
    print_success "Backend respondendo: http://localhost:8080"
else
    print_warning "Backend não está respondendo (verifique logs)"
fi

# Testar Frontend
if curl -s http://localhost:3000 &> /dev/null; then
    print_success "Frontend respondendo: http://localhost:3000"
else
    print_warning "Frontend não está respondendo"
fi

# Testar PostgreSQL
if docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT 1;" &> /dev/null; then
    print_success "PostgreSQL conectado e operacional"
else
    print_warning "PostgreSQL não está respondendo"
fi

echo ""

# ============================================================================
# 11. RESUMO FINAL
# ============================================================================

echo "============================================================================"
print_success "🎉 Deploy concluído com sucesso!"
echo "============================================================================"
echo ""

print_info "📊 URLs dos Serviços:"
echo "  • Frontend:    http://localhost:3000"
echo "  • Backend API: http://localhost:8080/api"
echo "  • Health:      http://localhost:8080/actuator/health"
echo ""

print_info "📈 Monitoramento:"
echo "  • Recursos:    docker stats"
echo "  • Logs Backend: docker logs -f win-marketplace-backend"
echo "  • Logs DB:      docker logs -f win-marketplace-db"
echo ""

print_info "🔧 Configurações Aplicadas:"
echo "  • Backend:  CPU 1.25 vCPU, MEM 2GB, JVM Heap 1.5GB"
echo "  • PostgreSQL: CPU 0.5 vCPU, MEM 1GB, Shared Buffers 768MB"
echo ""

print_warning "⚠️  PRÓXIMOS PASSOS:"
echo "  1. Monitore o uso de CPU/Memória por 24-48h"
echo "  2. Verifique se CPU total VPS < 70%"
echo "  3. Ajuste limites se necessário"
echo "  4. Configure alertas no painel DigitalOcean"
echo ""

print_info "📚 Documentação completa: _DOCS/OTIMIZACAO_PRODUCAO.md"
echo ""

echo "============================================================================"
print_success "✅ Sistema otimizado e pronto para uso!"
echo "============================================================================"
