# 🔒 Configuração SSL/HTTPS - Win Marketplace

## 📱 Problema Identificado

**Sintoma:** Erro "Esta Conexão Não É Privada" em dispositivos móveis ao acessar `www.winmarketplace.com.br`

**Causa:** O site está configurado apenas para HTTP (porta 80). Navegadores móveis modernos, especialmente Safari no iOS, bloqueiam ou exibem avisos de segurança para sites sem HTTPS.

**Solução:** Configurar certificado SSL/HTTPS usando Let's Encrypt (gratuito).

---

## 🎯 Solução Rápida

### Passo 1: Conectar ao VPS

```bash
ssh root@137.184.87.106
```

### Passo 2: Instalar Certbot

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Certbot e plugin Nginx
apt install certbot python3-certbot-nginx -y

# Verificar instalação
certbot --version
```

### Passo 3: Obter Certificado SSL

```bash
# Certificado para o domínio e www
certbot --nginx -d winmarketplace.com.br -d www.winmarketplace.com.br

# OU se preferir apenas emitir sem configurar automaticamente:
# certbot certonly --nginx -d winmarketplace.com.br -d www.winmarketplace.com.br
```

**Durante o processo, será solicitado:**
1. **Email:** Para notificações de expiração
2. **Termos de serviço:** Aceite (A)
3. **Compartilhar email:** Opcional (Y/N)
4. **Redirecionar HTTP → HTTPS:** Escolha opção 2 (Sim)

### Passo 4: Verificar Certificado

```bash
# Verificar certificados gerados
ls -la /etc/letsencrypt/live/winmarketplace.com.br/

# Deve listar:
# - fullchain.pem (certificado completo)
# - privkey.pem (chave privada)
# - chain.pem (cadeia intermediária)
# - cert.pem (certificado)
```

### Passo 5: Atualizar Configuração Nginx (Opcional)

Se o Certbot não configurou automaticamente, ou para usar nossa configuração otimizada:

```bash
cd /root/win

# Fazer backup da configuração atual
cp /etc/nginx/sites-available/winmarketplace /etc/nginx/sites-available/winmarketplace.backup

# Copiar nova configuração com SSL
cp nginx-winmarketplace-ssl.conf /etc/nginx/sites-available/winmarketplace

# Testar configuração
nginx -t

# Se OK, aplicar
systemctl reload nginx
```

### Passo 6: Testar Acesso HTTPS

```bash
# Teste local
curl -I https://winmarketplace.com.br

# Deve retornar: HTTP/2 200 
```

**Teste no navegador:**
1. Acesse: https://winmarketplace.com.br
2. Verifique o cadeado verde 🔒
3. Teste no dispositivo móvel

---

## 🔄 Renovação Automática

### Configurar Renovação Automática do Certificado

Os certificados Let's Encrypt expiram a cada **90 dias**. Configure renovação automática:

```bash
# Testar renovação (dry-run)
certbot renew --dry-run

# Verificar cron job automático
systemctl status certbot.timer

# OU verificar no crontab
cat /etc/cron.d/certbot
```

**O Certbot já configura renovação automática por padrão!**

Para forçar renovação manual (se necessário):
```bash
certbot renew --force-renewal
systemctl reload nginx
```

---

## 🛠️ Configuração Manual Detalhada

### Se preferir configurar manualmente o Nginx:

#### 1. Backup da configuração atual
```bash
cp /etc/nginx/sites-available/winmarketplace /etc/nginx/sites-available/winmarketplace.old
```

#### 2. Editar configuração
```bash
nano /etc/nginx/sites-available/winmarketplace
```

#### 3. Adicionar bloco HTTPS (exemplo)
```nginx
# Redirecionar HTTP → HTTPS
server {
    listen 80;
    server_name winmarketplace.com.br www.winmarketplace.com.br;
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name winmarketplace.com.br www.winmarketplace.com.br;

    ssl_certificate /etc/letsencrypt/live/winmarketplace.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/winmarketplace.com.br/privkey.pem;
    
    # ... resto da configuração
}
```

#### 4. Testar e aplicar
```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Checklist de Validação

Após configurar SSL, verifique:

- [ ] **Site acessível via HTTPS:** https://winmarketplace.com.br
- [ ] **HTTP redireciona para HTTPS:** http://winmarketplace.com.br → https://...
- [ ] **Cadeado verde no navegador** 🔒
- [ ] **Sem avisos de segurança no mobile**
- [ ] **WWW funciona:** https://www.winmarketplace.com.br
- [ ] **API funciona via HTTPS:** https://winmarketplace.com.br/api/...
- [ ] **Imagens carregam via HTTPS:** https://winmarketplace.com.br/uploads/...

### Testes Específicos

