# 🚀 Otimização de Recursos - VPS Produção

**Data**: 11 de dezembro de 2025  
**Ambiente**: VPS DigitalOcean (2 vCPUs, 4GB RAM)  
**Status**: ✅ Otimizado

---

## 🔴 PROBLEMA IDENTIFICADO

### Sintomas
- **CPU saturada**: 100% de uso constante
- **Backend Java**: 85-100% de CPU
- **PostgreSQL**: 5-15% de CPU (normal)
- **Inicialização lenta**: > 20 segundos

### Diagnóstico
O gargalo estava no **backend Spring Boot**, consumindo praticamente toda a CPU disponível.

**Causas Prováveis:**
1. Ausência de limites de recursos nos containers
2. Configurações JVM não otimizadas para ambiente com recursos limitados
3. Garbage Collector com pausas longas
4. PostgreSQL com configurações default (não aproveitando RAM disponível)

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Limites de Recursos (docker-compose.yml)

#### Backend Spring Boot
```yaml
deploy:
  resources:
    limits:
      cpus: '1.25'     # 62.5% das 2 vCPUs disponíveis
      memory: 2G       # Máximo 2GB
    reservations:
      cpus: '0.5'      # Garantir 0.5 vCPU
      memory: 768M     # Garantir 768MB
```

#### PostgreSQL
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # 25% das 2 vCPUs disponíveis
      memory: 1G       # Máximo 1GB
    reservations:
      cpus: '0.25'     # Garantir 0.25 vCPU
      memory: 256M     # Garantir 256MB
```

**Distribuição Total:**
- Backend: 1.25 vCPU (62.5%)
- PostgreSQL: 0.5 vCPU (25%)
- **Margem livre**: 0.25 vCPU (12.5%) → prevenir estrangulamento do host

### 2. Otimizações JVM (Backend)

#### Configuração Anterior
```bash
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

#### Configuração Nova (Otimizada)
```bash
JAVA_OPTS="-Xms512m -Xmx1536m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -Djava.awt.headless=true"
```

**Mudanças:**
- ✅ **Heap máximo aumentado**: 1024m → 1536m (1.5GB)
- ✅ **String Deduplication**: Reduz uso de memória em Strings duplicadas
- ✅ **String Concat Optimization**: Otimiza concatenação de Strings
- ✅ **Headless mode**: Remove dependências GUI

**Benefícios:**
- Menos coletas de GC (garbage collection)
- Pausas de GC mais curtas (≤ 200ms)
- Uso de memória mais eficiente
- Redução de CPU em ~30-40%

### 3. Otimizações PostgreSQL

#### Arquivo: `config/postgres.conf`

**Memória:**
```ini
shared_buffers = 768MB              # 19% da RAM (conservador)
effective_cache_size = 2GB          # 50% da RAM
work_mem = 16MB                     # Por conexão
maintenance_work_mem = 256MB        # Manutenção (VACUUM, INDEX)
```

**Conexões:**
```ini
max_connections = 100               # Padrão, suficiente
```

**WAL (Write-Ahead Log):**
```ini
wal_buffers = 16MB
checkpoint_completion_target = 0.9  # Reduz picos de I/O
max_wal_size = 1GB
min_wal_size = 256MB
```

**I/O (SSD):**
```ini
random_page_cost = 1.1              # SSD (1.1), HDD seria 4.0
effective_io_concurrency = 200      # SSD
```

**Logging (Produção):**
```ini
log_min_duration_statement = 1000   # Logar apenas queries > 1s
log_statement = 'none'              # Não logar todas as queries
log_checkpoints = on                # Monitorar I/O
log_connections = off               # Reduzir I/O
```

**Autovacuum (Agressivo):**
```ini
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 30s            # Verificar a cada 30s
```

**Timeouts:**
```ini
statement_timeout = 300000          # 5 minutos
lock_timeout = 30000                # 30 segundos
idle_in_transaction_session_timeout = 60000  # 1 minuto
```

---

## 📊 RESULTADOS ESPERADOS

### Antes da Otimização
| Métrica | Valor | Status |
|---------|-------|--------|
| CPU Backend | 85-100% | 🔴 Crítico |
| CPU PostgreSQL | 5-15% | 🟢 OK |
| Memória Backend | 1.5G | 🟡 Alto |
| Memória PostgreSQL | 500M | 🟢 OK |
| Tempo Inicialização | 20-30s | 🔴 Lento |
| CPU Total VPS | 100% | 🔴 Saturado |

### Após Otimização (Meta)
| Métrica | Valor | Status |
|---------|-------|--------|
| CPU Backend | 40-60% | 🟢 OK |
| CPU PostgreSQL | 5-15% | 🟢 OK |
| Memória Backend | 1.2-1.5G | 🟢 OK |
| Memória PostgreSQL | 600-800M | 🟢 OK |
| Tempo Inicialização | 15-20s | 🟢 OK |
| CPU Total VPS | 50-70% | 🟢 Saudável |

**Melhoria Esperada:**
- ✅ Redução de **~40% no uso de CPU**
- ✅ Tempo de inicialização **33% mais rápido**
- ✅ Margem de CPU livre: **30-50%** (prevenir picos)
- ✅ Melhor estabilidade e responsividade

---

## 🚀 APLICANDO AS MUDANÇAS

### Passo 1: Parar Containers
```bash
cd /root/win-marketplace
docker compose down
```

