# 🛒 WIN Marketplace

Sistema de marketplace desenvolvido com Spring Boot, React e PostgreSQL.

> 📚 **[Documentação Completa](docs/README.md)** | 🔑 **[Criar Admin](docs/getting-started/first-admin.md)** | ⚙️ **[Configurar Email](docs/configuration/email-sendgrid.md)**

## 🏗️ Arquitetura

O projeto é composto por **3 serviços independentes**:

| Serviço | Tecnologia | Porta | Container |
|---------|-----------|-------|-----------|
| **Backend** | Spring Boot 3.5.6 + Java 21 | 8080 | win-marketplace-backend |
| **Frontend** | React + Vite + TypeScript | 3000 | win-marketplace-frontend |
| **Database** | PostgreSQL 16 Alpine | 5432 | win-marketplace-db |

---

## 🚀 Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas 3000, 5432 e 8080 disponíveis

### Executar Todos os Serviços

```bash
# Clonar o repositório
git clone https://github.com/ArthurJsph/win-grupo1.git
cd win-grupo1

# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Acessar a Aplicação

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database:** localhost:5432 (user: postgres, password: postgres123)

---

## 📋 Execução Independente

Cada serviço pode ser executado de forma independente:

```bash
# Apenas banco de dados
docker-compose up -d postgres

# Apenas backend (requer banco)
docker-compose up -d backend

# Apenas frontend
docker-compose up -d frontend

# Backend + Banco
docker-compose up -d postgres backend
```

---

## 🛠️ Tecnologias

### Backend
- **Java 21** (LTS - Eclipse Temurin)
- **Spring Boot 3.5.6**
  - Spring Data JPA
  - Spring Security 6.5.5
  - Spring Web
- **Maven 3.9.5**
- **MapStruct 1.5.5** (DTO mapping)
- **PostgreSQL Driver**
- **Hibernate**

### Frontend
- **React 19**
- **TypeScript**
- **Vite**
- **TailwindCSS**
- **Shadcn/ui** (componentes)
- **React Router**
- **Axios**

### Database
- **PostgreSQL 16** (Alpine)
- **Flyway** (migrations)

### DevOps
- **Docker & Docker Compose**
- **Multi-stage builds**
- **Health checks**
- **Volume persistence**

---

## 📁 Estrutura do Projeto

```
win-grupo1/
├── backend/                    # Spring Boot Application (Sistema API)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/win/marketplace/
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── model/           # JPA Entities
│   │   │   │   ├── repository/      # Spring Data Repos
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── mapper/          # MapStruct Mappers
│   │   │   │   └── util/            # Utilities (PasswordHashGenerator)
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-docker.yml
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
│
├── win-frontend/               # React Application (Sistema Frontend)
│   ├── src/
│   │   ├── components/         # React Components
│   │   ├── contexts/           # Context API
│   │   ├── hooks/              # Custom Hooks
│   │   ├── pages/              # Page Components
│   │   ├── lib/                # Utilities
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
│
├── database/                   # Banco de Dados (Scripts SQL)
│   ├── init.sql                # Initial DB setup
│   └── seeds/                  # Dados iniciais
│       └── seed-categorias.sql
│
├── docs/                       # Documentação do Projeto
│   ├── README.md               # Índice da documentação
│   ├── SECURITY.md             # Guia de segurança
│   ├── OPTIMIZATION.md         # Otimizações implementadas
│   ├── CLEANUP.md              # Limpeza de arquivos
│   ├── getting-started/        # Primeiros passos
│   ├── admin/                  # Administração
│   ├── configuration/          # Configurações
│   ├── deployment/             # Deploy e execução
│   ├── development/            # Desenvolvimento
│   └── architecture/           # Arquitetura e specs
│
├── integracoes/                # 🆕 Módulos de Integração Externa
│   └── README.md               # Guia de integrações (SendGrid, etc)
│
├── api-docs/                   # 🆕 API para Consumo Externo
│   ├── README.md               # Índice da documentação API
│   ├── INTEGRATION.md          # 🔑 Credenciais + Testes + Endpoints
│   └── ENDPOINTS.md            # 📋 Referência completa de endpoints
│
├── scripts/                    # Scripts auxiliares
│   ├── create-admin.ps1        # Criar admin (PowerShell)
│   ├── create-admin.sh         # Criar admin (Bash)
│   └── seed-categorias.ps1     # Popular categorias
│
├── uploads/                    # Arquivos enviados (produtos)
│   └── .gitkeep
│
├── docker-compose.yml          # Orquestração dos serviços
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Template de variáveis
└── .gitignore                  # Arquivos ignorados pelo git
```

---

## 🔧 Comandos Úteis

### Docker

```bash
# Status dos serviços
docker-compose ps

