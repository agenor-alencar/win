# Troubleshooting: Problemas Comuns de Inicialização

**Data:** 30 de Março de 2026

---

## Problema 1: Porta 8080 Já em Uso

### Erro
```
Web server failed to start. Port 8080 was already in use.

Action:
Identify and stop the process that's listening on port 8080 or 
configure this application to listen on another port.
```

### Causa
Outra aplicação (geralmente uma instância anterior do Spring Boot ou outro servidor) 
ainda está usando a porta 8080.

### Solução A: Identificar e Matar o Processo

**Windows PowerShell:**
```powershell
# 1. Listar qual processo está usando porta 8080
netstat -ano | findstr :8080

# Saída esperada:
#   TCP    127.0.0.1:8080   0.0.0.0:0   LISTENING       [PID]

# 2. Matar o processo pelo PID
Stop-Process -Id [PID] -Force

# 3. Verificar se porta foi liberada
netstat -ano | findstr :8080
# (Nenhuma saída = sucesso)
```

**Linux/Mac:**
```bash
# 1. Listar processo na porta 8080
lsof -i :8080

# 2. Matar processo
kill -9 [PID]

# 3. Alternativa (kill por nome)
killall java
```

### Solução B: Usar Porta Diferente

Se não conseguir matar o processo, configure o Spring Boot para usar outra porta:

**application-dev.yml:**
```yaml
server:
  port: 8081  # Ou qualquer porta disponível
```

**Ou via linha de comando:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

---

## Problema 2: Erro de Schema (Coluna não existe)

### Erro
```
ERROR: column "tipo_pin" does not exist

Error executing DDL "create index idx_pin_tipo on pin_validacoes (tipo_pin)"
```

### Solução
Ver documento: [SOLUCAO_ERRO_SCHEMA_TIPO_PIN.md](SOLUCAO_ERRO_SCHEMA_TIPO_PIN.md)

Resumo: Corrigir índice de `tipo_pin` para `tipo_pin_validacao` em `PinValidacao.java`

---

## Problema 3: Falha de Conexão com PostgreSQL

### Erro
```
ERROR o.h.e.jdbc.spi.SqlExceptionHelper - Connection to localhost:5432 refused. 
Check that the hostname and port are correct and that the postmaster is 
accepting TCP/IP connections.
```

### Causas Possíveis

1. **PostgreSQL não está rodando**
2. **Database está em outra máquina/porta**
3. **Credenciais incorretas**
4. **Firewall bloqueando conexão**

### Solução A: Verificar se PostgreSQL está Rodando

**Windows:**
```powershell
# Verificar serviço PostgreSQL
Get-Service PostgreSQL*

# Se não estiver rodando, iniciar (requer admin)
Start-Service PostgreSQL-x64-15
```

**Linux:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar
sudo systemctl start postgresql
```

**Mac:**
```bash
# Via Homebrew
brew services start postgresql
```

### Solução B: Testar Conexão ao Banco

```bash
# Testar conexão com psql
psql -h localhost -U win_user -d win_marketplace

# Se falhar, verificar credenciais em application-dev.yml:
# spring:
#   datasource:
#     url: jdbc:postgresql://localhost:5432/win_marketplace
#     username: win_user
#     password: sua_senha
```

### Solução C: Configurar Conexão Correta

**application-dev.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/win_marketplace
    username: win_user
    password: ${DB_PASSWORD:sua_senha_padrao}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate  # ou 'create-drop', 'update'
    show-sql: true
```

---

## Problema 4: Out of Memory ou Performance

### Sintomas
- JVM crash
- Servidor muito lento
- Erro: `java.lang.OutOfMemoryError`

### Solução

**Aumentar heap memory:**

```bash
# Via environment variable
set JAVA_OPTS=-Xmx2G -Xms1G
mvn spring-boot:run

# Ou via Maven diretamente
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx2G -Xms1G"
```

**Valores recomendados:**
- Dev: `-Xmx512M` (mínimo)
- Staging: `-Xmx2G`
- Production: `-Xmx4G` ou mais (conforme necessário)

---

## Problema 5: Compilação Falha

### Erro
```
[ERROR] Failed to compile project: compilation failure
```

### Soluções

1. **Limpar build anterior:**
   ```bash
   mvn clean compile
   ```

2. **Atualizar dependências:**
   ```bash
   mvn clean install -U
   ```

3. **Verificar versão Java:**
   ```bash
   java -version
   # Deve ser Java 21 ou superior para projeto WIN
   ```

4. **Verificar erros reais:**
   ```bash
   mvn compile -e  # -e para stack trace completo
   ```

---

## Problema 6: WebSocket Connection Refused

### Erro
```
WebSocket connection to 'ws://localhost:8080/ws/connect' failed
```

### Soluções

1. **WebSocket não está habilitado em WebSecurityConfig**
2. **CORS não configurado**
3. **Proxy/Firewall bloqueando WebSocket

### Verificação

```bash
# Testar se WebSocket endpoint está respondendo
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: $RANDOM" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8080/ws/connect
```

---

## Checklist de Debug

```
[ ] 1. Verificar se PostgreSQL está rodando
      $ systemctl status postgresql (Linux)
      $ Get-Service PostgreSQL* (Windows)

[ ] 2. Testar compilação
      $ mvn clean compile

[ ] 3. Verificar porta 8080 está livre
      $ netstat -ano | findstr :8080

[ ] 4. Verificar arquivo application-dev.yml
      $ cat backend/src/main/resources/application-dev.yml

[ ] 5. Verificar logs do servidor
      $ mvn spring-boot:run | tee server.log

[ ] 6. Testar health check
      $ curl http://localhost:8080/actuator/health

[ ] 7. Testar endpoint específico
      $ curl http://localhost:8080/api/products

[ ] 8. Limpar cache Maven (último recurso)
      $ mvn clean install -DskipTests
```

---

## Logs Úteis para Debug

Habilitar logs mais detalhados em `application-dev.yml`:

```yaml
logging:
  level:
    root: WARN
    com.win.marketplace: DEBUG
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG
    org.hibernate: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

---

## Comandos Rápidos de Referência

```bash
# Compilar
mvn clean compile

# Compilar e rodar testes
mvn verify

# Compilar e criar JAR
mvn clean package

# Rodar servidor
mvn spring-boot:run

# Parar servidor (se rodando em background)
pkill -f "spring-boot:run"

# Ver logs em tempo real
tail -f backend/target/spring-boot.log

# Conectar ao banco de dados
psql -h localhost -U win_user -d win_marketplace

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

**Última atualização:** 30/03/2026  
**Versão:** 1.0
