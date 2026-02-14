# 🔧 HOTFIX - Correção Conexões Banco de Dados

**Data:** 14/02/2026  
**Problema:** Conexões do PostgreSQL fechando prematuramente (HikariCP)  
**Solução:** Ajuste dos timeouts do pool de conexões

---

## 🐛 Problema Identificado

### Erro nos Logs:
```
WARN  com.zaxxer.hikari.pool.PoolBase - HikariPool-WinMarketplace - 
Failed to validate connection org.postgresql.jdbc.PgConnection@xxx 
(This connection has been closed.). Possibly consider using a shorter maxLifetime value.
```

### Causa:
O HikariCP estava tentando usar conexões que o PostgreSQL já havia fechado. Os timeouts do pool estavam desalinhados com os timeouts do PostgreSQL.

---

## ✅ Correções Aplicadas

### Arquivo: `backend/src/main/resources/application.yml`

**Antes:**
```yaml
hikari:
  idle-timeout: 600000      # 10 minutos
  max-lifetime: 1800000     # 30 minutos ❌ MUITO ALTO
  keepalive-time: 300000    # 5 minutos
```

**Depois:**
```yaml
hikari:
  idle-timeout: 300000      # 5 minutos ✅
  max-lifetime: 600000      # 10 minutos ✅ (menor que timeout PostgreSQL)
  keepalive-time: 120000    # 2 minutos ✅ (mais frequente)
```

### Benefícios:
- ✅ Conexões renovadas antes do timeout do PostgreSQL
- ✅ Keepalive mais frequente mantém conexões vivas
- ✅ Reduz warnings e falhas de validação
- ✅ Melhora estabilidade em produção

---

## 📦 Deploy na VPS

### 1️⃣ Fazer commit e push no Git:
```bash
git add backend/src/main/resources/application.yml
git commit -m "fix: ajusta timeouts do HikariCP para evitar conexões fechadas"
git push origin main
```

### 2️⃣ Na VPS, atualizar código:
```bash
cd ~/win
git pull origin main
```

### 3️⃣ Rebuild e restart do backend:
```bash
docker compose down
docker compose up -d --build backend
```

### 4️⃣ Verificar logs (deve parar de aparecer warnings):
```bash
docker compose logs -f backend | grep -i "hikari\|connection"
```

---

## 🧪 Validação

### Comportamento Esperado:
- ✅ **SEM** warnings de "Failed to validate connection"
- ✅ Pool de conexões estável
- ✅ Checkout endpoint funcionando normalmente

### Monitorar por 30 minutos após deploy:
```bash
# Acompanhar logs em tempo real
docker compose logs -f backend

# Verificar se aplicação está respondendo
curl http://localhost:8080/api/v1/categoria
```

---

## 📊 Referências Técnicas

### Timeouts Recomendados (HikariCP + PostgreSQL):
- **max-lifetime:** 10-15 minutos (menor que `tcp_keepalives_idle` do PostgreSQL)
- **idle-timeout:** 5-8 minutos
- **keepalive-time:** 2-5 minutos (ping periódico para manter conexões vivas)

### Configuração PostgreSQL (padrão):
- `tcp_keepalives_idle`: 7200s (2 horas)
- `tcp_keepalives_interval`: 75s
- Timeouts de rede podem variar entre provedores cloud

---

## 🚨 Rollback (se necessário)

Caso precise reverter:
```bash
cd ~/win
git revert HEAD
docker compose down
docker compose up -d --build backend
```

---

**Aplicar este hotfix imediatamente na VPS para resolver os erros de checkout!** 🚀
