# 🚀 Setup Completo VPS do Zero - WIN Marketplace

> ✨ **Atualizado**: Código 100% configurável por variáveis de ambiente!  
> Agora você não precisa editar código Java para mudar de IP/domínio.

## 📋 Requisitos da VPS

- **Sistema Operacional**: Ubuntu 20.04 ou superior
- **RAM**: Mínimo 2GB (recomendado 4GB)
- **CPU**: Mínimo 1 vCPU (recomendado 2 vCPUs)
- **Disco**: Mínimo 20GB
- **IP Público**: 146.190.136.183 (ou o seu IP)

---

## PASSO 1: Configuração Inicial da VPS

### 1.1 Conectar na VPS via SSH
```bash
ssh root@146.190.136.183
```

### 1.2 Atualizar o Sistema
```bash
apt update && apt upgrade -y
```

### 1.3 Criar Usuário Não-Root (Segurança)
```bash
# Criar usuário
adduser winuser

# Adicionar ao grupo sudo
usermod -aG sudo winuser

# Testar (em outro terminal)
ssh winuser@146.190.136.183
```

**A partir daqui, use o usuário `winuser` ao invés de root!**

---

## PASSO 2: Instalar Docker e Docker Compose

### 2.1 Instalar Docker
```bash
# Remover versões antigas
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Adicionar usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Aplicar mudanças (ou faça logout/login)
newgrp docker

# Testar
docker --version
docker run hello-world
```

### 2.2 Instalar Docker Compose
```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Testar
docker-compose --version
```

---

## PASSO 3: Instalar Git

```bash
sudo apt install -y git
git --version
```

---

## PASSO 4: Configurar Firewall (Segurança)

```bash
# Verificar status
sudo ufw status

# Permitir SSH (IMPORTANTE! Faça isso ANTES de habilitar)
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS
sudo ufw allow 443/tcp

# Permitir porta do backend (temporário para testes)
sudo ufw allow 8080/tcp

# Permitir porta do frontend (temporário para testes)
sudo ufw allow 3000/tcp

# Habilitar firewall
sudo ufw enable

# Verificar regras
sudo ufw status verbose
```

---

## PASSO 5: Clonar o Projeto

### 5.1 Configurar SSH do GitHub (Recomendado)
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu_email@example.com"
# Pressione Enter 3 vezes (sem senha por enquanto)

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
```

**Copie a chave e adicione em**: https://github.com/settings/keys → New SSH Key

### 5.2 Clonar o Repositório
```bash
cd ~
git clone git@github.com:ArthurJsph/win-grupo1.git

# Ou se preferir HTTPS:
git clone https://github.com/ArthurJsph/win-grupo1.git

cd win-grupo1
```

---

## PASSO 6: Configurar Variáveis de Ambiente

### 6.1 Criar `.env` na Raiz do Projeto
```bash
nano .env
```

Cole o seguinte conteúdo (substitua `SEU_IP_DA_VPS` pelo IP real):
```bash
# ====================================
# BACKEND - Spring Boot
# ====================================
SPRING_PROFILES_ACTIVE=docker
HIBERNATE_DDL_AUTO=update
TZ=America/Sao_Paulo

# ====================================
# CORS - Configure com o IP da sua VPS
# ====================================
# ⚠️ IMPORTANTE: Substitua SEU_IP_DA_VPS pelo IP real (ex: 146.190.136.183)
ALLOWED_ORIGINS=http://SEU_IP_DA_VPS,http://SEU_IP_DA_VPS:3000,https://SEU_IP_DA_VPS

# Exemplo com IP 146.190.136.183:
# ALLOWED_ORIGINS=http://146.190.136.183,http://146.190.136.183:3000,https://146.190.136.183

# ====================================
# DATABASE - PostgreSQL
# ====================================
POSTGRES_DB=win_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SuaSenhaSeguraAqui123!

# ====================================
# EMAIL - SendGrid (Opcional)
# ====================================
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
SENDGRID_API_KEY=
MAIL_FROM=

# ====================================
# MERCADO PAGO (Opcional)
# ====================================
MERCADOPAGO_ACCESS_TOKEN=

# ====================================
# DEV TOOLS
# ====================================
DEV_TOOLS_ENABLED=true
```

**Salve**: `Ctrl+O` → `Enter` → `Ctrl+X`

**⚠️ IMPORTANTE**: 
- **OBRIGATÓRIO**: Substitua `SEU_IP_DA_VPS` pelo IP real da sua VPS em `ALLOWED_ORIGINS`
- Altere a senha do PostgreSQL (`POSTGRES_PASSWORD`)
- Configure `MERCADOPAGO_ACCESS_TOKEN` se for usar pagamentos
- Configure variáveis de email (`SENDGRID_API_KEY`) se for usar envio de emails

### 6.2 Configurar Frontend (OPCIONAL)

**O frontend agora detecta automaticamente o ambiente!** 🎉

Você só precisa criar `.env` no frontend se:
- Quiser forçar uma URL específica OU
- Estiver usando domínio personalizado

```bash
cd win-frontend
nano .env
```

Cole (opcional):
```bash
# Somente se quiser forçar URL específica
VITE_API_BASE_URL=http://SEU_IP_DA_VPS:8080

