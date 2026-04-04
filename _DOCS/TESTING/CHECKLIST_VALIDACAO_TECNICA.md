# 🧪 CHECKLIST DE VALIDAÇÃO TÉCNICA
## WIN Marketplace - Verificação de Implementações

**Criado**: 31 de março de 2026  
**Versão**: 1.0  
**Responsável**: QA/Desenvolvedor

---

## 📋 PRÉ-REQUISITOS

- [ ] Java 21 instalado: `java -version`
- [ ] Maven 3.8+: `mvn -version`
- [ ] PostgreSQL 13+: `psql --version`
- [ ] Redis (opcional para testes): `redis-cli --version`
- [ ] Git: `git --version`
- [ ] IDE com Lombok support (IntelliJ IDEA / VS Code)

---

## 🔍 VERIFICAÇÕES DE CÓDIGO

### ✅ FIX-001: WebSocket CORS Hardening

**1. Conferir importação de @Value**
```bash
grep -n "@Value" backend/src/main/java/com/win/marketplace/config/WebSocketConfig.java
```
✓ Esperado: Linha com `@Value("${cors.allowed-origins:...}")`

**2. Verificar setAllowedOrigins sem wildcard**
```bash
grep -n "setAllowedOrigins" backend/src/main/java/com/win/marketplace/config/WebSocketConfig.java
```
✓ Esperado: `setAllowedOrigins(origins)` (NÃO setAllowedOrigins("*"))

**3. Conferir comentário de documentação**
```bash
grep -n "FIX-001" backend/src/main/java/com/win/marketplace/config/WebSocketConfig.java
```
✓ Esperado: Encontrar comentário com FIX-001

**Teste funcional**:
```bash
# Terminal 1: Iniciar aplicação
cd backend
export SPRING_PROFILES_ACTIVE=dev
export CORS_ALLOWED_ORIGINS=http://localhost:3000
java -jar target/win-marketplace-0.0.1-SNAPSHOT.jar

# Terminal 2: Testar com origem permitida (deve funcionar)
wscat -c "ws://localhost:8080/ws/connect"
# Esperado: Conexão estabelecida

# Terminal 3: Testar com origem bloqueada (deve falhar)
curl -v -H "Origin: https://atacante.com" \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:8080/ws/connect
# Esperado: 403 Forbidden
```

---

### ✅ FIX-002: DDL Strategy Environment Aware

**1. Conferir application.yml principal**
```bash
grep -A 1 "ddl-auto:" backend/src/main/resources/application.yml
```
✓ Esperado: `ddl-auto: ${JPA_DDL_AUTO:validate}`

**2. Verificar application-dev.yml**
```bash
grep -A 1 "ddl-auto:" backend/src/main/resources/application-dev.yml
```
✓ Esperado: `ddl-auto: update`

**3. Verificar application-prod.yml existe**
```bash
ls -lh backend/src/main/resources/application-prod.yml
```
✓ Esperado: Arquivo deve existir (criado)

**4. Conferir content de prod**
```bash
grep -A 1 "ddl-auto:" backend/src/main/resources/application-prod.yml
grep -A 1 "sql.init.mode:" backend/src/main/resources/application-prod.yml
```
✓ Esperado: 
  - ddl-auto: validate
  - sql.init.mode: never

**Teste funcional**:
```bash
# Dev profile
export SPRING_PROFILES_ACTIVE=dev
mvn clean package -DskipTests
java -jar target/*.jar &
APP_PID=$!
sleep 5

# Verificar logs
grep "ddl-auto" logs/app.log | head -1
# Esperado: Mostrar "update"

kill $APP_PID

# Prod profile  
export SPRING_PROFILES_ACTIVE=prod
java -jar target/*.jar &
APP_PID=$!
sleep 5

grep "ddl-auto" logs/app.log | head -1
# Esperado: Mostrar "validate"

kill $APP_PID
```

---

### ✅ FIX-003: Transaction Timeouts

**1. Conferir timeout na classe ProdutoService**
```bash
grep -n "public class ProdutoService" -A 1 backend/src/main/java/com/win/marketplace/service/ProdutoService.java
```
✓ Esperado: `@Transactional(timeout = 30)`

**2. Verificar timeouts em métodos**
```bash
grep -B 2 "public.*Page.*listarProdutosPaginados" backend/src/main/java/com/win/marketplace/service/ProdutoService.java
```
✓ Esperado: `@Transactional(readOnly = true, timeout = 15)`