```bash
# 1. Teste SSL Labs (Score A+)
# Acesse: https://www.ssllabs.com/ssltest/analyze.html?d=winmarketplace.com.br

# 2. Teste validade do certificado
openssl s_client -connect winmarketplace.com.br:443 -servername winmarketplace.com.br < /dev/null | openssl x509 -noout -dates

# 3. Teste HSTS
curl -I https://winmarketplace.com.br | grep -i strict

# Deve retornar:
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused" no mobile

**Causa:** Firewall bloqueando porta 443

**Solução:**
```bash
# Permitir HTTPS no firewall
ufw allow 443/tcp
ufw allow 'Nginx Full'
ufw status
```

### Erro: "Certificate not found"

**Causa:** Certificado não foi gerado ou está em local errado

**Solução:**
```bash
# Verificar certificados
certbot certificates

# Regenerar se necessário
certbot delete --cert-name winmarketplace.com.br
certbot --nginx -d winmarketplace.com.br -d www.winmarketplace.com.br
```

### Erro: "Mixed Content" (conteúdo misto)

**Causa:** Site em HTTPS carregando recursos HTTP

**Solução:**
```bash
# Verificar logs do navegador (Console F12)
# Atualizar URLs no código para usar HTTPS ou paths relativos

# Exemplo: mudar de
# http://winmarketplace.com.br/api/...
# para
# /api/... (relativo)
```

### Erro: "NET::ERR_CERT_COMMON_NAME_INVALID"

**Causa:** Certificado não inclui domínio acessado

**Solução:**
```bash
# Reemitir certificado com todos os domínios
certbot delete --cert-name winmarketplace.com.br
certbot --nginx -d winmarketplace.com.br -d www.winmarketplace.com.br -d 137.184.87.106
```

---

## 📊 Monitoramento

### Verificar Status SSL

```bash
# 1. Verificar Nginx
systemctl status nginx

# 2. Verificar certificados
certbot certificates

# 3. Logs de acesso HTTPS
tail -f /var/log/nginx/winmarketplace_ssl_access.log

# 4. Logs de erro
tail -f /var/log/nginx/winmarketplace_ssl_error.log

# 5. Verificar expiração
certbot certificates | grep "Expiry Date"
```

### Alertas de Expiração

Let's Encrypt envia emails automáticos **30 dias antes** da expiração. 

Para testar email de notificação:
```bash
certbot renew --dry-run
```

---

## 🔐 Headers de Segurança Adicionais

Nossa configuração já inclui headers de segurança:

1. **HSTS** - Force HTTPS por 2 anos
2. **X-Frame-Options** - Previne clickjacking
3. **X-Content-Type-Options** - Previne MIME sniffing
4. **X-XSS-Protection** - Proteção contra XSS
5. **Referrer-Policy** - Controle de informações do referrer

Para verificar:
```bash
curl -I https://winmarketplace.com.br | grep -E "Strict-Transport|X-Frame|X-Content|X-XSS|Referrer"
```

---

## 📱 Testar em Dispositivos Móveis

### iOS (Safari)
1. Acesse: https://winmarketplace.com.br
2. **Não deve** aparecer aviso de segurança
3. Toque no cadeado na barra de endereços
4. Verifique: "Conexão Segura"

### Android (Chrome)
1. Acesse: https://winmarketplace.com.br
2. Toque no cadeado
3. Verifique detalhes do certificado

### Teste Progressive Web App (PWA)
Com HTTPS configurado, é possível adicionar o site à tela inicial como app:
1. Acesse o site via HTTPS
2. Menu → "Adicionar à tela inicial"
3. Ícone do app aparece como aplicativo nativo

---

## 📚 Referências

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://eff-certbot.readthedocs.io/)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

## 🎉 Resultado Final

Após configurar SSL/HTTPS:

✅ **HTTP**: Dispositivos móveis acessam o site sem avisos  
✅ **HTTPS**: Conexão segura e criptografada  
✅ **SEO**: Google prioriza sites HTTPS  
✅ **PWA**: Permite instalação como app  
✅ **APIs**: Funcionalidades modernas requerem HTTPS (geolocalização, câmera, etc)  
✅ **Confiança**: Cadeado verde aumenta confiança dos usuários  

---

## 🚀 Próximos Passos

Após configurar SSL:

1. **Atualizar DNS** se necessário (já configurado)
2. **Atualizar variáveis de ambiente** frontend para usar HTTPS
3. **Configurar CDN** (opcional) - Cloudflare para cache e proteção
4. **Habilitar HTTP/3** (QUIC) para melhor performance mobile
5. **Preload HSTS** - Adicionar domínio à lista HSTS preload dos navegadores

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `tail -f /var/log/nginx/error.log`
2. Testar configuração: `nginx -t`
3. Verificar firewall: `ufw status`
4. Consultar documentação Let's Encrypt

**Problema resolvido!** 🔒✅
