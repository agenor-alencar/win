# 📁 Estrutura do Projeto WIN Marketplace

## 🎯 Serviços do Projeto

O projeto é composto por **3 serviços principais** que rodam de forma independente:

### 1. **PostgreSQL** (Banco de Dados)
- **Container:** `win-marketplace-db`
- **Imagem:** `postgres:16-alpine`
- **Porta:** `5432`
- **Credenciais:**
  - Database: `win_marketplace`
  - User: `postgres`
  - Password: `postgres123`
- **Volume:** `win-grupo1_postgres_data` (persistência de dados)

### 2. **Backend** (API REST)
- **Container:** `win-marketplace-backend`
- **Tecnologia:** Spring Boot 3.5.6 + Java 21
- **Porta:** `8080`
- **Profile:** `docker` (quando em container)
- **Build:** Multi-stage com Maven 3.9.5 + Eclipse Temurin 21
- **Endpoints:** http://localhost:8080

### 3. **Frontend** (Interface Web)
- **Container:** `win-marketplace-frontend`
- **Tecnologia:** React + Vite + TypeScript
- **Porta:** `3000`
- **Build:** Node.js 22
- **Acesso:** http://localhost:3000

---

## 🚀 Comandos Rápidos

### Iniciar Serviços Individuais

```bash
# Apenas banco de dados
docker-compose up -d postgres

# Apenas backend
docker-compose up -d backend

# Apenas frontend
docker-compose up -d frontend

# Backend + Banco
docker-compose up -d postgres backend

# Todos os serviços
docker-compose up -d
```

### Parar Serviços

```bash
# Parar serviço específico
docker-compose stop backend

# Parar todos
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v
```

### Monitorar Serviços

```bash
# Ver status
docker-compose ps

# Ver logs de um serviço
docker-compose logs -f backend

# Ver logs de todos
docker-compose logs -f
```

---

## 📂 Estrutura de Diretórios

```
win-grupo1/
├── backend/                    # Aplicação Spring Boot
│   ├── src/
│   ├── pom.xml                 # Maven dependencies
│   └── Dockerfile              # Build multi-stage Java 21
├── win-frontend/               # Aplicação React
│   ├── src/
│   ├── package.json
│   └── Dockerfile              # Build Node.js 22
├── database/
│   └── init.sql                # Script de inicialização do banco
├── docker-compose.yml          # Orquestração dos serviços
├── .env                        # Variáveis de ambiente
└── EXECUTAR_SERVICOS.md        # Guia completo de execução
```

---

## 🔧 Arquivos de Configuração

### docker-compose.yml
Define os 3 serviços independentes sem dependências (`depends_on` removido).

### .env
Contém todas as variáveis de ambiente para os serviços:
- Configurações do PostgreSQL
- URLs de conexão
- Perfis Spring Boot
- Configurações do Frontend

---

## 📝 Características Importantes

✅ **Independência Total:** Cada serviço pode ser iniciado/parado independentemente
✅ **Auto-restart:** Todos os serviços têm `restart: unless-stopped`
✅ **Healthcheck:** PostgreSQL com verificação de saúde configurada
✅ **Persistência:** Dados do banco persistidos em volume Docker
✅ **Multi-stage Build:** Backend otimizado com build em camadas
✅ **Java 21 LTS:** Versão mais recente do Java com suporte de longo prazo

---

## 🌐 Rede

Todos os serviços compartilham a rede `win-network` (bridge driver), permitindo comunicação entre containers através dos nomes dos serviços.

---

## 📚 Documentação Adicional

- **EXECUTAR_SERVICOS.md** - Guia detalhado de execução Docker
- **EXECUTAR_LOCAL.md** - Guia para desenvolvimento local sem Docker
- **scripts-docker.md** - Referência rápida de comandos Docker

---

## 🎓 Versões

- **Java:** 21 (LTS)
- **Spring Boot:** 3.5.6
- **PostgreSQL:** 16-alpine
- **Node.js:** 22
- **Maven:** 3.9.5
- **Docker Compose:** v2.x

---

## 🔒 Segurança

⚠️ **Atenção:** As credenciais padrão são para ambiente de desenvolvimento. 
Para produção, altere as senhas no arquivo `.env` e use secrets do Docker.
