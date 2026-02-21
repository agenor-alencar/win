#!/bin/bash
# Script para deploy completo das correções de pagamento PIX
# Aplica todas as correções: lojistas, fluxo de pagamento e QR Code PIX
# Data: 21/02/2026

echo "🚀 Deploy Completo - Correções de Pagamento PIX"
echo "=============================================="
echo ""
echo "📋 Correções que serão aplicadas:"
echo "  1. ✅ Acesso às páginas de lojistas (403 Forbidden)"
echo "  2. ✅ Fluxo de pagamento e autorizações"
echo "  3. ✅ Exibição de QR Code PIX"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "win-frontend" ]; then
    echo "❌ Erro: Execute este script no diretório ~/win"
    exit 1
fi

# Fazer backup completo
echo "📦 Criando backup completo..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/deploy-completo-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Backend
cp "backend/src/main/java/com/win/marketplace/security/JwtAuthenticationFilter.java" \
   "$BACKUP_DIR/JwtAuthenticationFilter.java.backup"
   
cp "backend/src/main/java/com/win/marketplace/controller/PedidoController.java" \
   "$BACKUP_DIR/PedidoController.java.backup"
   
cp "backend/src/main/java/com/win/marketplace/config/SecurityConfig.java" \
   "$BACKUP_DIR/SecurityConfig.java.backup"
   
cp "backend/src/main/java/com/win/marketplace/service/PagamentoService.java" \
   "$BACKUP_DIR/PagamentoService.java.backup"

# Frontend
mkdir -p "$BACKUP_DIR/frontend"
cp "win-frontend/src/pages/shared/PaymentPix.tsx" \
   "$BACKUP_DIR/frontend/PaymentPix.tsx.backup"

echo "✅ Backup criado em $BACKUP_DIR/"
echo ""

# Verificar se as correções já foram aplicadas
echo "🔍 Verificando se as correções já estão aplicadas..."
echo ""

NEEDS_UPDATE=0

# Verificar JwtAuthenticationFilter
if grep -q 'requestPath.startsWith("/api/v1/lojistas")' \
   "backend/src/main/java/com/win/marketplace/security/JwtAuthenticationFilter.java"; then
    echo "⚠️  JwtAuthenticationFilter precisa de correção"
    NEEDS_UPDATE=1
else
    echo "✅ JwtAuthenticationFilter já corrigido"
fi

# Verificar PedidoController
if grep -q '@PreAuthorize("hasRole('"'"'ADMIN'"'"')")' \
   "backend/src/main/java/com/win/marketplace/controller/PedidoController.java" | head -n 60 | tail -n 10; then
    echo "⚠️  PedidoController precisa de correção"
    NEEDS_UPDATE=1
else
    echo "✅ PedidoController já corrigido"
fi

# Verificar SecurityConfig
if ! grep -q 'pagamentos/pedido/\*/pix' \
   "backend/src/main/java/com/win/marketplace/config/SecurityConfig.java"; then
    echo "⚠️  SecurityConfig precisa de correção"
    NEEDS_UPDATE=1
else
    echo "✅ SecurityConfig já corrigido"
fi

# Verificar PagamentoService
if grep -q 'charges.get("data")' \
   "backend/src/main/java/com/win/marketplace/service/PagamentoService.java"; then
    echo "⚠️  PagamentoService precisa de correção"
    NEEDS_UPDATE=1
else
    echo "✅ PagamentoService já corrigido"
fi

# Verificar PaymentPix.tsx
if grep -q 'from "../../../shared/api"' \
   "win-frontend/src/pages/shared/PaymentPix.tsx"; then
    echo "⚠️  PaymentPix.tsx precisa de correção"
    NEEDS_UPDATE=1
else
    echo "✅ PaymentPix.tsx já corrigido"
fi

echo ""

if [ $NEEDS_UPDATE -eq 0 ]; then
    echo "✅ Todas as correções já estão aplicadas!"
    echo ""
    read -p "Deseja fazer rebuild e restart mesmo assim? (s/N): " REBUILD
    if [ "$REBUILD" != "s" ] && [ "$REBUILD" != "S" ]; then
        echo "Operação cancelada."
        exit 0
    fi
else
    echo "❌ Algumas correções precisam ser aplicadas manualmente."
    echo ""
    echo "📋 Instruções:"
    echo ""
    echo "1. Faça pull do repositório atualizado:"
    echo "   git pull origin main"
    echo ""
    echo "2. Ou aplique as correções manualmente conforme documentação em:"
    echo "   - _DOCS/CORRECAO_LOJISTAS_FORBIDDEN.md"
    echo "   - _DOCS/CORRECAO_FLUXO_PAGAMENTO.md"
    echo "   - _DOCS/CORRECAO_QRCODE_PIX.md"
    echo ""
    read -p "As correções foram aplicadas? (s/N): " APPLIED
    if [ "$APPLIED" != "s" ] && [ "$APPLIED" != "S" ]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

echo ""
echo "🔨 Iniciando build e deploy..."
echo ""

# Recompilar backend
echo "📦 Compilando backend..."
cd backend
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação do backend"
    echo "Restaurando backup..."
    cp "$BACKUP_DIR"/*.backup "../backend/src/main/java/com/win/marketplace/"
    exit 1
fi

echo "✅ Backend compilado com sucesso!"
echo ""

# Rebuild Docker (Backend e Frontend)
cd ..
echo "🐳 Reconstruindo containers Docker..."
docker compose build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao construir imagens Docker"
    exit 1
fi

echo "✅ Imagens Docker criadas!"
echo ""

# Parar containers
echo "🛑 Parando containers..."
docker compose down

# Iniciar containers
echo "🚀 Iniciando containers..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Erro ao iniciar containers"
    exit 1
fi

echo "✅ Containers iniciados!"
echo ""

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar (30s)..."
sleep 30

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker compose ps
echo ""

# Últimos logs do backend
echo "📋 Últimas 30 linhas do log do backend:"
docker compose logs --tail=30 backend
echo ""

echo "=============================================="
echo "✅ DEPLOY COMPLETO FINALIZADO!"
echo "=============================================="
echo ""
echo "🧪 Teste agora o fluxo completo:"
echo ""
echo "1. ✅ Acesse o site como lojista"
echo "   - Faça login"
echo "   - Acesse 'Meus Produtos'"
echo "   - Deve carregar sem erro 403"
echo ""
echo "2. ✅ Teste o fluxo de pagamento"
echo "   - Adicione produtos ao carrinho"
echo "   - Finalize o pedido"
echo "   - Deve ver QR Code PIX completo"
echo "   - Código copia e cola deve aparecer"
echo ""
echo "3. ✅ Verifique 'Meus Pedidos'"
echo "   - Lista deve carregar sem erro"
echo "   - Pedidos devem aparecer corretamente"
echo ""
echo "🔍 Para monitorar logs em tempo real:"
echo "   docker compose logs -f backend"
echo ""
echo "📊 Para verificar logs específicos de pagamento:"
echo "   docker compose logs backend | grep -i 'pix\\|pagamento\\|qrcode'"
echo ""
