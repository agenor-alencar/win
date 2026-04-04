# 🔧 Diagnóstico VPS - ERR_CONNECTION_REFUSED

## 🚨 Problema: Site não carrega (Conexão Recusada)

O erro `ERR_CONNECTION_REFUSED` significa que **nenhum serviço está escutando** na porta 80 (Nginx) ou os containers Docker pararam.

---

## 🔍 Diagnóstico Rápido

### 1️⃣ Conectar na VPS

```bash
ssh winuser@137.184.87.106
```

### 2️⃣ Verificar se os containers estão rodando

```bash
docker ps
```

**✅ Esperado:** Ver 3 containers:
- `win-marketplace-backend`
- `win-marketplace-frontend`
- `win-marketplace-db`

**❌ Se não aparecer nenhum ou apenas alguns:** Containers pararam!

### 3️⃣ Verificar Nginx

```bash
sudo systemctl status nginx
```

**✅ Esperado:** `active (running)`

**❌ Se não estiver ativo:**
```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

### 4️⃣ Ver todos os containers (incluindo parados)

```bash
docker ps -a
```

Procure pela coluna `STATUS`:
- ✅ `Up X minutes` = Rodando
- ❌ `Exited (0) X minutes ago` = Parado
- ❌ `Exited (1) X minutes ago` = Parou com erro

---

## 🛠️ Soluções

### Solução 1: Containers Parados (mais comum)

Se `docker ps` não mostrar os 3 containers rodando:

```bash
cd ~/win
docker-compose up -d
```

Aguarde 30 segundos e verifique:
```bash
docker ps
```

### Solução 2: Containers com erro (não iniciam)

Se os containers param imediatamente após `docker-compose up`:

```bash
cd ~/win

# Ver logs para identificar o erro
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Tentar reiniciar tudo
docker-compose down
docker-compose up -d
```

### Solução 3: Erro de build/atualização incompleta

Se você executou `git pull` mas não fez rebuild:

```bash
cd ~/win

# Parar tudo
docker-compose down

# Rebuild (isso é OBRIGATÓRIO após git pull!)
docker-compose build --no-cache

# Subir novamente
docker-compose up -d

# Aguardar 1 minuto e verificar
sleep 60
docker ps
```

### Solução 4: Porta 3000 ou 8080 já em uso

```bash
# Verificar o que está usando as portas
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :80

# Se houver algo além do Docker, mate o processo:
sudo kill -9 <PID>

# Depois reinicie os containers
cd ~/win
docker-compose restart
```

### Solução 5: Problema com Docker Daemon

```bash
# Verificar se Docker está rodando
sudo systemctl status docker

# Se não estiver, iniciar:
sudo systemctl start docker

# Habilitar para iniciar no boot:
sudo systemctl enable docker

# Tentar subir os containers
cd ~/win
docker-compose up -d
```

### Solução 6: Falta de memória/recursos

```bash
# Verificar uso de memória
free -h

# Verificar uso de disco
df -h

# Se estiver sem espaço, limpar Docker:
docker system prune -a -f

# Depois rebuild
cd ~/win
docker-compose build --no-cache
docker-compose up -d
```

### Solução 7: Nginx não está rodando

```bash
# Verificar status
sudo systemctl status nginx

# Se estiver parado, iniciar:
sudo systemctl start nginx

# Testar configuração (erros de sintaxe):
sudo nginx -t

# Se houver erro de configuração:
sudo nano /etc/nginx/sites-available/win-marketplace
# Corrija os erros e depois:
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📊 Comando de Diagnóstico Completo

Execute este script para obter um diagnóstico completo:

```bash
#!/bin/bash
echo "=== DIAGNÓSTICO VPS ==="
echo ""
echo "1. Status do Docker:"
sudo systemctl status docker | grep Active
echo ""
echo "2. Containers Rodando:"
docker ps
echo ""
echo "3. Todos os Containers (incluindo parados):"
docker ps -a
echo ""
echo "4. Status do Nginx:"
sudo systemctl status nginx | grep Active
echo ""
echo "5. Portas em uso:"
sudo lsof -i :80 -i :3000 -i :8080 -i :5432
echo ""
echo "6. Uso de Memória:"
free -h
echo ""
echo "7. Uso de Disco:"
df -h /
echo ""
echo "8. Últimos logs do backend (10 linhas):"
docker logs win-marketplace-backend --tail 10 2>&1 || echo "Container backend não existe"
echo ""
echo "9. Últimos logs do frontend (10 linhas):"
docker logs win-marketplace-frontend --tail 10 2>&1 || echo "Container frontend não existe"
```

**Para executar:**
```bash
cd ~
nano diagnostico.sh
# Cole o script acima
chmod +x diagnostico.sh
./diagnostico.sh
```

---

## 🔄 Procedimento Completo de Reset

Se nada funcionar, faça um reset completo:

```bash
cd ~/win

# 1. Parar TUDO
docker-compose down -v

# 2. Limpar Docker
docker system prune -a -f

# 3. Atualizar código
git pull origin main

# 4. Rebuild completo
docker-compose build --no-cache

# 5. Subir os containers
docker-compose up -d

# 6. Aguardar 2 minutos
echo "Aguardando containers iniciarem..."
sleep 120

# 7. Verificar status
docker ps

# 8. Ver logs
docker-compose logs --tail 50
```

---

## ✅ Verificação Pós-Solução

Após resolver, teste:

```bash
# 1. Containers estão UP?
docker ps

# 2. Backend responde?
curl http://localhost:8080/actuator/health

# 3. Frontend responde?
curl http://localhost:3000

# 4. Nginx responde?
curl http://localhost
```

**No navegador:**
1. Acesse: `http://137.184.87.106`
2. Pressione `Ctrl+Shift+R` (hard refresh)
3. Se não carregar, tente modo anônimo

---

## 🆘 Se Nada Funcionar

Execute e envie o resultado:

```bash
cd ~/win

echo "=== DIAGNÓSTICO COMPLETO ===" > diagnostico.txt
echo "" >> diagnostico.txt
echo "Data: $(date)" >> diagnostico.txt
echo "" >> diagnostico.txt
echo "1. Docker Status:" >> diagnostico.txt
sudo systemctl status docker >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "2. Containers:" >> diagnostico.txt
docker ps -a >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "3. Nginx Status:" >> diagnostico.txt
sudo systemctl status nginx >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "4. Docker Compose Config:" >> diagnostico.txt
cat docker-compose.yml >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "5. Logs Backend:" >> diagnostico.txt
docker logs win-marketplace-backend --tail 100 >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "6. Logs Frontend:" >> diagnostico.txt
docker logs win-marketplace-frontend --tail 100 >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt
echo "7. Uso de Recursos:" >> diagnostico.txt
free -h >> diagnostico.txt 2>&1
df -h >> diagnostico.txt 2>&1
echo "" >> diagnostico.txt

cat diagnostico.txt
```

---

## 📌 Causas Mais Comuns

1. **Containers parados** → `docker-compose up -d`
2. **Não fez rebuild após git pull** → `docker-compose build --no-cache`
3. **Falta de memória** → `docker system prune -a -f`
4. **Nginx parado** → `sudo systemctl start nginx`
5. **Porta em uso** → Reiniciar VPS ou matar processo

---

**Data:** 20/11/2025
