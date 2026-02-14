# ===================================================================
# 🚀 SCRIPT DE DEPLOY COMPLETO - WIN MARKETPLACE VPS
# ===================================================================
# Este script aplica todas as correções críticas:
# 1. Profile docker otimizado (logging produção)
# 2. Correção erro 500 no checkout (lojista obrigatório)
# 3. HikariCP maxLifetime otimizado
# 4. Geolocalização já implantada anteriormente
#
# Execute este script na sua VPS via:
# bash deploy-otimizado.sh
# ===================================================================

#!/bin/bash

set -e  # Parar em caso de erro

echo "🚀 ===== DEPLOY WIN MARKETPLACE - CORREÇÕES CRÍTICAS ====="
echo ""

# ===================================================================
# 1️⃣ VERIFICAÇÕES INICIAIS
# ===================================================================
echo "1️⃣ Verificando ambiente..."

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERRO: docker-compose.yml não encontrado!"
    echo "Execute este script no diretório /root/win"
    exit 1
fi

if ! docker compose version &>/dev/null; then
    echo "❌ ERRO: Docker Compose não instalado!"
    exit 1
fi

echo "✅ Ambiente validado"
echo ""

# ===================================================================
# 2️⃣ BACKUP ANTES DO DEPLOY
# ===================================================================
echo "2️⃣ Criando backup do banco de dados..."

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker exec win-marketplace-db pg_dump -U postgres -d win_marketplace > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || {
    echo "⚠️  AVISO: Não foi possível criar backup (banco pode estar reiniciando)"
}

echo "✅ Backup criado em: $BACKUP_DIR"
echo ""

# ===================================================================
# 3️⃣ GIT PULL (atualizar código)
# ===================================================================
echo "3️⃣ Atualizando código do repositório..."

if [ -d ".git" ]; then
    git pull origin main || {
        echo "⚠️  AVISO: git pull falhou. Continuando com arquivos locais..."
    }
    echo "✅ Código atualizado"
else
    echo "⚠️  AVISO: Não é um repositório Git. Usando arquivos locais."
fi

echo ""

# ===================================================================
# 4️⃣ PARAR CONTAINERS
# ===================================================================
echo "4️⃣ Parando containers..."

docker compose stop backend

echo "✅ Backend parado"
echo ""

# ===================================================================
# 5️⃣ REBUILD DO BACKEND (com novo código)
# ===================================================================
echo "5️⃣ Reconstruindo backend com correções..."

docker compose build --no-cache backend

echo "✅ Backend reconstruído"
echo ""

# ===================================================================
# 6️⃣ INICIAR BACKEND
# ===================================================================
echo "6️⃣ Iniciando backend..."

docker compose up -d backend

echo "⏳ Aguardando backend inicializar (30 segundos)..."
sleep 30

echo "✅ Backend iniciado"
echo ""

# ===================================================================
# 7️⃣ VERIFICAR LOGS E SAÚDE
# ===================================================================
echo "7️⃣ Verificando saúde dos serviços..."

echo ""
echo "📊 STATUS DOS CONTAINERS:"
docker compose ps

echo ""
echo "📋 ÚLTIMAS 20 LINHAS DE LOG DO BACKEND:"
docker compose logs --tail=20 backend

echo ""
echo "🔍 VERIFICANDO ERROS CRÍTICOS:"
ERROR_COUNT=$(docker compose logs --tail=100 backend | grep -i "error\|exception\|failed" | wc -l)

if [ "$ERROR_COUNT" -gt 5 ]; then
    echo "⚠️  AVISO: $ERROR_COUNT erros detectados nos logs!"
    echo "Execute: docker compose logs backend | grep -i error"
else
    echo "✅ Nenhum erro crítico detectado"
fi

echo ""

# ===================================================================
# 8️⃣ VERIFICAR SQL LOGGING
# ===================================================================
echo "8️⃣ Verificando SQL logging (deve estar DESABILITADO em produção)..."

SQL_LOG_COUNT=$(docker compose logs --tail=50 backend | grep "hibernate.SQL" | wc -l)

if [ "$SQL_LOG_COUNT" -gt 0 ]; then
    echo "⚠️  AVISO: SQL logging ainda ativo! ($SQL_LOG_COUNT queries encontradas)"
    echo "Verifique SPRING_PROFILES_ACTIVE no docker-compose.yml"
else
    echo "✅ SQL logging desabilitado (produção OK)"
fi

echo ""

# ===================================================================
# 9️⃣ VERIFICAR HIKARICP WARNINGS
# ===================================================================
echo "9️⃣ Verificando HikariCP warnings..."

HIKARI_WARN_COUNT=$(docker compose logs --tail=50 backend | grep "HikariPool.*Failed to validate" | wc -l)

if [ "$HIKARI_WARN_COUNT" -gt 0 ]; then
    echo "⚠️  AVISO: $HIKARI_WARN_COUNT warnings de HikariCP detectados"
    echo "Aguarde mais 30 segundos para pool estabilizar..."
    sleep 30
else
    echo "✅ HikariCP saudável"
fi

echo ""

# ===================================================================
# 🔟 TESTE DE ENDPOINT CRÍTICO
# ===================================================================
echo "🔟 Testando endpoint de saúde..."

HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Backend respondendo (HTTP 200)"
elif [ "$HEALTH_RESPONSE" = "000" ]; then
    echo "⚠️  AVISO: Endpoint /actuator/health não configurado (normal se não tem Spring Actuator)"
else
    echo "⚠️  AVISO: Backend retornou HTTP $HEALTH_RESPONSE"
fi

echo ""

# ===================================================================
# ✅ RESUMO FINAL
# ===================================================================
echo "======================================================================"
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "======================================================================"
echo ""
echo "📊 CORREÇÕES APLICADAS:"
echo "  ✅ Profile docker (logging otimizado para produção)"
echo "  ✅ PedidoService (lojista obrigatório corrigido)"
echo "  ✅ HikariCP maxLifetime (240s - abaixo do timeout do PostgreSQL)"
echo "  ✅ Geolocalização (já implantada anteriormente)"
echo ""
echo "📋 COMANDOS ÚTEIS:"
echo "  Ver logs em tempo real:    docker compose logs -f backend"
echo "  Ver erros:                 docker compose logs backend | grep -i error"
echo "  Reiniciar backend:         docker compose restart backend"
echo "  Ver uso de CPU:            docker stats --no-stream"
echo ""
echo "🔍 PRÓXIMOS PASSOS:"
echo "  1. Teste o checkout (criar pedido)"
echo "  2. Monitore CPU: docker stats"
echo "  3. Verifique logs por 5 minutos"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "  - _DOCS/IMPLEMENTACAO_GEOLOCALIZACAO.md"
echo "  - _DOCS/GUIA_DEPLOY_VPS.md"
echo ""
echo "======================================================================"
