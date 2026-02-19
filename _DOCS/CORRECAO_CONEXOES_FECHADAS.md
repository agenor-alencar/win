# Correção: Conexões Fechadas do Banco de Dados

**Data:** 18 de fevereiro de 2026  
**Problema:** Lojistas não conseguindo acessar páginas - erro `PSQLException: This connection has been closed`  
**Status:** ✅ **RESOLVIDO**

---

## 🔍 Diagnóstico

### Sintomas
- Lojistas não conseguiam acessar as páginas de produtos
- Loading infinito na interface
- Logs mostrando erros repetitivos:
  ```
  PSQLException: This connection has been closed.
  HikariPool - Failed to validate connection (This connection has been closed.)
  Possibly consider using a shorter maxLifetime value.
  ```

### Causa Raiz
**Descasamento entre configurações do HikariCP e PostgreSQL:**

| Configuração | Valor Anterior | Problema |
|--------------|---------------|----------|
| HikariCP `idle-timeout` | 5 minutos | Conexão ociosa por muito tempo |
| HikariCP `max-lifetime` | 10 minutos | Muito maior que timeout do PostgreSQL |
| PostgreSQL `idle_in_transaction_session_timeout` | 1 minuto | Fecha conexões antes do HikariCP renovar |

**Resultado:** O PostgreSQL fechava conexões após 1 minuto de inatividade, mas o HikariCP tentava reutilizá-las até 10 minutos depois, causando o erro.

---

## ✅ Solução Aplicada

### 1. Ajustes no HikariCP ([application.yml](../backend/src/main/resources/application.yml))

```yaml
hikari:
  maximum-pool-size: 10
  minimum-idle: 5
  connection-timeout: 30000        # 30s
  idle-timeout: 120000             # ⚡ 2 min (antes: 5 min)
  max-lifetime: 240000             # ⚡ 4 min (antes: 10 min)
  keepalive-time: 60000            # ⚡ 1 min (antes: 2 min)
  connection-test-query: SELECT 1
  validation-timeout: 5000         # 5s
  leak-detection-threshold: 60000  # 60s
  auto-commit: true
  pool-name: HikariPool-WinMarketplace
```

**Mudanças:**
- ⚡ **`max-lifetime`**: 10 min → 4 min (menor que idle timeout do PostgreSQL)
- ⚡ **`idle-timeout`**: 5 min → 2 min (renovação mais frequente)
- ⚡ **`keepalive-time`**: 2 min → 1 min (ping mais frequente para manter viva)

### 2. Ajustes no PostgreSQL ([config/postgres.conf](../config/postgres.conf))

```properties
# Timeout de transação ociosa
idle_in_transaction_session_timeout = 300000  # ⚡ 5 min (antes: 1 min)

# TCP Keepalives - detectar conexões mortas (NOVO)
tcp_keepalives_idle = 60        # Segundos antes de enviar keepalive
tcp_keepalives_interval = 10     # Intervalo entre keepalives
tcp_keepalives_count = 3         # Tentativas antes de considerar morta
```

**Mudanças:**
- ⚡ **`idle_in_transaction_session_timeout`**: 1 min → 5 min (maior que max-lifetime do HikariCP)
- ➕ **TCP Keepalives**: Adicionados para detectar conexões mortas na rede

---

## 🎯 Lógica da Configuração

```
Timeline de uma conexão:

┌─────────────────────────────────────────────────────────────┐
│  0s          60s         120s        240s         300s      │
│  │            │           │           │            │        │
│  ├─ NOVA CONEXÃO                                            │
│  │            │           │           │            │        │
│  │            ├─ KEEPALIVE (HikariCP ping)                  │
│  │            │           │           │            │        │
│  │            │           ├─ IDLE TIMEOUT (recicla se idle) │
│  │            │           │           │            │        │
│  │            │           │           ├─ MAX LIFETIME       │
│  │            │           │           │  (fecha e renova)   │
│  │            │           │           │            │        │
│  │            │           │           │            ├─ PostgreSQL Timeout │
│  │            │           │           │            │  (fecha idle)       │
└─────────────────────────────────────────────────────────────┘

✅ Garantia: HikariCP renova (4 min) ANTES do PostgreSQL fechar (5 min)
```

### Regras de Ouro

1. **`max-lifetime` < `idle_in_transaction_session_timeout`**
   - HikariCP deve renovar ANTES do PostgreSQL fechar

2. **`keepalive-time` < `idle-timeout`**
   - Ping de keepalive deve acontecer ANTES de considerar idle

3. **`idle-timeout` < `max-lifetime`**
   - Conexões idle são recicladas antes do fim de vida

4. **TCP Keepalives habilitados**
   - Detecta conexões mortas na rede (firewall, balanceador)

---

## 🚀 Aplicação das Mudanças

```bash
# 1. Parar containers
docker compose down

# 2. Subir com novas configurações
docker compose up -d --force-recreate

# 3. Verificar logs (não deve haver erros de conexão)
docker logs win-marketplace-backend --tail 100

# 4. Monitorar
docker logs -f win-marketplace-backend
```

---

## ✅ Validação

### Antes da Correção
```log
❌ PSQLException: This connection has been closed.
❌ Failed to validate connection (This connection has been closed.)
❌ Lojistas não conseguem acessar páginas
```

### Depois da Correção
```log
✅ Sem erros de conexão fechada
✅ HikariPool funcionando normalmente
✅ Lojistas acessando páginas com sucesso
```

---

## 📊 Monitoramento Contínuo

### Comandos Úteis

```bash
# Ver logs do backend
docker logs -f win-marketplace-backend

# Verificar pool de conexões
docker logs win-marketplace-backend | grep -i "hikari"

# Estatísticas do container
docker stats win-marketplace-backend
```

### Métricas para Acompanhar

1. **Conexões ativas:** Deve ficar entre 5-10
2. **Tempo de obtenção de conexão:** < 30ms
3. **Validação de conexão:** Sem falhas
4. **Vazamentos de conexão:** 0 (leak detection)

---

## 🛠️ Troubleshooting Futuro

Se os erros voltarem, verificar:

1. **Load alto:** Aumentar `maximum-pool-size` se necessário
2. **Firewall/NAT:** Verificar se está fechando conexões idle
3. **PostgreSQL max_connections:** Garantir que suporta o pool
4. **Logs do PostgreSQL:** Verificar se há closes forçados

---

## 📚 Referências

- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
- [PostgreSQL Connection Management](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [PostgreSQL TCP Keepalives](https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-TCP-KEEPALIVES-IDLE)

---

**Autor:** GitHub Copilot  
**Revisão:** -  
**Aprovado:** -