# Logs de um serviço
docker-compose logs -f backend

# Reiniciar um serviço
docker-compose restart backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v

# Reconstruir imagens
docker-compose build

# Rebuild e reiniciar
docker-compose up -d --build
```

### Backend (Local)

```bash
cd backend

# Build
./mvnw clean package -DskipTests

# Executar
./mvnw spring-boot:run

# Executar com profile docker
./mvnw spring-boot:run -Dspring-boot.run.profiles=docker

# Testes
./mvnw test
```

### Frontend (Local)

```bash
cd win-frontend

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

---

## 🔒 Configuração

### Configuração Básica

O sistema funciona imediatamente após o `docker-compose up`, mas para funcionalidades completas:

#### 📧 **Configuração de Email (Opcional - Para Reset de Senha)**

O sistema suporta **SendGrid** (recomendado) ou **Gmail**:

**Opção 1: SendGrid (Profissional - RECOMENDADO)**
```bash
# 1. Criar conta grátis em: https://signup.sendgrid.com/
# 2. Copiar .env.sendgrid.template para .env
cp .env.sendgrid.template .env

# 3. Preencher no .env:
SENDGRID_API_KEY=SG.sua-api-key-aqui
MAIL_FROM=seu-email-verificado@gmail.com

# 4. Reiniciar backend
docker-compose restart backend
```

**Opção 2: Gmail (Apenas Desenvolvimento)**
```bash
# Ver guia completo em: _DOCS/EMAIL_SETUP.md
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=senha-app-16-caracteres
```

📖 **Guias Completos:**
- **SendGrid (10 min):** [docs/configuration/email-sendgrid.md](docs/configuration/email-sendgrid.md)
- **SendGrid Detalhado:** [docs/configuration/email-sendgrid-detailed.md](docs/configuration/email-sendgrid-detailed.md)

#### 🔑 **Criar Conta Admin (Primeira Configuração)**

Para acessar o painel administrativo, você precisa criar uma conta admin.

**📖 Guia Completo:** [docs/getting-started/first-admin.md](docs/getting-started/first-admin.md)

**Método Rápido (PowerShell/Windows):**
```powershell
# 1. Gerar hash da senha
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"Admin@2025","email":"admin@winmarketplace.com","nome":"Administrador"}' `
  | Select-Object -ExpandProperty hash

# 2. Copiar o hash e inserir no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), 'admin@winmarketplace.com', 'COLE_O_HASH_AQUI', 'Administrador', 'ADMIN', true, NOW(), NOW());
"
```

**Ou use o script automatizado:**
```powershell
# Windows: .\scripts\create-admin.ps1
# Linux/Mac: ./scripts/create-admin.sh
```
- **Gmail:** `_DOCS/EMAIL_SETUP.md`

> ✅ **12.000 emails grátis/mês** com SendGrid  
> ⚠️ Gmail limita a 500 emails/dia

---

### Variáveis de Ambiente (.env)

```env
# PostgreSQL
POSTGRES_DB=win_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Backend
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/win_marketplace

# Email (SendGrid - Opcional)
SENDGRID_API_KEY=
MAIL_FROM=
FRONTEND_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:8080
NODE_ENV=development
```

⚠️ **Atenção:** Altere as credenciais para produção!

---

## 🐛 Troubleshooting

### Porta em uso

```bash
# Windows - ver processo usando a porta
netstat -ano | findstr :8080

