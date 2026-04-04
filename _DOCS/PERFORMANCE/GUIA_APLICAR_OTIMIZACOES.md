# 🚀 Guia de Aplicação das Otimizações do Banco de Dados

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR

Este guia contém as etapas para aplicar otimizações seguras no banco de dados.
**NÃO execute direto em produção sem testar primeiro!**

---

## 📋 Pré-requisitos

1. ✅ Backup completo do banco de dados
2. ✅ Acesso ao servidor VPS
3. ✅ Tempo de manutenção agendado (recomendado: 30-60 minutos)
4. ✅ Ambiente de teste para validar primeiro

---

## FASE 1: BACKUP E PREPARAÇÃO

### Passo 1: Fazer Backup Completo

```bash
# Conectar ao VPS
ssh root@137.184.87.106

# Navegar para o diretório do projeto
cd /root/win

# Criar diretório de backups se não existir
mkdir -p backups

# Fazer backup completo do banco
docker exec win-marketplace-db pg_dump -U postgres -F c -b -v -f /tmp/backup_pre_otimizacao.dump win_marketplace

# Copiar backup para o host
docker cp win-marketplace-db:/tmp/backup_pre_otimizacao.dump ./backups/backup_pre_otimizacao_$(date +%Y%m%d_%H%M%S).dump

# Verificar tamanho do backup
ls -lh backups/

# Backup também em SQL (mais legível)
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > ./backups/backup_pre_otimizacao_$(date +%Y%m%d_%H%M%S).sql
```

### Passo 2: Copiar Script de Otimização para o Container

```bash
# Copiar script para dentro do container
docker cp ./database/otimizacao_fase1.sql win-marketplace-db:/tmp/otimizacao_fase1.sql
```

---

## FASE 2: VALIDAÇÃO PRÉ-EXECUÇÃO

### Passo 3: Verificar Estado Atual do Banco

```bash
# Conectar ao banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('win_marketplace'));

# Verificar número de tabelas
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

# Listar tabelas
\dt

# Verificar índices existentes
SELECT 
    tablename,
    COUNT(*) as num_indices
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY num_indices DESC;

# Verificar constraints existentes
SELECT 
    table_name,
    COUNT(*) as num_constraints
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND constraint_type = 'CHECK'
GROUP BY table_name;

# Sair
\q
```

---

## FASE 3: APLICAR OTIMIZAÇÕES

### Passo 4: Executar Script de Otimização (Ambiente de Teste)

```bash
# PRIMEIRO EM TESTE! Se você tiver um ambiente de teste:
docker exec -it win-marketplace-db-test psql -U postgres -d win_marketplace -f /tmp/otimizacao_fase1.sql

# Verificar se houve erros
echo $?
# Se retornar 0, sucesso. Se retornar diferente de 0, houve erro.
```

### Passo 5: Executar em Produção (Após Validar em Teste)

```bash
# Colocar site em modo manutenção (opcional, mas recomendado)
# TODO: Implementar página de manutenção

# Parar backend temporariamente para evitar operações durante otimização
docker-compose stop backend

# Executar script de otimização
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -f /tmp/otimizacao_fase1.sql 2>&1 | tee ./backups/otimizacao_fase1_$(date +%Y%m%d_%H%M%S).log

# Verificar se houve erros no log
cat ./backups/otimizacao_fase1_*.log | grep -i error

# Reiniciar backend
docker-compose start backend

# Verificar logs do backend
docker-compose logs -f backend
```

---

## FASE 4: VALIDAÇÃO PÓS-EXECUÇÃO

### Passo 6: Verificar Índices Criados

```bash
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace << EOF

-- Listar todos os novos índices
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar tamanho dos índices
SELECT 
    schemaname || '.' || tablename AS table,
    indexname AS index,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

EOF
```

### Passo 7: Verificar Constraints Criadas

```bash
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace << EOF

-- Listar constraints criadas
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_name LIKE 'chk_%'
ORDER BY tc.table_name, tc.constraint_name;

EOF
```

### Passo 8: Verificar Triggers e Views

```bash
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace << EOF

-- Verificar triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Verificar views
SELECT 
    table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%'
ORDER BY table_name;

-- Testar uma view
SELECT COUNT(*) FROM v_produtos_estatisticas;

EOF
```

---

## FASE 5: TESTES FUNCIONAIS