### Passo 2: Verificar Mudanças
```bash
# Ver diff do docker-compose.yml
git diff docker-compose.yml

# Verificar arquivo de configuração PostgreSQL
cat config/postgres.conf
```

### Passo 3: Recriar Containers
```bash
# Forçar recriação com novas configurações
docker compose up -d --force-recreate

# Aguardar inicialização (15-20s)
sleep 20
```

### Passo 4: Verificar Aplicação
```bash
# 1. Verificar containers rodando
docker ps

# 2. Verificar logs do backend
docker logs win-marketplace-backend --tail 50

# 3. Verificar logs do PostgreSQL
docker logs win-marketplace-db --tail 50

# 4. Testar configuração PostgreSQL
docker exec -it win-marketplace-db psql -U postgres -c "SHOW shared_buffers;"
docker exec -it win-marketplace-db psql -U postgres -c "SHOW effective_cache_size;"
docker exec -it win-marketplace-db psql -U postgres -c "SHOW work_mem;"

# 5. Ver uso de recursos
docker stats --no-stream
```

**Saída Esperada (docker stats):**
```
CONTAINER                    CPU %   MEM USAGE / LIMIT
win-marketplace-backend      45%     1.3GiB / 2GiB
win-marketplace-db           8%      650MiB / 1GiB
win-marketplace-frontend     3%      150MiB / -
```

### Passo 5: Monitorar por 24-48h
```bash
# Monitorar CPU/Memória em tempo real
watch -n 5 docker stats --no-stream

# Ver histórico de logs (queries lentas)
docker logs win-marketplace-db | grep "duration:"

# Ver checkpoints (I/O)
docker logs win-marketplace-db | grep "checkpoint"
```

---

## 🔍 TROUBLESHOOTING

### Problema: Backend ainda com CPU alta (> 70%)

**Diagnóstico:**
```bash
# Ver threads ativas
docker exec -it win-marketplace-backend jstack 1 | grep -A 10 "runnable"

# Ver GC (Garbage Collection)
docker logs win-marketplace-backend | grep "GC"
```

**Soluções:**
1. Reduzir heap máximo: `-Xmx1536m` → `-Xmx1280m`
2. Usar outro GC: `-XX:+UseZGC` (Java 21+)
3. Adicionar limites ao scheduler ERP:
   ```java
   @Scheduled(fixedDelay = 120000) // 60s → 120s
   ```

### Problema: PostgreSQL com I/O alto

**Diagnóstico:**
```sql
-- Queries mais lentas
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Locks ativos
SELECT * FROM pg_locks WHERE NOT granted;

-- Índices faltantes
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public' AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_indexes
);
```

**Soluções:**
1. Criar índices em colunas filtradas
2. Aumentar `work_mem` para 32MB
3. Ajustar `autovacuum_naptime` para 60s

### Problema: Memória insuficiente (OOMKilled)

**Sintomas:**
```bash
docker logs win-marketplace-backend
# Saída: "Killed" ou "OOMKilled"
```

**Soluções:**
1. Reduzir heap JVM: `-Xmx1536m` → `-Xmx1280m`
2. Aumentar limite de memória: `memory: 2G` → `memory: 2.5G`
3. Verificar vazamentos de memória:
   ```bash
   docker exec -it win-marketplace-backend jmap -heap 1
   ```

---

## 📈 MONITORAMENTO CONTÍNUO

### Comandos Úteis

```bash
# Dashboard de recursos (atualiza a cada 5s)
watch -n 5 docker stats --no-stream

# Logs em tempo real
docker logs -f win-marketplace-backend

# Verificar queries lentas (PostgreSQL)
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '1 seconds'
ORDER BY duration DESC;
"

# Ver conexões ativas
docker exec -it win-marketplace-db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Ver tamanho do banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT pg_size_pretty(pg_database_size('win_marketplace'));"
```

### Alertas Recomendados (DigitalOcean Monitoring)

1. **CPU > 80%** por 5 minutos → Email/Slack
2. **Memória > 90%** por 5 minutos → Email/Slack
3. **Disco > 85%** → Email/Slack
4. **Container reiniciou** → Email/Slack

---

## 📚 REFERÊNCIAS

- [PostgreSQL Tuning Your Server](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
- [PGTune - PostgreSQL Configuration Wizard](https://pgtune.leopard.in.ua/)
- [Spring Boot Docker Best Practices](https://spring.io/guides/topicals/spring-boot-docker/)
- [JVM Tuning Guide (Java 21)](https://docs.oracle.com/en/java/javase/21/gctuning/)
- [Docker Resource Constraints](https://docs.docker.com/config/containers/resource_constraints/)
- [G1 Garbage Collector Tuning](https://www.oracle.com/technical-resources/articles/java/g1gc.html)

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após aplicar as mudanças, verificar:

- [ ] Containers iniciaram sem erros
- [ ] Backend carregou em < 20 segundos
- [ ] PostgreSQL aplicou configurações customizadas
- [ ] CPU total VPS < 70%
- [ ] CPU backend < 60%
- [ ] Memória backend < 1.8GB
- [ ] Aplicação responde em < 200ms
- [ ] Queries SQL < 500ms
- [ ] Logs sem erros de OOM
- [ ] Scheduler ERP funcionando (logs a cada 60s)

---

**✅ Otimização Completa!**  
**Status**: Pronto para deploy em produção  
**Próximos Passos**: Monitorar por 24-48h e ajustar conforme necessário
