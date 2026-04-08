#!/bin/bash

################################################################################
# SCRIPT: configure-nginx.sh
# PROPÓSITO: Configurar NGINX nativo como reverse proxy profissional
# EXECUÇÃO: Rodado automaticamente após deploy via GitHub Actions
# SEGURANÇA: Backend permanece privado (127.0.0.1:8080)
################################################################################

set -e  # Parar em qualquer erro

echo "==============================================="
echo "🔧 Configurando NGINX como Reverse Proxy"
echo "==============================================="

# Variáveis
NGINX_CONFIG_SOURCE="/root/win/nginx.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available/win-marketplace"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled/win-marketplace"
NGINX_DEFAULT_ENABLED="/etc/nginx/sites-enabled/default"

# Verificar se nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "❌ NGINX não está instalado!"
    echo "Instalando NGINX..."
    apt-get update > /dev/null 2>&1
    apt-get install -y nginx > /dev/null 2>&1
    echo "✅ NGINX instalado"
fi

# Verificar se arquivo de config do projeto existe
if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
    echo "❌ Arquivo nginx.conf não encontrado em: $NGINX_CONFIG_SOURCE"
    exit 1
fi

echo "📋 Copiando nginx.conf para sites-available..."
cp "$NGINX_CONFIG_SOURCE" "$NGINX_SITES_AVAILABLE"
chmod 644 "$NGINX_SITES_AVAILABLE"

echo "🔗 Habilitando site com symlink..."
# Remover default se existe
if [ -L "$NGINX_DEFAULT_ENABLED" ]; then
    rm "$NGINX_DEFAULT_ENABLED"
    echo "✅ Desabilitado site default"
fi

# Criar symlink para o novo site
ln -sf "$NGINX_SITES_AVAILABLE" "$NGINX_SITES_ENABLED"
echo "✅ Site win-marketplace habilitado"

# Testar sintaxe do nginx.conf
echo "🔍 Testando sintaxe de configuração..."
if nginx -t > /dev/null 2>&1; then
    echo "✅ Sintaxe correta"
else
    echo "❌ Erro na sintaxe do nginx.conf!"
    nginx -t
    exit 1
fi

# Recarregar nginx
echo "🔄 Recarregando NGINX..."
systemctl reload nginx

# Aguardar nginx ficar pronto
sleep 2

# Verificar status
if systemctl is-active --quiet nginx; then
    echo "✅ NGINX está ativo e rodando"
else
    echo "❌ Erro ao ativar NGINX"
    systemctl status nginx
    exit 1
fi

# Teste de conectividade
echo "🌐 Testando conectividade..."
if curl -s http://127.0.0.1/ > /dev/null; then
    echo "✅ NGINX respondendo na porta 80"
else
    echo "⚠️  NGINX pode não estar respondendo (isso é normal se frontend ainda não subiu)"
fi

echo ""
echo "==============================================="
echo "✅ NGINX configurado com sucesso!"
echo "==============================================="
echo ""
echo "📝 Configuração:"
echo "   - Front-end: http://localhost/   (proxy → 127.0.0.1:3000)"
echo "   - Backend:   http://localhost/api/ (proxy → 127.0.0.1:8080)"
echo "   - Rate limiting ativado para /api/v1/auth/login"
echo "   - CSP headers configurados"
echo ""
echo "🔒 Segurança:"
echo "   - Backend privado em 127.0.0.1:8080 (inacessível diretamente)"
echo "   - NGINX aceita conexões externas (0.0.0.0:80)"
echo "   - NGINX faz proxy inteligente com rate limiting"
echo ""
