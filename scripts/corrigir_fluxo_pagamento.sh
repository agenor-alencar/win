#!/bin/bash
# Script para aplicar correção do fluxo de pagamento PIX
# Data: 21/02/2026

echo "🔧 Aplicando correção do fluxo de pagamento PIX"
echo "==============================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script no diretório ~/win"
    exit 1
fi

# Fazer backup dos arquivos
echo "📦 Fazendo backup dos arquivos..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/$TIMESTAMP

cp "backend/src/main/java/com/win/marketplace/controller/PedidoController.java" \
   "backups/$TIMESTAMP/PedidoController.java.backup"
   
cp "backend/src/main/java/com/win/marketplace/config/SecurityConfig.java" \
   "backups/$TIMESTAMP/SecurityConfig.java.backup"

echo "✅ Backup criado em backups/$TIMESTAMP/"
echo ""

# Aplicar correção no PedidoController
echo "🔨 Aplicando correção no PedidoController.java..."
PEDIDO_FILE="backend/src/main/java/com/win/marketplace/controller/PedidoController.java"

# Substituir @PreAuthorize("hasRole('ADMIN')") por @PreAuthorize("isAuthenticated()")
# na seção específica
sed -i '/Listar pedidos por usuário/,/@GetMapping.*\/usuario\/{usuarioId}/s/@PreAuthorize("hasRole('\''ADMIN'\'')"))/@PreAuthorize("isAuthenticated()")/g' "$PEDIDO_FILE"

# Verificar se a correção foi aplicada
if grep -q '@PreAuthorize("isAuthenticated()")' "$PEDIDO_FILE"; then
    echo "✅ PedidoController corrigido!"
else
    echo "❌ Erro ao corrigir PedidoController. Restaurando backup..."
    cp "backups/$TIMESTAMP/PedidoController.java.backup" "$PEDIDO_FILE"
    exit 1
fi
echo ""

# Aplicar correção no SecurityConfig
echo "🔨 Aplicando correção no SecurityConfig.java..."
SECURITY_FILE="backend/src/main/java/com/win/marketplace/config/SecurityConfig.java"

# Adicionar as duas novas linhas após .requestMatchers("/api/v1/webhooks/**").permitAll()
sed -i '/\.requestMatchers("\/api\/v1\/webhooks\/\*\*")\.permitAll()/a\                .requestMatchers("/api/v1/pagamentos/webhooks/**").permitAll() \/\/ Webhooks de pagamento\n                .requestMatchers(HttpMethod.GET, "/api/v1/pagamentos/pedido/*/pix").permitAll() \/\/ Página de pagamento PIX pública' "$SECURITY_FILE"

# Verificar se as correções foram aplicadas
if grep -q 'pagamentos/webhooks' "$SECURITY_FILE" && grep -q 'pagamentos/pedido/\*/pix' "$SECURITY_FILE"; then
    echo "✅ SecurityConfig corrigido!"
else
    echo "❌ Erro ao corrigir SecurityConfig. Restaurando backups..."
    cp "backups/$TIMESTAMP/PedidoController.java.backup" "$PEDIDO_FILE"
    cp "backups/$TIMESTAMP/SecurityConfig.java.backup" "$SECURITY_FILE"
    exit 1
fi
echo ""

# Recompilar
echo "🔨 Recompilando o backend..."
cd backend
./mvnw clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Compilação bem-sucedida!"
else
    echo "❌ Erro na compilação. Restaurando backups..."
    cp "../backups/$TIMESTAMP/PedidoController.java.backup" "$PEDIDO_FILE"
    cp "../backups/$TIMESTAMP/SecurityConfig.java.backup" "$SECURITY_FILE"
    exit 1
fi
echo ""

# Rebuild Docker
cd ..
echo "🐳 Reconstruindo imagem Docker..."
docker compose build backend

if [ $? -eq 0 ]; then
    echo "✅ Imagem Docker criada!"
else
    echo "❌ Erro ao criar imagem Docker."
    exit 1
fi
echo ""

# Reiniciar serviços
echo "🔄 Reiniciando serviços..."
docker compose down
docker compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Serviços reiniciados!"
else
    echo "❌ Erro ao reiniciar serviços."
    exit 1
fi
echo ""

echo "==============================================="
echo "✅ CORREÇÃO APLICADA COM SUCESSO!"
echo "==============================================="
echo ""
echo "📊 Verificando status dos containers..."
docker compose ps
echo ""
echo "📋 Últimas linhas do log do backend:"
docker compose logs --tail=30 backend
echo ""
echo "🔍 Para verificar os logs completos, execute:"
echo "   docker compose logs -f backend"
echo ""
echo "✅ Teste agora o fluxo completo:"
echo "   1. Acesse o site e adicione produtos ao carrinho"
echo "   2. Finalize o pedido"
echo "   3. Deve visualizar o QR Code PIX corretamente"
echo "   4. Acesse 'Meus Pedidos' - deve carregar sem erro 403"
echo ""
