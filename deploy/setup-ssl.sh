#!/bin/bash

# 🔒 Script de Configuração SSL/HTTPS - Win Marketplace
# Automatiza a instalação de certificado SSL Let's Encrypt

set -e  # Parar em caso de erro

echo "=================================================="
echo "🔒 Configuração SSL/HTTPS - Win Marketplace"
echo "=================================================="
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script precisa ser executado como root"
    echo "   Use: sudo bash setup-ssl.sh"
    exit 1
fi

# Variáveis
DOMAIN="winmarketplace.com.br"
WWW_DOMAIN="www.winmarketplace.com.br"
EMAIL="seu-email@example.com"  # ALTERAR para seu email real
NGINX_CONF="/etc/nginx/sites-available/winmarketplace"
BACKUP_CONF="/etc/nginx/sites-available/winmarketplace.backup.$(date +%Y%m%d_%H%M%S)"

echo "📋 Configurações:"
echo "   Domínio: $DOMAIN"
echo "   WWW: $WWW_DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Verificar se email foi alterado
if [ "$EMAIL" = "seu-email@example.com" ]; then
    echo "⚠️  ATENÇÃO: Você precisa editar este script e definir seu email!"
    echo "   Abra o arquivo e altere a variável EMAIL no topo do script."
    echo ""
    read -p "Digite seu email para certificado SSL: " EMAIL
fi

# Confirmação
echo "=================================================="
echo "⚠️  IMPORTANTE: Este script irá:"
echo "   1. Instalar Certbot"
echo "   2. Obter certificado SSL para $DOMAIN e $WWW_DOMAIN"
echo "   3. Fazer backup da configuração atual do Nginx"
echo "   4. Configurar HTTPS no Nginx"
echo "   5. Reiniciar o Nginx"
echo "=================================================="
echo ""
read -p "Deseja continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "🚀 Iniciando configuração SSL..."
echo ""

# Passo 1: Atualizar sistema
echo "📦 [1/7] Atualizando sistema..."
apt update -qq

# Passo 2: Instalar Certbot
echo "📦 [2/7] Instalando Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx -qq
    echo "   ✅ Certbot instalado"
else
    echo "   ✅ Certbot já está instalado"
fi

# Passo 3: Verificar se Nginx está rodando
echo "🔍 [3/7] Verificando Nginx..."
if ! systemctl is-active --quiet nginx; then
    echo "   ⚠️  Nginx não está rodando, iniciando..."
    systemctl start nginx
fi
echo "   ✅ Nginx ativo"

# Passo 4: Fazer backup da configuração atual
echo "💾 [4/7] Fazendo backup da configuração atual do Nginx..."
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "$BACKUP_CONF"
    echo "   ✅ Backup salvo em: $BACKUP_CONF"
else
    echo "   ⚠️  Configuração não encontrada em $NGINX_CONF"
fi

# Passo 5: Verificar firewall
echo "🔥 [5/7] Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full' > /dev/null 2>&1 || true
    ufw allow 443/tcp > /dev/null 2>&1 || true
    echo "   ✅ Firewall configurado (portas 80 e 443)"
else
    echo "   ⚠️  UFW não encontrado, ignorando..."
fi

# Passo 6: Obter certificado SSL
echo "🔐 [6/7] Obtendo certificado SSL Let's Encrypt..."
echo "   Isso pode levar alguns minutos..."
echo ""

# Verificar se já existe certificado
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "   ⚠️  Certificado já existe!"
    read -p "   Deseja renovar/reemitir? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        certbot delete --cert-name "$DOMAIN" --non-interactive
        echo "   Certificado anterior removido"
    else
        echo "   ✅ Usando certificado existente"
    fi
fi

# Emitir certificado se não existir
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    certbot --nginx \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --redirect \
        --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Certificado SSL obtido com sucesso!"
    else
        echo "   ❌ Erro ao obter certificado SSL"
        echo "   Verifique:"
        echo "   - DNS está apontando para este servidor"
        echo "   - Domínio está acessível pela internet"
        echo "   - Portas 80 e 443 estão abertas"
        exit 1
    fi
fi

# Passo 7: Testar configuração do Nginx
echo "🧪 [7/7] Testando configuração do Nginx..."
if nginx -t > /dev/null 2>&1; then
    echo "   ✅ Configuração válida"
    
    # Recarregar Nginx
    systemctl reload nginx
    echo "   ✅ Nginx recarregado"
else
    echo "   ❌ Erro na configuração do Nginx"
    echo ""
    echo "   Restaurando backup..."
    if [ -f "$BACKUP_CONF" ]; then
        cp "$BACKUP_CONF" "$NGINX_CONF"
        systemctl reload nginx
        echo "   ✅ Backup restaurado"
    fi
    
    echo ""
    echo "   Execute 'nginx -t' para ver os erros"
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ CONFIGURAÇÃO SSL CONCLUÍDA COM SUCESSO!"
echo "=================================================="
echo ""
echo "📋 Informações do Certificado:"
certbot certificates 2>/dev/null | grep -A 3 "$DOMAIN" || true
echo ""
echo "🌐 Acesse seu site:"
echo "   https://$DOMAIN"
echo "   https://$WWW_DOMAIN"
echo ""
echo "🔄 Renovação Automática:"
echo "   Certificado expira em 90 dias"
echo "   Certbot renova automaticamente via cron/timer"
echo "   Para testar: certbot renew --dry-run"
echo ""
echo "🔍 Verificar SSL:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "📱 Teste no dispositivo móvel:"
echo "   1. Acesse https://$DOMAIN no navegador móvel"
echo "   2. Verifique se aparece o cadeado 🔒"
echo "   3. Não deve haver avisos de segurança"
echo ""
echo "=================================================="

# Teste final
echo "🧪 Teste de Conectividade:"
echo ""

# Teste HTTP (deve redirecionar)
echo -n "   HTTP → HTTPS: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ OK"
else
    echo "⚠️  Código: $HTTP_CODE"
fi

# Teste HTTPS
echo -n "   HTTPS: "
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ OK"
else
    echo "⚠️  Código: $HTTPS_CODE"
fi

# Teste HSTS
echo -n "   HSTS Header: "
HSTS=$(curl -s -I "https://$DOMAIN" 2>/dev/null | grep -i "strict-transport-security" || echo "")
if [ ! -z "$HSTS" ]; then
    echo "✅ OK"
else
    echo "⚠️  Não encontrado"
fi

echo ""
echo "✅ Configuração finalizada!"
echo "   Seu site agora está acessível via HTTPS"
echo "   Dispositivos móveis não terão mais avisos de segurança"
echo ""
