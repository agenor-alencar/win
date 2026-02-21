#!/bin/bash
# Script para aplicar correção do erro 403 Forbidden nas páginas de lojistas
# Data: 21/02/2026

echo "🔧 Aplicando correção do erro 403 Forbidden - Páginas de Lojistas"
echo "================================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script no diretório ~/win"
    exit 1
fi

# Fazer backup do arquivo
echo "📦 Fazendo backup do arquivo original..."
ARQUIVO="backend/src/main/java/com/win/marketplace/security/JwtAuthenticationFilter.java"
cp "$ARQUIVO" "${ARQUIVO}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup criado"
echo ""

# Aplicar correção
echo "🔨 Aplicando correção no JwtAuthenticationFilter.java..."
sed -i '/requestPath.startsWith("\/api\/v1\/lojistas") ||/d' "$ARQUIVO"

# Verificar se a correção foi aplicada
if ! grep -q 'requestPath.startsWith("/api/v1/lojistas")' "$ARQUIVO"; then
    echo "✅ Correção aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar correção. Restaurando backup..."
    cp "${ARQUIVO}.backup.*" "$ARQUIVO" 2>/dev/null
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
    echo "❌ Erro na compilação. Verifique os logs acima."
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

echo "================================================================="
echo "✅ CORREÇÃO APLICADA COM SUCESSO!"
echo "================================================================="
echo ""
echo "📊 Verificando status dos containers..."
docker compose ps
echo ""
echo "📋 Últimas linhas do log do backend:"
docker compose logs --tail=20 backend
echo ""
echo "🔍 Para verificar os logs completos, execute:"
echo "   docker compose logs -f backend"
echo ""
echo "✅ Teste agora:"
echo "   1. Acesse o site como lojista"
echo "   2. Faça login"
echo "   3. Acesse 'Meus Produtos'"
echo "   4. Deve carregar sem erro 403 Forbidden"
echo ""