**3. Conferir enable_lazy_load_no_trans**
```bash
grep "enable_lazy_load_no_trans" backend/src/main/resources/application.yml
```
✓ Esperado: `enable_lazy_load_no_trans: false`

**Teste funcional**:
```bash
# Compilar
mvn clean compile

# Buscar classe compilada
find backend/target -name "ProdutoService.class"

# Descompile (requer javap ou Fernflower)
javap -c target/classes/com/win/marketplace/service/ProdutoService.class | grep timeout
# Esperado: Bytecode com timeout annotations
```

---

### ✅ FIX-004: Entity Graph N+1 Resolution

**1. Verificar import de EntityGraph**
```bash
grep "@EntityGraph\|import.*EntityGraph" backend/src/main/java/com/win/marketplace/repository/ProdutoRepository.java
```
✓ Esperado: 
  - `import org.springframework.data.jpa.repository.EntityGraph;`
  - Múltiplas ocorrências de `@EntityGraph`

**2. Contar @EntityGraph annotations**
```bash
grep -c "@EntityGraph" backend/src/main/java/com/win/marketplace/repository/ProdutoRepository.java
```
✓ Esperado: 9+ anotações

**3. Verificar attributePaths**
```bash
grep "@EntityGraph(attributePaths" backend/src/main/java/com/win/marketplace/repository/ProdutoRepository.java | head -3
```
✓ Esperado: Mencionar `{"lojista", "categoria"}`

**Teste funcional**:
```bash
# Habilitar SQL logging
export SPRING_PROFILES_ACTIVE=dev
export SPRING_JPA_SHOW_SQL=true

mvn clean package -DskipTests
java -jar target/*.jar &
APP_PID=$!
sleep 3

# Fazer requisição
curl -s "http://localhost:8080/api/v1/produtos?page=0&size=10" | jq '.content | length'
# Esperado: array com produtos

# Verificar logs SQL - deve ver um único SELECT com múltiplos JOINs
grep "SELECT" logs/app.log | tail -5
# NÃO deve ter múltiplas queries SELECT em sequência

kill $APP_PID
```

---

## 🏗️ TESTES DE COMPILAÇÃO

### Maven Build

```bash
# Limpeza completa
cd backend
mvn clean

# Compilação
mvn compile
```

**Esperado**: ✅ BUILD SUCCESS

Se houver erro:
```bash
# Verificar sintaxe específica
mvn compiler:compile -X | tail -50
```

### Testes Unitários

```bash
# Executar testes
mvn test -Dtest=ProdutoServiceTest

# Ou todos os testes
mvn test
```

**Esperado**: ✅ Nenhum teste quebrado

---

## 🌍 TESTES DE AMBIENTE

### Desenvolvimento

```bash
# Arquivo .env para dev
cat > backend/.env << 'EOF'
SPRING_PROFILES_ACTIVE=dev
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/win_marketplace
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres123
EOF

# Carregar e iniciar
export $(cat backend/.env | xargs)
java -jar target/win-marketplace-0.0.1-SNAPSHOT.jar
```

**Checklist**:
- [ ] Aplicação inicia sem erros
- [ ] Database se conecta
- [ ] Tabelas são criadas (ddl-auto: update)
- [ ] WebSocket aceita http://localhost:3000
- [ ] WebSocket rejeita outras origens

### Produção (Simulado)

```bash
# Arquivo .env para prod
cat > backend/.env.prod << 'EOF'
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=https://win-marketplace.com.br
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/win_marketplace_prod
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=SENHA_SECRETA
JPA_DDL_AUTO=validate
EOF

# Carregar
export $(cat backend/.env.prod | xargs)

# Iniciar (sem Flyway migrations = vai falhar se schema vazio)
java -jar target/win-marketplace-0.0.1-SNAPSHOT.jar
```

**Esperado**:
- ✅ Aplicação inicia normalmente
- ✅ DDL validation passa (schema já existe)
- ⚠️ Se for primeira vez, Flyway deve criar schema primeiro

---

## 📊 TESTES DE PERFORMANCE

### Query Performance (N+1 Test)

