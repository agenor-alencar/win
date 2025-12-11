# 🔧 Configurações de Otimização - Win Marketplace

Este diretório contém arquivos de configuração para otimização de recursos em produção.

## 📁 Arquivos

### `postgres.conf`
Configuração otimizada do PostgreSQL para VPS com **2 vCPUs e 4GB RAM**.

**Principais Otimizações:**
- `shared_buffers = 768MB` (19% da RAM)
- `effective_cache_size = 2GB` (50% da RAM)
- `work_mem = 16MB` (por conexão)
- `maintenance_work_mem = 256MB` (6.25% da RAM)
- `max_connections = 100`
- `random_page_cost = 1.1` (otimizado para SSD)
- `effective_io_concurrency = 200` (SSD)

**Logging Otimizado:**
- Apenas queries lentas (> 1s)
- Checkpoints habilitados
- Conexões desabilitadas (reduz I/O)

**Autovacuum Agressivo:**
- 3 workers
- Intervalo de 30s
- Threshold de 50 tuplas

## 🚀 Como Aplicar

### 1. Aplicar Configurações
```bash
# Parar containers
docker compose down

# Recriar containers com novas configurações
docker compose up -d --force-recreate
```

### 2. Verificar Aplicação
```bash
# Verificar se PostgreSQL carregou a configuração
docker exec -it win-marketplace-db psql -U postgres -c "SHOW shared_buffers;"
docker exec -it win-marketplace-db psql -U postgres -c "SHOW effective_cache_size;"
docker exec -it win-marketplace-db psql -U postgres -c "SHOW work_mem;"

# Verificar logs do PostgreSQL
docker logs win-marketplace-db
```

### 3. Monitorar Performance
```bash
# Monitorar uso de recursos em tempo real
docker stats

# Verificar queries lentas (> 1s)
docker logs win-marketplace-db | grep "duration:"

# Verificar checkpoints
docker logs win-marketplace-db | grep "checkpoint"
```

## 📊 Limites de Recursos (docker-compose.yml)

### Backend (Spring Boot)
```yaml
deploy:
  resources:
    limits:
      cpus: '1.25'     # 62.5% das 2 vCPUs
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 768M
```

**Otimizações JVM:**
```bash
-Xms512m                    # Heap inicial 512MB
-Xmx1536m                   # Heap máximo 1.5GB
-XX:+UseG1GC                # Garbage Collector G1 (low latency)
-XX:MaxGCPauseMillis=200    # Pausas de GC ≤ 200ms
-XX:+UseStringDeduplication # Reduz uso de memória em Strings
-XX:+OptimizeStringConcat   # Otimiza concatenação de Strings
```

### PostgreSQL
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # 25% das 2 vCPUs
      memory: 1G
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 🔍 Diagnóstico de Problemas

### CPU Alta no Backend
1. **Verificar threads ativas:**
   ```bash
   docker exec -it win-marketplace-backend jstack 1 | grep -A 10 "runnable"
   ```

2. **Verificar GC:**
   ```bash
   docker logs win-marketplace-backend | grep "GC"
   ```

3. **Habilitar JMX (adicionar ao JAVA_OPTS):**
   ```bash
   -Dcom.sun.management.jmxremote
   -Dcom.sun.management.jmxremote.port=9010
   -Dcom.sun.management.jmxremote.authenticate=false
   -Dcom.sun.management.jmxremote.ssl=false
   ```

### I/O Alto no PostgreSQL
1. **Verificar queries lentas:**
   ```sql
   -- Conectar ao banco
   docker exec -it win-marketplace-db psql -U postgres -d win_marketplace
   
   -- Ver queries mais lentas (requer pg_stat_statements)
   SELECT query, calls, total_exec_time, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Verificar locks:**
   ```sql
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

3. **Verificar índices faltantes:**
   ```sql
   SELECT schemaname, tablename, indexname
   FROM pg_indexes
   WHERE tablename = 'produtos';
   ```

## 📈 Métricas Esperadas Após Otimização

### Antes (Baseline)
- **CPU Backend**: 85-100%
- **CPU PostgreSQL**: 5-15%
- **Memória Backend**: 1.5G
- **Memória PostgreSQL**: 500M
- **Tempo de inicialização**: 20-30s

### Depois (Meta)
- **CPU Backend**: 40-60% (redução de ~40%)
- **CPU PostgreSQL**: 5-15% (mantido)
- **Memória Backend**: 1.2-1.5G (estável)
- **Memória PostgreSQL**: 600-800M (aumentado pelo cache)
- **Tempo de inicialização**: 15-20s (redução de ~33%)

## 🎯 Comandos Rápidos

```bash
# Ver uso atual de recursos
docker stats --no-stream

# Ver logs em tempo real
docker logs -f win-marketplace-backend
docker logs -f win-marketplace-db

# Reiniciar apenas backend
docker restart win-marketplace-backend

# Reiniciar apenas PostgreSQL
docker restart win-marketplace-db

# Ver configuração ativa do PostgreSQL
docker exec -it win-marketplace-db psql -U postgres -c "SELECT name, setting, unit FROM pg_settings WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem', 'maintenance_work_mem', 'max_connections');"
```

## ⚠️ Notas Importantes

1. **Não edite postgres.conf diretamente no container** - ele será resetado ao reiniciar
2. **Sempre use docker-compose.yml** para configurações persistentes
3. **Monitore por 24-48h** após aplicar mudanças
4. **Ajuste limites gradualmente** se necessário
5. **Faça backup** antes de mudanças em produção

## 📚 Referências

- [PostgreSQL Tuning Your PostgreSQL Server](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
- [PGTune - PostgreSQL Configuration Wizard](https://pgtune.leopard.in.ua/)
- [Spring Boot Docker Best Practices](https://spring.io/guides/topicals/spring-boot-docker/)
- [JVM Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
