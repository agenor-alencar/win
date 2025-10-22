# 🏠 Guia de Execução Local (sem Docker)

Este guia mostra como executar os serviços **localmente** na sua máquina, sem usar Docker.

---

## 📋 Pré-requisitos Locais

### Backend
- ✅ Java 21 (JDK) instalado
- ✅ Maven 3.9+ (ou usar o wrapper `./mvnw`)
- ✅ PostgreSQL rodando (pode ser Docker ou instalado localmente)

### Frontend
- ✅ Node.js 22+ e npm
- ✅ Backend rodando (para fazer chamadas à API)

---

## 🗄️ 1. Preparar o Banco de Dados

### Opção A: PostgreSQL no Docker (Recomendado)

```powershell
# Apenas o banco de dados
docker-compose up -d postgres

# Verificar se está rodando
docker-compose ps postgres
```

### Opção B: PostgreSQL Instalado Localmente

1. Instale o PostgreSQL 16
2. Crie o banco de dados:

```sql
CREATE DATABASE win_marketplace;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE win_marketplace TO postgres;
```

---

## 🔧 2. Executar o Backend Localmente

### Passo 1: Navegar para o diretório do backend

```powershell
cd backend
```

### Passo 2: Executar com perfil LOCAL

```powershell
# Opção 1: Executar direto com Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Opção 2: Compilar e executar o JAR
./mvnw clean package -DskipTests
java -jar target/marketplace-0.0.1-SNAPSHOT.jar --spring.profiles.active=local

# Opção 3: Com IDE (IntelliJ/Eclipse/VS Code)
# Configure a IDE para usar o perfil 'local'
# VM Options: -Dspring.profiles.active=local
```

### Verificar se está rodando

```powershell
# Teste a API
curl http://localhost:8080/actuator/health

# Ou abra no navegador
start http://localhost:8080
```

**Backend estará disponível em:** `http://localhost:8080`

---

## 🎨 3. Executar o Frontend Localmente

### Passo 1: Navegar para o diretório do frontend

```powershell
cd win-frontend
```

### Passo 2: Instalar dependências (primeira vez)

```powershell
npm install
```

### Passo 3: Criar arquivo .env local

Crie um arquivo `.env.local` no diretório `win-frontend`:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=WIN Marketplace
```

### Passo 4: Executar em modo desenvolvimento

```powershell
# Modo desenvolvimento (com hot reload)
npm run dev

# Ou especificar a porta
npm run dev -- --port 3000
```

### Passo 5: Acessar o frontend

Abra o navegador em: `http://localhost:3000`

---

## 🔄 Executar Frontend + Backend Localmente

### Terminal 1 - Backend

```powershell
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Terminal 2 - Frontend

```powershell
cd win-frontend
npm run dev
```

### Terminal 3 - Banco de Dados (se usar Docker)

```powershell
docker-compose up -d postgres
```

---

## ⚙️ Configurações Importantes

### Backend - Perfis de Configuração

O backend suporta 2 perfis:

1. **`local`** - Para desenvolvimento local
   - Arquivo: `application-local.properties`
   - Banco: `localhost:5432`
   - DDL: `update` (cria tabelas automaticamente)

2. **`docker`** - Para rodar no Docker
   - Arquivo: `application-docker.yml`
   - Banco: `postgres:5432` (nome do container)
   - DDL: `update`

### Frontend - Variáveis de Ambiente

Crie `.env.local` no diretório `win-frontend`:

```env
# URL da API Backend
VITE_API_URL=http://localhost:8080

# Outras configurações
VITE_APP_NAME=WIN Marketplace
VITE_APP_VERSION=1.0.0
```

---

## 🐛 Troubleshooting Local

### Backend não inicia

**Erro: "Cannot connect to database"**

1. Verifique se o PostgreSQL está rodando:
   ```powershell
   # Se estiver usando Docker
   docker-compose ps postgres
   
   # Se estiver instalado localmente
   pg_isready -U postgres
   ```

2. Verifique as credenciais em `application-local.properties`

3. Teste a conexão manualmente:
   ```powershell
   psql -h localhost -U postgres -d win_marketplace
   ```

**Erro: "Port 8080 already in use"**

1. Encontre o processo usando a porta:
   ```powershell
   netstat -ano | findstr :8080
   ```

2. Mate o processo ou mude a porta em `application-local.properties`:
   ```properties
   server.port=8081
   ```

### Frontend não conecta ao Backend

**Erro: "Network Error" ou "CORS Error"**

1. Verifique se o backend está rodando:
   ```powershell
   curl http://localhost:8080/actuator/health
   ```

2. Verifique a URL no `.env.local`:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. Limpe o cache e reinstale:
   ```powershell
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

**Erro: "EADDRINUSE: address already in use"**

A porta 3000 já está em uso. Mude a porta:

```powershell
npm run dev -- --port 3001
```

---

## 🔧 Scripts Úteis

### Backend

```powershell
# Compilar sem executar testes
./mvnw clean package -DskipTests

# Executar testes
./mvnw test

# Limpar build
./mvnw clean

# Ver dependências
./mvnw dependency:tree

# Atualizar dependências
./mvnw versions:display-dependency-updates
```

### Frontend

```powershell
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint do código
npm run lint

# Limpar cache
npm cache clean --force
```

---

## 📊 Portas Usadas

| Serviço        | Porta | URL                   |
|----------------|-------|-----------------------|
| Backend        | 8080  | http://localhost:8080 |
| Frontend       | 3000  | http://localhost:3000 |
| PostgreSQL     | 5432  | localhost:5432        |

---

## 🎯 Dicas de Desenvolvimento

### Hot Reload

- **Backend**: O Spring Boot DevTools está configurado para hot reload
- **Frontend**: Vite suporta HMR (Hot Module Replacement) nativamente

### Debug

#### Backend (IntelliJ IDEA)
1. Run → Edit Configurations
2. Add New Configuration → Spring Boot
3. VM options: `-Dspring.profiles.active=local`
4. Run in Debug mode (Shift + F9)

#### Frontend (VS Code)
1. Instale a extensão "JavaScript Debugger"
2. F5 para iniciar debug
3. Coloque breakpoints no código

---

## ✅ Checklist de Execução Local

- [ ] PostgreSQL rodando (Docker ou local)
- [ ] Java 21 instalado e configurado
- [ ] Backend compilando sem erros
- [ ] Backend iniciado com perfil `local`
- [ ] Backend respondendo em http://localhost:8080
- [ ] Node.js e npm instalados
- [ ] Dependências do frontend instaladas (`npm install`)
- [ ] Frontend rodando em http://localhost:3000
- [ ] Frontend conectando ao backend

---

## 🚀 Migrar de Local para Docker

Quando quiser voltar a usar Docker:

```powershell
# Parar processos locais (Ctrl+C nos terminais)

# Iniciar com Docker
docker-compose up -d

# Verificar
docker-compose ps
```

---

## 📝 Observações

1. **Perfil Local**: Sempre use `-Dspring-boot.run.profiles=local` ao rodar o backend localmente
2. **Banco de Dados**: O banco pode estar no Docker mesmo quando backend/frontend rodam localmente
3. **Hot Reload**: Ambos suportam hot reload para desenvolvimento mais rápido
4. **Variáveis de Ambiente**: Use `.env.local` para configurações específicas da sua máquina
5. **Java 21**: Certifique-se de estar usando Java 21 (verifique com `java -version`)

---

## 🎉 Pronto!

Agora você pode desenvolver localmente com total controle sobre cada serviço! 🚀
