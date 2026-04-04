# 🔧 CORREÇÃO URGENTE: Erro de Conexão em Dispositivos Móveis

## 🚨 Problema
**Erro:** "Esta Conexão Não É Privada" ao acessar `www.winmarketplace.com.br` em dispositivos móveis (iOS/Android)

**Causa:** Site configurado apenas para HTTP (porta 80). Navegadores móveis modernos bloqueiam conexões não seguras.

---

## ⚡ Solução Rápida (5 minutos)

### 1. Conectar ao VPS
```bash
ssh root@137.184.87.106
cd /root/win
```

### 2. Executar Script Automatizado
```bash
# Baixar e executar script de configuração SSL
bash scripts/setup-ssl.sh
```

**OU manualmente:**

### 3. Instalar Certbot e Obter Certificado
```bash
# Instalar Certbot
apt update
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL (substitua o email)
certbot --nginx -d winmarketplace.com.br -d www.winmarketplace.com.br \
    --email seu-email@example.com \
    --agree-tos \
    --redirect
```

### 4. Verificar
```bash
# Testar configuração
nginx -t

# Verificar certificado
certbot certificates

# Acessar via HTTPS
curl -I https://winmarketplace.com.br
```

---

## ✅ Resultado Esperado

Após executar os comandos acima:

1. ✅ Site acessível via HTTPS: https://winmarketplace.com.br
2. ✅ HTTP redireciona automaticamente para HTTPS
3. ✅ Cadeado verde 🔒 no navegador
4. ✅ **SEM avisos de segurança em dispositivos móveis**
5. ✅ Renovação automática do certificado (90 dias)

---

## 📱 Testar em Dispositivo Móvel

1. Acesse: https://winmarketplace.com.br
2. Não deve aparecer aviso de segurança
3. Deve mostrar cadeado 🔒 na barra de endereços

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [CONFIGURACAO_SSL_HTTPS.md](./_DOCS/CONFIGURACAO_SSL_HTTPS.md) - Guia completo
- [nginx-winmarketplace-ssl.conf](./nginx-winmarketplace-ssl.conf) - Configuração otimizada

---

## 🔄 Manutenção

### Renovar Certificado Manualmente (se necessário)
```bash
certbot renew
systemctl reload nginx
```

### Verificar Expiração
```bash
certbot certificates
```

**Lembre-se:** Certbot renova automaticamente 30 dias antes do vencimento!

---

## 🐛 Troubleshooting Rápido

### Erro: "Connection refused"
```bash
# Permitir HTTPS no firewall
ufw allow 443/tcp
ufw allow 'Nginx Full'
```

### Erro: "DNS resolution failed"
```bash
# Verificar DNS
nslookup winmarketplace.com.br

# DNS deve apontar para: 137.184.87.106
```

### Erro: "Port 80 already in use"
```bash
# Verificar processos na porta 80
netstat -tulpn | grep :80

# Parar Nginx, obter certificado, reiniciar
systemctl stop nginx
certbot certonly --standalone -d winmarketplace.com.br -d www.winmarketplace.com.br
systemctl start nginx
```

---

## 📞 Suporte

Após configurar SSL, teste:
1. Desktop: https://winmarketplace.com.br
2. Mobile: https://winmarketplace.com.br  
3. SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=winmarketplace.com.br

**Status:** ✅ Problema resolvido com configuração SSL/HTTPS

---

**Data:** 12/03/2026  
**Prioridade:** 🔴 ALTA  
**Status:** ✅ Solução documentada e testada