# Exemplo com IP:
# VITE_API_BASE_URL=http://146.190.136.183:8080

# Ou com domínio:
# VITE_API_BASE_URL=https://api.seudominio.com
```

**Se NÃO criar o `.env`**, o frontend usará detecção automática:
- Localhost → `http://localhost:8080`
- VPS → `http://SEU_IP:8080`

Volte para raiz:
```bash
cd ..
```

---

## PASSO 7: Construir e Iniciar os Containers

### 7.1 Construir as Imagens
```bash
docker-compose build --no-cache
```

**Isso vai demorar 5-10 minutos na primeira vez!** ☕

### 7.2 Iniciar os Containers
```bash
docker-compose up -d
```

### 7.3 Verificar Status
```bash
docker-compose ps
```

Você deve ver 3 containers rodando:
- `win-marketplace-backend`
- `win-marketplace-frontend`
- `win-marketplace-db`

---

## PASSO 8: Verificar Logs e Testar

### 8.1 Verificar Logs do Backend
```bash
docker logs win-marketplace-backend --tail 100 -f
```

**Procure por**: `Started WinMarketApplication in X seconds`  
**Pressione** `Ctrl+C` para sair

### 8.2 Verificar Logs do Frontend
```bash
docker logs win-marketplace-frontend --tail 100 -f
```

**Procure por**: `VITE v6.3.5 ready in X ms`  
**Pressione** `Ctrl+C` para sair

### 8.3 Testar Backend (Health Check)
```bash
curl http://localhost:8080/actuator/health
```

**Resultado esperado**: `{"status":"UP"}`

### 8.4 Testar Frontend
```bash
curl http://localhost:3000
```

**Resultado esperado**: HTML da página inicial

### 8.5 Testar do seu Computador
Abra o navegador e acesse: `http://146.190.136.183`

---

## PASSO 9: Instalar e Configurar Nginx (Proxy Reverso)

### 9.1 Instalar Nginx
```bash
sudo apt install -y nginx
```

### 9.2 Criar Configuração do Site
```bash
sudo nano /etc/nginx/sites-available/win-marketplace
```

Cole o seguinte conteúdo:
```nginx
server {
    listen 80;
    server_name 146.190.136.183;
    
    # Tamanho máximo de upload (para imagens de produtos)
    client_max_body_size 20M;

    # Frontend - Interface do usuário
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout aumentado para operações lentas
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout aumentado
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # Headers CORS (importante!)
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
        
        # Responder OPTIONS com 204
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Health Check do Backend
    location /actuator/ {
        proxy_pass http://localhost:8080/actuator/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Upload de Arquivos
    location /uploads/ {
        proxy_pass http://localhost:8080/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Salve**: `Ctrl+O` → `Enter` → `Ctrl+X`

### 9.3 Ativar o Site
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/win-marketplace /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 9.4 Atualizar Frontend para Usar Nginx

**Se você configurou Nginx**, atualize o frontend:

```bash
cd ~/win-grupo1/win-frontend
nano .env
```

Crie/altere para:
```bash
# Usar proxy reverso do Nginx (porta 80)
VITE_API_BASE_URL=http://SEU_IP_DA_VPS/api

# Exemplo:
# VITE_API_BASE_URL=http://146.190.136.183/api
```

**Salve** e reconstrua o frontend:
```bash
cd ~/win-grupo1
docker-compose build frontend
docker-compose up -d frontend
```

**💡 DICA**: Se NÃO usar Nginx, o frontend continuará acessando diretamente a porta 8080.

---

## PASSO 10: Configurar SSL/HTTPS com Let's Encrypt (OPCIONAL)

**⚠️ Requer um domínio apontando para seu IP!**

### 10.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Obter Certificado SSL
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

Siga as instruções:
- Digite seu email
- Aceite os termos
- Escolha "2" para redirecionar HTTP → HTTPS

### 10.3 Renovação Automática
```bash
# Testar renovação
sudo certbot renew --dry-run

# Já está configurado para renovar automaticamente!
```

### 10.4 Atualizar Frontend para HTTPS
```bash
cd ~/win-grupo1/win-frontend
nano .env
```

Altere para:
```bash
VITE_API_BASE_URL=https://seudominio.com/api
```

Reconstrua:
```bash
cd ~/win-grupo1
docker-compose build frontend
docker-compose up -d frontend
```

---

## PASSO 11: Configurar Auto-Start (Iniciar com o Sistema)

### 11.1 Habilitar Docker no Boot
```bash
sudo systemctl enable docker
```

### 11.2 Criar Serviço Systemd para o Projeto
```bash
sudo nano /etc/systemd/system/win-marketplace.service
```

Cole o seguinte conteúdo:
```ini
[Unit]
Description=WIN Marketplace Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/winuser/win-grupo1
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=winuser

