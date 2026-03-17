#!/bin/bash
# Script para configurar PagarMe SandBox em Produção na VPS
# Executar como: bash configurar-pagarme.sh

set -e

echo "🔧 Configurando PagarMe SandBox em Produção..."
echo ""

# Verificar se está na pasta correta
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERRO: docker-compose.yml não encontrado!"
    echo "Execute este script na raiz do projeto (/root/win-marketplace/)"
    exit 1
fi

# Backup do .env
echo "📦 Fazendo backup do .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"
echo ""

# Atualizar variáveis
echo "📝 Atualizando variáveis de ambiente..."

# Usar sed para atualizar
sed -i 's/^PAGARME_API_KEY=.*/PAGARME_API_KEY=acc_z3DoakwS0C5ag84p/' .env
sed -i 's/^PAGARME_PUBLIC_KEY=.*/PAGARME_PUBLIC_KEY=pk_lKy5xpKjtesp4ZLX/' .env
sed -i 's/^PAGARME_ENVIRONMENT=.*/PAGARME_ENVIRONMENT=test/' .env
sed -i 's/^PAGARME_ENABLED=.*/PAGARME_ENABLED=true/' .env

echo "✅ Variáveis atualizadas"
echo ""

# Mostrar valores configurados
echo "📋 Valores configurados:"
echo "---"
grep PAGARME .env
echo "---"
echo ""

# Parar e rebuild
echo "🛑 Parando containers..."
docker compose down
echo "✅ Containers parados"
echo ""

echo "🔨 Reconstruindo backend..."
docker compose up -d --build backend
echo ""

# Aguardar inicialização
echo "⏳ Aguardando inicialização do backend (30s)..."
sleep 30
echo ""

# Verificar status
echo "✅ Verificando status..."
docker compose logs backend | grep -i "pagar" || echo "⚠️ Log não encontrado (verificar manualmente)"
echo ""

echo "✅ Configuração concluída!"
echo ""
echo "📌 Próximas etapas:"
echo "1. Testar acesso ao aplicativo"
echo "2. Testar pagamento PIX"
echo "3. Monitorar logs: docker compose logs -f backend"
echo ""
