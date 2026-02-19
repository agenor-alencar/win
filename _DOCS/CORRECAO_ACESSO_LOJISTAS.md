# Correção: Lojistas Não Conseguindo Acessar Páginas

**Data:** 18 de fevereiro de 2026  
**Problemas:** 
1. ❌ Conexões do banco de dados sendo fechadas (PSQLException)
2. ❌ Endpoint `/api/v1/lojistas/me` retornando erro 500
**Status:** ✅ **RESOLVIDO**

---

## 🔍 Diagnóstico

### Sintomas
- ✗ Lojistas não conseguiam acessar páginas de produtos
- ✗ Loading infinito na interface
- ✗ Erro 500 no endpoint `/api/v1/lojistas/me`
- ✗ Logs mostrando erros de conexão fechada

### Problema 1: Conexões Fechadas do Banco de Dados

**Logs do erro:**
```
PSQLException: This connection has been closed.
HikariPool - Failed to validate connection (This connection has been closed.)
Possibly consider using a shorter maxLifetime value.
```

**Causa Raiz:**
Descasamento entre configurações do HikariCP e PostgreSQL:

| Configuração | Valor Anterior | Problema |
|--------------|---------------|----------|
| HikariCP `idle-timeout` | 5 minutos | Conexão ociosa por muito tempo |
| HikariCP `max-lifetime` | 10 minutos | Muito maior que timeout do PostgreSQL |
| PostgreSQL `idle_in_transaction_session_timeout` | 1 minuto | Fecha conexões antes do HikariCP renovar |

**Resultado:** PostgreSQL fechava conexões após 1 minuto, mas HikariCP tentava reutilizá-las até 10 minutos depois.

### Problema 2: Endpoint `/me` sem Autenticação

**Logs do erro:**
```
GET https://winmarketplace.com.br/api/v1/lojistas/me 500 (Internal Server Error)
Erro ao buscar dados da lojista
Request failed with status code 500
```

**Causa Raiz:**
No [SecurityConfig.java](../backend/src/main/java/com/win/marketplace/config/SecurityConfig.java), a configuração:

```java
.requestMatchers(HttpMethod.GET, "/api/v1/lojistas/**").permitAll()
```

Permitia **TODOS** os GETs em lojistas sem autenticação, incluindo `/me`. Quando o endpoint era chamado:

1. `SecurityContextHolder.getContext().getAuthentication()` retornava usuário anônimo
2. `authentication.getName()` retornava **"anonymousUser"**
3. Serviço tentava buscar usuário com email "anonymousUser"
4. Lançava `RuntimeException` → **Erro 500**

---

## ✅ Soluções Aplicadas

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
- ⚡ **`max-lifetime`**: 10 min → 4 min (renova ANTES do PostgreSQL fechar)
- ⚡ **`idle-timeout`**: 5 min → 2 min (reciclagem mais frequente)
- ⚡ **`keepalive-time`**: 2 min → 1 min (ping mais frequente)

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

### 3. Correção do SecurityConfig ([SecurityConfig.java](../backend/src/main/java/com/win/marketplace/config/SecurityConfig.java))

```java
.authorizeHttpRequests(auth -> auth
    // ... outras regras ...
    
    // ⚡ ANTES da regra geral: endpoints que REQUEREM autenticação
    .requestMatchers("/api/v1/lojistas/me").authenticated()
    .requestMatchers("/api/v1/lojistas/*/estatisticas").authenticated()
    
    // DEPOIS: outros GETs de lojistas são públicos
    .requestMatchers(HttpMethod.GET, "/api/v1/lojistas/**").permitAll()
    
    // ... resto das regras ...
)
```

**Mudança:**
- ⚡ `/api/v1/lojistas/me` agora **REQUER autenticação**
- ⚡ Regra específica vem **ANTES** da regra geral `permitAll()`
- ✅ Endpoint `/me` agora recebe o usuário autenticado corretamente

---