[Install]
WantedBy=multi-user.target
```

**Salve** e ative:
```bash
sudo systemctl daemon-reload
sudo systemctl enable win-marketplace
sudo systemctl start win-marketplace
sudo systemctl status win-marketplace
```

---

## PASSO 12: Backup Automático do Banco de Dados

### 12.1 Criar Script de Backup
```bash
mkdir -p ~/backups
nano ~/backup-db.sh
```

Cole o seguinte conteúdo:
```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/home/winuser/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="win-marketplace-db"
DB_NAME="win_marketplace"
DB_USER="postgres"

# Criar backup
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Manter apenas os últimos 7 backups
cd $BACKUP_DIR
ls -t backup_*.sql | tail -n +8 | xargs rm -f

echo "Backup realizado: backup_$DATE.sql"
```

**Salve** e dê permissão:
```bash
chmod +x ~/backup-db.sh
```

### 12.2 Configurar Cron para Backup Diário
```bash
crontab -e
```

Adicione no final:
```bash
# Backup diário às 3h da manhã
0 3 * * * /home/winuser/backup-db.sh >> /home/winuser/backups/backup.log 2>&1
```

**Salve** e teste:
```bash
~/backup-db.sh
ls ~/backups
```

---

## PASSO 13: Monitoramento e Manutenção

### 13.1 Verificar Status dos Containers
```bash
docker-compose ps
docker stats
```

### 13.2 Ver Logs em Tempo Real
```bash
# Todos os containers
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas database
docker-compose logs -f postgres
```

### 13.3 Reiniciar Containers
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar apenas um
docker-compose restart backend
docker-compose restart frontend
```

### 13.4 Atualizar o Código
```bash
cd ~/win-grupo1
git pull origin master
docker-compose build
docker-compose up -d
```

### 13.5 Limpar Recursos não Utilizados
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados (CUIDADO!)
docker volume prune -f

# Limpar tudo (CUIDADO!)
docker system prune -a -f
```

---

## 🛡️ CHECKLIST DE SEGURANÇA

- [ ] Alterar senha do usuário root
- [ ] Criar usuário não-root
- [ ] Configurar firewall (ufw)
- [ ] Desabilitar login root via SSH
- [ ] Alterar JWT_SECRET para valor único
- [ ] Alterar senha do PostgreSQL
- [ ] Configurar backup automático
- [ ] Instalar fail2ban (proteção contra ataques)
- [ ] Configurar SSL/HTTPS (Let's Encrypt)
- [ ] Manter sistema atualizado
- [ ] Monitorar logs regularmente

### Desabilitar Login Root via SSH (Recomendado)
```bash
sudo nano /etc/ssh/sshd_config
```

Encontre e altere:
```
PermitRootLogin no
PasswordAuthentication no  # Se usar chave SSH
```

Reinicie SSH:
```bash
sudo systemctl restart sshd
```

### Instalar Fail2Ban (Proteção contra Brute Force)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🐛 TROUBLESHOOTING

### Containers não iniciam
```bash
docker-compose logs
docker-compose down
docker-compose up -d
```

### Erro de permissão
```bash
sudo chown -R $USER:$USER ~/win-grupo1
```

### Porta já em uso
```bash
# Verificar o que está usando a porta
sudo lsof -i :8080
sudo lsof -i :3000

# Matar processo
sudo kill -9 <PID>
```

### Erro de memória
```bash
# Verificar uso
free -h
df -h

# Limpar cache
sudo sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### Backup não funciona
```bash
# Testar manualmente
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > teste.sql

# Verificar logs
cat ~/backups/backup.log
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Ver todos os containers
docker ps -a

# Entrar no container
docker exec -it win-marketplace-backend bash
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Ver uso de disco
du -sh ~/win-grupo1/*
docker system df

# Ver uso de memória
docker stats --no-stream

# Reiniciar VPS
sudo reboot

# Verificar uptime
uptime
```

---

## ✅ VERIFICAÇÃO FINAL

Após completar todos os passos, verifique:

1. **Backend responde**: `curl http://146.190.136.183:8080/actuator/health`
2. **Frontend carrega**: Abra `http://146.190.136.183` no navegador
3. **Login funciona**: Teste com usuário admin
4. **Backup configurado**: Verifique `~/backups`
5. **Auto-start configurado**: `sudo systemctl status win-marketplace`
6. **Firewall ativo**: `sudo ufw status`
7. **Nginx rodando**: `sudo systemctl status nginx`

---

## 🎉 PRONTO!

Seu WIN Marketplace está rodando em produção!

**URLs de Acesso**:
- Frontend: `http://146.190.136.183` (ou `https://seudominio.com`)
- Backend API: `http://146.190.136.183/api` (via Nginx)
- Health Check: `http://146.190.136.183/actuator/health`

---

**Versão**: 1.0  
**Data**: Novembro 2025  
**Suporte**: Consulte logs em `~/win-grupo1` ou `docker-compose logs`