# Matar processo pelo PID
taskkill /PID <PID> /F
```

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs -f <service-name>

# Verificar healthcheck do banco
docker inspect win-marketplace-db | grep -A 10 Health

# Reiniciar serviço
docker-compose restart <service-name>
```

### Problemas de build

```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild forçado
docker-compose build --no-cache

# Remover volumes antigos
docker volume prune
```

---

## 📚 Documentação Completa

### 🚀 Para Desenvolvedores

#### Integração e API
- **[📘 api-docs/INTEGRATION.md](./api-docs/INTEGRATION.md)** - 🔑 **Credenciais + Endpoints + Testes** (INÍCIO AQUI!)
- **[📋 api-docs/ENDPOINTS.md](./api-docs/ENDPOINTS.md)** - Referência completa de todos os endpoints
- **[📚 api-docs/README.md](./api-docs/README.md)** - Índice da documentação API

#### Primeiros Passos
- **[🎯 docs/getting-started/first-admin.md](./docs/getting-started/first-admin.md)** - Criar primeiro admin (5 min)
- **[⚡ docs/getting-started/quick-reference.md](./docs/getting-started/quick-reference.md)** - Comandos rápidos

### ⚙️ Configuração

#### Email e Segurança
- **[📧 docs/configuration/email-sendgrid.md](./docs/configuration/email-sendgrid.md)** - Setup SendGrid (10 min) ⚡
- **[📧 docs/configuration/email-sendgrid-detailed.md](./docs/configuration/email-sendgrid-detailed.md)** - Guia completo SendGrid
- **[📧 docs/configuration/email-gmail.md](./docs/configuration/email-gmail.md)** - Configuração Gmail (dev)
- **[🔐 docs/SECURITY.md](./docs/SECURITY.md)** - Guia de segurança e boas práticas

#### Administração
- **[🔑 docs/admin/password-hash.md](./docs/admin/password-hash.md)** - Gerador de hash de senha
- **[💡 docs/admin/hash-examples.md](./docs/admin/hash-examples.md)** - 10 exemplos práticos

### 🐳 Deploy e Execução
- **[🐳 docs/deployment/docker.md](./docs/deployment/docker.md)** - Executar com Docker
- **[🐳 docs/deployment/docker-commands.md](./docs/deployment/docker-commands.md)** - Comandos Docker
- **[💻 docs/deployment/local-development.md](./docs/deployment/local-development.md)** - Desenvolvimento local

### 🏗️ Arquitetura
- **[📐 docs/architecture/project-structure.md](./docs/architecture/project-structure.md)** - Estrutura do projeto
- **[📋 docs/architecture/specifications.md](./docs/architecture/specifications.md)** - Especificações e requisitos

### ⚡ Otimização
- **[✨ docs/OPTIMIZATION.md](./docs/OPTIMIZATION.md)** - Resumo de otimizações
- **[🧹 docs/CLEANUP.md](./docs/CLEANUP.md)** - Limpeza de arquivos

### 🔌 Integrações
- **[🔌 integracoes/README.md](./integracoes/README.md)** - Guia de integrações externas (SendGrid, etc)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👥 Equipe

**WIN - Grupo 1**

---

## � Documentação

- **[📖 Documentação Completa](docs/README.md)** - Índice de toda documentação
- **[🚀 Criar Admin](docs/getting-started/first-admin.md)** - Primeiro acesso
- **[⚙️ Configurar Email](docs/configuration/email-sendgrid.md)** - SendGrid setup
- **[🐳 Docker](docs/deployment/docker.md)** - Guia Docker completo
- **[🏗️ Arquitetura](docs/architecture/project-structure.md)** - Estrutura do código

---

## �📞 Suporte

Para problemas ou dúvidas:
- **[📚 Consulte a documentação](docs/README.md)**
- Abra uma [issue](https://github.com/ArthurJsph/win-grupo1/issues)
- Verifique os logs: `docker-compose logs -f`

---

**Desenvolvido com ❤️ pela equipe WIN**