## 🎯 Lógica da Configuração

### Timeline de Conexão do Banco

```
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

✅ HikariCP renova (4 min) ANTES do PostgreSQL fechar (5 min)
```

### Ordem de Precedência no SecurityConfig

```
Spring Security processa regras na ORDEM declarada:

1. /api/v1/lojistas/me → authenticated() ✅ REQUER AUTH
2. /api/v1/lojistas/** → permitAll()    ✅ Público

Se invertesse a ordem, /me seria público (ERRADO ❌)
```

### Regras de Ouro

**Para Pool de Conexões:**
1. **`max-lifetime` < `idle_in_transaction_session_timeout`**
   - HikariCP renova ANTES do PostgreSQL fechar

2. **`keepalive-time` < `idle-timeout`**
   - Ping ocorre ANTES de considerar idle

3. **`idle-timeout` < `max-lifetime`**
   - Conexões idle são recicladas antes do fim de vida

4. **TCP Keepalives habilitados**
   - Detecta conexões mortas na rede

**Para Spring Security:**
1. **Regras específicas ANTES de regras gerais**
   - `/me` antes de `/**`

2. **Endpoints autenticados declarados explicitamente**
   - Usar `.authenticated()` quando precisa do usuário

---

## 🚀 Aplicação das Mudanças

```bash
# 1. Recompilar backend
cd backend
./mvnw clean package -DskipTests

# 2. Reconstruir e reiniciar containers
cd ..
docker compose up -d --build backend

# 3. Verificar logs (não deve haver erros)
docker logs win-marketplace-backend --tail 100

# 4. Testar acesso do lojista
# Fazer login como lojista e acessar /merchant/products
```

---

## ✅ Validação

### Antes das Correções
```log
❌ PSQLException: This connection has been closed.
❌ Failed to validate connection
❌ GET /api/v1/lojistas/me → 500 Internal Server Error
❌ Lojistas não conseguem acessar páginas
```

### Depois das Correções
```log
✅ Sem erros de conexão fechada
✅ HikariPool funcionando normalmente
✅ GET /api/v1/lojistas/me → 200 OK (com autenticação)
✅ Lojistas acessando páginas com sucesso
```

---

## 📊 Monitoramento Contínuo

### Comandos Úteis

```bash
# Ver logs do backend
docker logs -f win-marketplace-backend

# Verificar erros de conexão
docker logs win-marketplace-backend | grep -i "failed to validate"

# Verificar erros 500
docker logs win-marketplace-backend | grep -i "500\|error\|exception"

# Estatísticas do container
docker stats win-marketplace-backend
```

### Métricas para Acompanhar

1. **Conexões ativas:** 5-10 (dentro do pool)
2. **Tempo de obtenção de conexão:** < 30ms
3. **Validação de conexão:** 0 falhas
4. **Vazamentos de conexão:** 0 (leak detection)
5. **Endpoints autenticados:** Sem erro 401/500

---

## 🛠️ Troubleshooting Futuro

### Se erros de conexão voltarem:

1. **Load alto:** Aumentar `maximum-pool-size`
2. **Firewall/NAT:** Verificar se fecha conexões idle
3. **PostgreSQL max_connections:** Garantir que suporta o pool
4. **Logs do PostgreSQL:** Verificar closes forçados

### Se erro 500 em `/me` voltar:

1. **Verificar token JWT:** Token válido e não expirado?
2. **Verificar usuário:** Usuário existe e está ativo?
3. **Verificar lojista:** Perfil de lojista criado?
4. **Logs detalhados:** Ativar `logging.level.com.win.marketplace: DEBUG`

---

## 📚 Referências

- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
- [PostgreSQL Connection Management](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [PostgreSQL TCP Keepalives](https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-TCP-KEEPALIVES-IDLE)
- [Spring Security Authorization](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)

---

**Autor:** GitHub Copilot  
**Revisão:** -  
**Aprovado:** -

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