```bash
# Terminal 1: Iniciar app com logging
export SPRING_PROFILES_ACTIVE=dev
export LOGGING_LEVEL_ORG_HIBERNATE_SQL=DEBUG
java -jar backend/target/win-marketplace-0.0.1-SNAPSHOT.jar > logs.txt 2>&1 &
APP_PID=$!
sleep 3

# Terminal 2: Fazer requisição
curl -s "http://localhost:8080/api/v1/produtos?page=0&size=50" | jq '.pageNumber'

# Terminal 1: Contar queries
sleep 1
kill $APP_PID
grep "SELECT.*FROM.*produto" logs.txt | wc -l
```

**Esperado**:
- ❌ Antes: 50+ queries
- ✅ Depois: 1-2 queries (com JOIN)

### Response Time Benchmark

```bash
# Instalar Apache Bench
sudo apt-get install apache2-utils  # Linux
# ou brew install httpd  # macOS

# Teste de carga
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/produtos?page=0&size=10

# Esperado após FIX-004:
# Time per request: < 50ms (median)
```

---

## 🔐 TESTES DE SEGURANÇA

### CORS Validation

```bash
# Teste 1: Origem permitida (deve retornar OK)
curl -i -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:8080/ws/connect

# Esperado: 200 ou 101 Switching Protocols

# Teste 2: Origem não permitida (deve rejeitar)
curl -i -H "Origin: https://atacante.com" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:8080/ws/connect

# Esperado: 403 Forbidden
```

### Database Safety

```bash
# Verificar que DDL não altera schema em prod
export SPRING_PROFILES_ACTIVE=prod
export JPA_DDL_AUTO=validate

# Se houver mismatch entre entity e schema:
# Esperado: Erro na inicialização (previne auto-fix)

# Não deve silenciosamente alterar banco!
```

---

## 📈 MÉTRICAS ESPERADAS

### Antes e Depois

| Métrica | Antes | Depois |
|---------|-------|--------|
| **Queries por listagem** | N+1 | 1-2 ✅ |
| **Tempo resposta (ms)** | ~1000 | ~50 ✅ |
| **Taxa erro 5xx** | ~1% | <0.1% ✅ |
| **Connection pool utilization** | 80% | 10% ✅ |
| **CORS violations** | Permitidas | Bloqueadas ✅ |

---

## ✅ CHECKLIST FINAL

### Código
- [ ] FIX-001: WebSocketConfig.java atualizado
- [ ] FIX-002: application-prod.yml criado
- [ ] FIX-003: ProdutoService com timeouts
- [ ] FIX-004: ProdutoRepository com @EntityGraph
- [ ] Nenhum erro de compilação
- [ ] Nenhum teste quebrado

### Segurança
- [ ] CORS restringido (teste com curl)
- [ ] DDL=validate em prod
- [ ] Sem hardcoded secrets
- [ ] JWT configurado
- [ ] Passwords com Bcrypt

### Performance
- [ ] N+1 resolvido (1-2 queries)
- [ ] Response time < 200ms (P95)
- [ ] Connection pool estável
- [ ] Redis funcionando (se aplicável)

### Documentação
- [ ] ANALISE_OTIMIZACAO_DESEMPENHO.md revisto
- [ ] IMPLEMENTACAO_HOTFIXES_FASE1.md correto
- [ ] RESUMO_EXECUTIVO_AUDITORIA.md validado
- [ ] Código comentado com "FIX-XXX"

### Deployment
- [ ] .env.dev criado com valores corretos
- [ ] .env.prod criado com valores corretos
- [ ] Scripts de deploy testados
- [ ] Rollback plan documentado

---

## 🆘 Troubleshooting

### Problema: Compile Error "cannot find symbol EntityGraph"
**Solução**: Adicionar import
```java
import org.springframework.data.jpa.repository.EntityGraph;
```

### Problema: WebSocket conexão recusada
**Solução**: Verificar CORS_ALLOWED_ORIGINS
```bash
export CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Problema: DDL validation error em prod
**Solução**: Aplicar Flyway migrations antes
```bash
mvn flyway:migrate -Dflyway.configFiles=backend/src/main/resources/application-prod.yml
```

### Problema: Muitas queries ainda sendo executadas
**Solução**: Garantir que EntityGraph tenha todos attributePaths necessários
```java
@EntityGraph(attributePaths = {"lojista", "categoria", "outroRelacionamento"})
```

---

## 📞 Contato para Dúvidas

Consule a documentação principal em: [ANALISE_OTIMIZACAO_DESEMPENHO.md](./ANALISE_OTIMIZACAO_DESEMPENHO.md)

**Última atualização**: 31 de março de 2026
