# 🚀 Comandos Maven & Flyway - Guia Completo

> **Data:** 2026-03-24  
> **Ambiente:** Windows PowerShell 5.1+  
> **Pré-requisito:** JDK 21+, Maven 3.8+, PostgreSQL 16 (produção)

---

## 📋 ÍNDICE

1. [Verificar Pré-requisitos](#1-verificar-pré-requisitos)
2. [Executar Migrações](#2-executar-migrações)
3. [Rodar Testes](#3-rodar-testes)
4. [Troubleshooting](#4-troubleshooting)

---

## 1️⃣ Verificar Pré-requisitos

### Java Version
```powershell
# Verificar se Java 21+ está instalado
java -version

# Esperado:
# openjdk version "21.0.x" 2023-09-19 LTS
```

### Maven Version
```powershell
# Verificar se Maven está na PATH
mvn --version

# Esperado:
# Apache Maven 3.8.1 (or later)
# Java version: 21.0.x
```

### PostgreSQL (Produção)
```powershell
# Conectar ao PostgreSQL
psql -U postgres -h localhost -p 5432

# Listar bancos existentes
\l

# Sair
\q
```

---

## 2️⃣ Executar Migrações

### 2.1 OPÇÃO A: Migração Automática (Recomendado)

**Quando rodar:** Sempre antes de testes, deployments, ou desenvolvmentl

⚠️ **IMPORTANTE:** Flyway é configurado para rodar automaticamente ao iniciar a aplicação!

```powershell
# 1. Build do projeto (isto ativa Flyway automaticamente)
cd c:\Users\Usuario\Documents\win\backend
mvn clean install

# Esperado na saída:
# [INFO] --- flyway-maven-plugin:X.X.X:migrate ---
# [INFO] Successfully validated 10 migrations (execution time 00.234s)
# [INFO] Current version of schema "public": 6
# [INFO] Schema "public" is at version 6
```

### 2.2 OPÇÃO B: Migração Explícita via Maven

**Quando usar:** Se você quer ter certeza que migrações rodem isoladamente

```powershell
# Abrir terminal PowerShell
cd c:\Users\Usuario\Documents\win\backend

# Executar APENAS Flyway (sem compilar)
mvn flyway:migrate

# Esperado:
# [INFO] --- flyway-maven-plugin:X.X.X:migrate (default-cli) ---
# [INFO] Successfully validated 10 migrations (execution time 00.234s)
# [INFO] Migration V6__create_pin_validacoes_table.sql ... Success
```

### 2.3 OPÇÃO C: Migração com Profile Específico

**Quando usar:** Para migrar em ambiente específico (dev, staging, prod)

```powershell
# Migração apenas em DEV
mvn clean install -Dspring.profiles.active=dev

# Migração apenas em PROD
mvn clean install -Dspring.profiles.active=prod

# Migração apenas em TEST
mvn clean install -Dspring.profiles.active=test
```

### 2.4 Verificar Histórico de Migrações

**Após executar migrações, conferir status:**

```powershell
# 1. Abrir psql
psql -U postgres -h localhost -d marketplace

# 2. Verificar tabela de histórico do Flyway
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;

# Esperado:
# installed_rank | version | description                        | type | installed_by | installed_on | execution_time | success
# --------------|---------|-----------------------------------|------|--------------|--------------|---------------|--------
# 6              | 6       | create pin validacoes table        | SQL  | postgres     | 2026-03-24   | 245           | t

# 3. Verificar tabela pin_validacoes foi criada
\dt pin_validacoes

# Esperado:
# Schema | Name             | Type  | Owner
#--------|------------------|-------|-------
# public | pin_validacoes   | table | postgres

# 4. Ver estrutura
\d pin_validacoes
```

---

## 3️⃣ Rodar Testes

### 3.1 Rodar TODOS os testes

```powershell
cd c:\Users\Usuario\Documents\win\backend

# Executar todos os testes
mvn clean test

# Esperado:
# [INFO] Running com.win.marketplace.integration.PinValidacaoIntegrationTest
# [INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 12.345 s
# [INFO] BUILD SUCCESS
```

### 3.2 Rodar APENAS testes de PIN (Recomendado para dev rápido)

```powershell
# Opção 1: Executar apenas classe específica
mvn test -Dtest=PinValidacaoIntegrationTest

# Opção 2: Executar padrão por nome
mvn test -Dtest=*PinValidacao*

# Opção 3: Executar um teste específico
mvn test -Dtest=PinValidacaoIntegrationTest#testGerarPin_Sucesso
```

### 3.3 Rodar com Cobertura de Código (Code Coverage)

```powershell
# Gerar relatório JaCoCo
mvn clean test jacoco:report

# Arquivo gerado em:
# backend/target/site/jacoco/index.html

# Para abrir no navegador
Start-Process "backend/target/site/jacoco/index.html"
```

### 3.4 Rodar Testes em Paralelo (Mais rápido)

```powershell
# Executar múltiplos testes em paralelo
mvn test -DparallelTestClasses=true -DthreadCount=4

# -DthreadCount=4 = usar 4 cores
```

### 3.5 Rodar com Output Detalhado

```powershell
# Mostrar logs de SQL, WebSocket, etc
mvn test -X  # -X = debug mode

# Alternativamente, setup no application-test.yml
# logging:
#   level:
#     com.win.marketplace: DEBUG
#     org.hibernate: DEBUG
```

---

## 4️⃣ Troubleshooting

### ❌ Erro: "Migration V6 não encontrada"

```powershell
# Verificar se arquivo SQL existe
ls backend/src/main/resources/db/migration/ | grep V6

# Esperado:
# V6__create_pin_validacoes_table.sql

# Se não existir, copiar arquivo
Copy-Item "database/V6__create_pin_validacoes_table.sql" `
  "backend/src/main/resources/db/migration/"
```

### ❌ Erro: "H2 mode not recognized"

```powershell
# Atualizar application-test.yml:
# datasource:
#   url: jdbc:h2:mem:testdb;MODE=PostgreSQL

# Se ainda não funcionar, usar modo compatível:
# url: jdbc:h2:mem:testdb
```

### ❌ Erro: "PostgreSQL connection refused"

```powershell
# 1. Verificar se PostgreSQL está rodando
Get-Process | grep postgres  # Windows
# ou
psql -U postgres  # Tenta conectar

# 2. Se não conectar, iniciar PostgreSQL
# Windows (via WSL):
wsl sudo service postgresql start

# Docker (se usar):
docker start postgres-container
```

### ❌ Erro: "Migration checksum mismatch"

```powershell
# Flyway detectou mudança em migration já aplicada!

# SOLUÇÃO 1: Reset apenas V6 (cuidado!)
mvn flyway:undo  # Reverte última migration

# SOLUÇÃO 2: Marcar como executada (risco!)
mvn flyway:baseline -Dflyway.baselineVersion=6

# SOLUÇÃO 3: Deletar tabela e reaplicar
psql -U postgres
DROP TABLE IF EXISTS pin_validacoes CASCADE;
\q
mvn flyway:migrate
```

### ❌ Erro: "Test fails with connection timeout"

```powershell
# Aumentar timeout em application-test.yml:
# spring:
#   datasource:
#     hikari:
#       connection-timeout: 20000  # 20 segundos

# Ou rodar com menos testes em paralelo:
mvn test -DthreadCount=1
```

### ⚠️ Aviso: "Flyway baseline already exists"

```powershell
# Flyway já foi executado antes (normal!)

# Verificar histórico:
mvn flyway:info

# Esperado:
# | 1 | 1                    | create database schema     | SQL    | Success | 2026-03-01
# | 2 | 2                    | create users table         | SQL    | Success | 2026-03-01
# ...
# | 6 | 6                    | create pin validacoes      | SQL    | Success | 2026-03-24
```

---

## 📊 Fluxo Recomendado para Dev

### 1️⃣ Primeira Vez (Setup)

```powershell
# Terminal 1: Build + Migrações
cd backend
mvn clean install
# Isto vai: compilar, rodar Flyway, executar testes

# Verificar resultado
mvn flyway:info
```

### 2️⃣ Desenvolvimento (Iterativo)

```powershell
# Cada vez que mudar código:

# Rodar APENAS testes de PIN (10s)
mvn test -Dtest=*PinValidacao*

# Se passar, testar tudo (1-2 min)
mvn clean test

# Se tudo OK, preparar para deploy
mvn clean package -DskipTests
```

### 3️⃣ Antes de Deploy

```powershell
# 1. Build final
mvn clean package

# 2. Verificar migrações
cd backend
mvn flyway:info

# 3. Testar com DB real (staging)
mvn test -Dspring.profiles.active=staging

# 4. Deploydocker build, helm deploy, etc
```

---

## 🎯 Comandos Rápidos (Copy-Paste)

```powershell
# ✅ Build completo com testes
mvn clean test

# ✅ Apenas testes de PIN
mvn test -Dtest=PinValidacaoIntegrationTest

# ✅ Build sem testes
mvn clean package -DskipTests

# ✅ Verificar migrações
mvn flyway:info

# ✅ Executar migrações manualmente
mvn flyway:migrate

# ✅ Relatório de cobertura
mvn clean test jacoco:report

# ✅ Testar específico
mvn test -Dtest=PinValidacaoIntegrationTest#testGerarPin_Sucesso

# ✅ Debug (verbose)
mvn test -Dtest=PinValidacaoIntegrationTest -X

# ✅ Abrir relatório no navegador
Start-Process "backend/target/site/jacoco/index.html"

# ✅ Maven clean (se estiver preso)
mvn clean
```

---

## 🔍 Verificar Cada Migração

```sql
-- Para verificar o status de cada migração
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
ORDER BY version DESC;

-- Ver só failed migrations
SELECT * FROM flyway_schema_history WHERE success = false;

-- Ver performance das migrações
SELECT version, description, execution_time 
FROM flyway_schema_history 
ORDER BY execution_time DESC;
```

---

## 📝 Checklist Pré-Deploy

```
[ ] Migrações executadas com sucesso
    mvn flyway:info (verificar V6)

[ ] Todos os testes passam
    mvn clean test (0 failures)

[ ] Cobertura OK (>80%)
    mvn jacoco:report

[ ] Sem warnings importantes
    mvn clean install -W

[ ] Dados de teste carregados (se needed)
    sqlite3 backend/database/test.db

[ ] Build agora, deploy depois
    mvn clean package -DskipTests
```

---

## 📞 Referências

### Oficial Docs
- Flyway: https://flywaydb.org/documentation/maven/
- Maven: https://maven.apache.org/guides/
- Spring Boot Testing: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing

### Arquivo Importante
- **Migrações:** `backend/src/main/resources/db/migration/`
- **Testes:** `backend/src/test/java/com/win/marketplace/`
- **Config Teste:** `backend/src/test/resources/application-test.yml`

---

**Versão:** 1.0  
**Última atualização:** 2026-03-24  
**Status:** ✅ Pronto para uso