### Passo 9: Testar Funcionalidades Críticas

1. **Teste de Login**
   - Acesse o site
   - Faça login como lojista
   - Verifique se carrega corretamente

2. **Teste de Produtos**
   - Liste produtos
   - Busque produtos
   - Crie novo produto
   - Edite produto existente

3. **Teste de Pedidos**
   - Liste pedidos
   - Visualize detalhes de pedido
   - Verifique filtros de status

4. **Teste de Dashboard**
   - Acesse dashboard do lojista
   - Verifique estatísticas
   - Veja se gráficos carregam

5. **Teste de Performance**
   ```bash
   # Tempo de resposta da API de produtos
   time curl -s -o /dev/null http://137.184.87.106/api/v1/produtos
   
   # Tempo de resposta da API de pedidos
   time curl -s -o /dev/null http://137.184.87.106/api/v1/pedidos
   ```

---

## FASE 6: MONITORAMENTO

### Passo 10: Monitorar Performance

```bash
# Conectar ao banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

-- Verificar queries mais lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Verificar uso de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Verificar cache hit ratio
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

\q
```

---

## 🔄 ROLLBACK (Em Caso de Problemas)

Se algo der errado, você pode fazer rollback:

```bash
# Parar todos os serviços
docker-compose down

# Remover banco atual
docker volume rm win_postgres_data

# Restaurar backup
docker-compose up -d postgres

# Aguardar banco iniciar (30 segundos)
sleep 30

# Restaurar backup (.dump - formato custom)
docker exec -i win-marketplace-db pg_restore -U postgres -d win_marketplace -v < ./backups/backup_pre_otimizacao_*.dump

# OU restaurar backup (.sql - formato texto)
docker exec -i win-marketplace-db psql -U postgres win_marketplace < ./backups/backup_pre_otimizacao_*.sql

# Subir todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

---

## 📊 Resultados Esperados

### Performance
- ⚡ Queries de produtos: **30-50% mais rápidas**
- ⚡ Queries de pedidos: **40-60% mais rápidas**
- ⚡ Dashboard: **carregamento 2-3x mais rápido**

### Integridade
- ✅ Dados inválidos bloqueados (preços negativos, etc.)
- ✅ Datas consistentes
- ✅ Valores dentro de limites esperados

### Manutenibilidade
- 📝 Campos de auditoria completos
- 📝 Views úteis para análises
- 📝 Triggers automáticos

---

## 📝 Checklist Final

Após aplicar as otimizações:

- [ ] Backup verificado e salvo
- [ ] Script executado sem erros
- [ ] Índices criados corretamente
- [ ] Constraints aplicadas
- [ ] Triggers funcionando
- [ ] Views criadas
- [ ] Testes funcionais passaram
- [ ] Performance melhorou
- [ ] Sem erros nos logs
- [ ] Usuários conseguem usar o sistema normalmente
- [ ] Documentação atualizada

---

## 🆘 Troubleshooting

### Problema: "Constraint violation" ao inserir dados

**Solução:**
```sql
-- Verificar qual constraint está falhando
SELECT * FROM pg_constraint WHERE conname LIKE 'chk_%';

-- Desabilitar temporariamente (NÃO RECOMENDADO)
ALTER TABLE nome_tabela DISABLE TRIGGER ALL;

-- Re-habilitar
ALTER TABLE nome_tabela ENABLE TRIGGER ALL;
```

### Problema: Queries lentas mesmo com índices

**Solução:**
```sql
-- Forçar atualização de estatísticas
ANALYZE;

-- Reindexar tabela específica
REINDEX TABLE nome_tabela;

-- Ver plano de execução
EXPLAIN ANALYZE SELECT ...;
```

### Problema: Banco de dados travado

**Solução:**
```bash
# Ver queries em execução
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Cancelar query específica
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT pg_cancel_backend(PID);"

# Terminar conexão (último recurso)
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT pg_terminate_backend(PID);"
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte o documento de análise: `_DOCS/ANALISE_OTIMIZACAO_BANCO.md`
3. Considere fazer rollback se for crítico
4. Documente o erro para análise posterior

---

## ✅ Conclusão

Após seguir este guia, seu banco de dados estará:
- ✨ Mais rápido
- 🛡️ Mais seguro
- 📊 Mais confiável
- 🔧 Mais fácil de manter

**Parabéns!** 🎉
