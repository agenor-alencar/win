# 🚀 Guia de Execução Independente dos Serviços

Este guia mostra como rodar cada serviço (Backend, Frontend e Banco de Dados) de forma independente.

## 📋 Arquitetura do Projeto

O projeto é composto por **3 serviços principais**:

1. **PostgreSQL** - Banco de dados (porta 5432)
2. **Backend (Spring Boot + Java 21)** - API REST (porta 8080)
3. **Frontend (React + Vite)** - Interface web (porta 3000)

Todos os serviços podem ser executados de forma **completamente independente**.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Java 21 (para rodar backend localmente)
- Node.js 22+ (para rodar frontend localmente)

---

## 🎯 Executar Serviços Individuais

### 1️⃣ **Apenas o Banco de Dados (PostgreSQL)**

```bash
# Iniciar apenas o banco de dados
docker-compose up -d postgres

# Verificar status
docker-compose ps postgres

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose stop postgres
```

**Conexão:**
- Host: `localhost`
- Porta: `5432`
- Database: `win_marketplace`
- User: `postgres`
- Password: `postgres123`

---

### 2️⃣ **Apenas o Backend (Spring Boot)**

#### Opção A: Usando Docker

```bash
# Iniciar backend (requer banco rodando)
docker-compose up -d backend

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose stop backend
```

#### Opção B: Localmente (sem Docker)

```bash
# Navegar para o diretório do backend
cd backend

# Compilar e executar
./mvnw spring-boot:run

# OU compilar primeiro
./mvnw clean package -DskipTests
java -jar target/marketplace-0.0.1-SNAPSHOT.jar
```

**Acesso:** http://localhost:8080

---

### 3️⃣ **Apenas o Frontend (React/Vite)**

#### Opção A: Usando Docker

```bash
# Iniciar frontend
docker-compose up -d frontend

# Ver logs
docker-compose logs -f frontend

# Parar
docker-compose stop frontend
```

#### Opção B: Localmente (sem Docker)

```bash
# Navegar para o diretório do frontend
cd win-frontend

# Instalar dependências (primeira vez)
npm install

# Executar em modo desenvolvimento
npm run dev

# OU executar em modo produção
npm run build
npm run preview
```

**Acesso:** http://localhost:3000

---

## 🔄 Executar Múltiplos Serviços

### Backend + Banco de Dados

```bash
docker-compose up -d postgres backend
```

### Frontend + Backend + Banco de Dados

```bash
docker-compose up -d postgres backend frontend
```

### Todos os Serviços

```bash
docker-compose up -d
```

---

## 🛠️ Comandos Úteis

### Ver status de todos os serviços

```bash
docker-compose ps
```

### Ver logs de um serviço específico

```bash
docker-compose logs -f <nome-do-serviço>
# Exemplos:
# docker-compose logs -f backend
# docker-compose logs -f frontend
# docker-compose logs -f postgres
```

### Reiniciar um serviço específico

```bash
docker-compose restart <nome-do-serviço>
```

### Parar todos os serviços

```bash
docker-compose down
```

### Parar e remover volumes (limpar dados)

```bash
docker-compose down -v
```

### Reconstruir imagens

```bash
# Reconstruir todos
docker-compose build

# Reconstruir um específico
docker-compose build backend
docker-compose build frontend
```

---

## 🔧 Configuração de Ambiente

As configurações estão no arquivo `.env` na raiz do projeto. Você pode modificar:

- **Portas dos serviços**
- **Credenciais do banco de dados**
- **URL da API no frontend**

Após modificar o `.env`, reinicie os serviços:

```bash
docker-compose down
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Backend não conecta ao banco

1. Verifique se o banco está rodando:
   ```bash
   docker-compose ps postgres
   ```

2. Verifique os logs do banco:
   ```bash
   docker-compose logs postgres
   ```

3. Teste a conexão:
   ```bash
   docker exec -it win-marketplace-db psql -U postgres -d win_marketplace
   ```

### Frontend não conecta ao backend

1. Verifique a variável `VITE_API_URL` no `.env`
2. Certifique-se que o backend está rodando na porta 8080
3. Verifique os logs do frontend:
   ```bash
   docker-compose logs -f frontend
   ```

### Porta já está em uso

Se alguma porta já estiver em uso, modifique no arquivo `.env`:

```env
BACKEND_PORT=8081    # Mude para outra porta
FRONTEND_PORT=3001   # Mude para outra porta
```

---

## 📊 Portas dos Serviços

| Serviço    | Porta | URL                        |
|------------|-------|----------------------------|
| Frontend   | 3000  | http://localhost:3000      |
| Backend    | 8080  | http://localhost:8080      |
| PostgreSQL | 5432  | localhost:5432             |
| pgAdmin    | 5050  | http://localhost:5050      |

---

## ✅ Verificação de Saúde

### Backend (Health Check)

```bash
curl http://localhost:8080/actuator/health
```

### Frontend

```bash
curl http://localhost:3000
```

### Banco de Dados

```bash
docker exec win-marketplace-db pg_isready -U postgres
```

---

## 📝 Notas Importantes

1. **Independência dos Serviços**: Cada serviço pode ser iniciado/parado independentemente
2. **Sem `depends_on`**: Removemos as dependências automáticas entre serviços
3. **Restart Policy**: Todos os serviços têm `restart: unless-stopped` para reiniciar automaticamente
4. **Volumes**: Dados do banco são persistidos em volumes Docker
5. **Hot Reload**: Frontend com volume montado suporta hot reload no desenvolvimento

---

## 🎉 Upgrade para Java 21

O backend agora roda com **Java 21 LTS**, trazendo:
- ✅ Virtual Threads para melhor performance
- ✅ Pattern Matching aprimorado
- ✅ Garbage Collector otimizado
- ✅ Suporte até 2028

---

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Logs dos serviços: `docker-compose logs -f <serviço>`
2. Status dos containers: `docker-compose ps`
3. Configurações no arquivo `.env`
