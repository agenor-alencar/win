#!/bin/bash
# ============================================
# Script para Aplicar Correção de Imagens
# ============================================
# Execute este script no VPS via SSH

set -e

echo "=========================================="
echo "🔧 APLICANDO CORREÇÃO DE IMAGENS"
echo "=========================================="
echo ""

# 1. Navegar para o projeto
cd /root/win-marketplace || { echo "❌ Diretório não encontrado"; exit 1; }
echo "✅ Diretório do projeto encontrado"

# 2. Fazer backup do .env atual
if [ -f .env ]; then
    echo "📦 Fazendo backup do .env..."
    cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup criado"
else
    echo "⚠️ Arquivo .env não encontrado (será criado)"
fi

# 3. Atualizar código
echo ""
echo "🔄 Atualizando código do Git..."
git pull origin main
echo "✅ Código atualizado"

# 4. Verificar se STORAGE_TYPE existe no .env
echo ""
echo "🔍 Verificando configuração de storage..."
if grep -q "STORAGE_TYPE=" .env 2>/dev/null; then
    CURRENT_TYPE=$(grep "STORAGE_TYPE=" .env | cut -d'=' -f2)
    echo "📌 STORAGE_TYPE atual: $CURRENT_TYPE"
    
    if [ "$CURRENT_TYPE" != "s3" ]; then
        echo "⚠️ STORAGE_TYPE não está configurado como 's3'"
        echo "   Você precisa editar o .env manualmente"
    else
        echo "✅ STORAGE_TYPE já está configurado corretamente"
    fi
else
    echo "❌ STORAGE_TYPE não encontrado no .env"
    echo ""
    echo "⚠️ AÇÃO NECESSÁRIA:"
    echo "   Você precisa adicionar as seguintes variáveis ao .env:"
    echo ""
    cat << 'EOF'
# ========================================
# Storage Configuration (DigitalOcean Spaces)
# ========================================
STORAGE_TYPE=s3
SPACES_ACCESS_KEY=SUA_ACCESS_KEY_AQUI
SPACES_SECRET_KEY=SUA_SECRET_KEY_AQUI
SPACES_BUCKET_NAME=win-marketplace-storage
SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
SPACES_REGION=sfo3
EOF
    echo ""
    echo "   Execute: nano .env"
    echo "   Adicione as variáveis acima no final do arquivo"
    echo ""
    read -p "Pressione ENTER após editar o .env..." 
fi

# 5. Verificar se tem as chaves do Spaces
echo ""
echo "🔍 Verificando chaves do DigitalOcean Spaces..."
if grep -q "SPACES_ACCESS_KEY=" .env 2>/dev/null && grep -q "SPACES_SECRET_KEY=" .env 2>/dev/null; then
    ACCESS_KEY=$(grep "SPACES_ACCESS_KEY=" .env | cut -d'=' -f2)
    if [ "$ACCESS_KEY" != "SUA_ACCESS_KEY_AQUI" ] && [ -n "$ACCESS_KEY" ]; then
        echo "✅ Chaves do Spaces configuradas"
    else
        echo "❌ Chaves do Spaces não configuradas ou usando valor padrão"
        echo "⚠️ Obtenha as chaves em: https://cloud.digitalocean.com/account/api/tokens"
        exit 1
    fi
else
    echo "❌ Variáveis SPACES_ACCESS_KEY e SPACES_SECRET_KEY não encontradas"
    exit 1
fi

# 6. Parar containers
echo ""
echo "⏹️ Parando containers..."
docker compose down
echo "✅ Containers parados"

# 7. Rebuild do backend (importante!)
echo ""
echo "🔨 Fazendo rebuild do backend (isso pode demorar)..."
docker compose build backend --no-cache
echo "✅ Backend reconstruído"

# 8. Subir containers
echo ""
echo "🚀 Iniciando containers..."
docker compose up -d
echo "✅ Containers iniciados"

# 9. Aguardar backend inicializar
echo ""
echo "⏳ Aguardando backend inicializar (30 segundos)..."
sleep 30

# 10. Verificar logs
echo ""
echo "📋 Verificando logs do backend..."
echo ""
docker compose logs backend | grep -i "S3StorageService" | tail -5

# 11. Verificar variáveis de ambiente no container
echo ""
echo "🔍 Verificando variáveis de ambiente no container..."
docker exec win-marketplace-backend env | grep -E "STORAGE_TYPE|AWS_ACCESS_KEY_ID|S3_BUCKET_NAME" || echo "⚠️ Variáveis não encontradas"

# 12. Verificar saúde do backend
echo ""
echo "🏥 Verificando saúde do backend..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend está saudável (HTTP $HTTP_CODE)"
else
    echo "❌ Backend com problemas (HTTP $HTTP_CODE)"
    echo "   Verificando logs de erro..."
    docker compose logs --tail=50 backend
fi

echo ""
echo "=========================================="
echo "✅ CORREÇÃO APLICADA!"
echo "=========================================="
echo ""
echo "📝 Próximos passos:"
echo "1. Acesse o painel de lojista"
echo "2. Edite um produto e faça upload de uma nova imagem"
echo "3. Verifique que a imagem aparece no site"
echo "4. A URL da imagem deve conter: 'digitaloceanspaces.com'"
echo ""
echo "🔍 Para verificar logs em tempo real:"
echo "   docker compose logs -f backend"
echo ""
echo "⚠️ IMPORTANTE:"
echo "   - Imagens antigas (já cadastradas) não serão migradas automaticamente"
echo "   - Você precisa fazer novo upload das imagens antigas"
echo "   - Novas imagens serão salvas no DigitalOcean Spaces"
echo ""
