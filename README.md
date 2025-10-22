# 🛒 WIN Marketplace

Sistema de marketplace desenvolvido com Spring Boot, React e PostgreSQL.

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
├── backend/                    # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/win/marketplace/
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── model/           # JPA Entities
│   │   │   │   ├── repository/      # Spring Data Repos
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   └── mapper/          # MapStruct Mappers
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-docker.yml
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
│
├── win-frontend/               # React Application
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
├── database/
│   └── init.sql                # Initial DB setup
│
├── docker-compose.yml          # Services orchestration
├── .env                        # Environment variables
│
└── 📚 Documentação/
    ├── ESTRUTURA_PROJETO.md    # Arquitetura detalhada
    ├── EXECUTAR_SERVICOS.md    # Guia Docker completo
    ├── EXECUTAR_LOCAL.md       # Desenvolvimento local
    └── scripts-docker.md       # Comandos rápidos
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
- **SendGrid (10 min):** `_DOCS/SENDGRID_QUICKSTART.md`
- **SendGrid Detalhado:** `_DOCS/SENDGRID_SETUP.md`
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

### Configuração e Deploy
- **[SENDGRID_QUICKSTART.md](./_DOCS/SENDGRID_QUICKSTART.md)** - Setup SendGrid em 10 minutos ⚡
- **[SENDGRID_SETUP.md](./_DOCS/SENDGRID_SETUP.md)** - Guia completo SendGrid 📧
- **[EMAIL_SETUP.md](./_DOCS/EMAIL_SETUP.md)** - Configuração Gmail (alternativa)
- **[PASSWORD_RESET_IMPLEMENTATION.md](./_DOCS/PASSWORD_RESET_IMPLEMENTATION.md)** - Sistema de reset de senha

### Arquitetura e Execução
- **[ESTRUTURA_PROJETO.md](./ESTRUTURA_PROJETO.md)** - Arquitetura e componentes
- **[EXECUTAR_SERVICOS.md](./EXECUTAR_SERVICOS.md)** - Guia completo Docker
- **[EXECUTAR_LOCAL.md](./EXECUTAR_LOCAL.md)** - Desenvolvimento local
- **[scripts-docker.md](./scripts-docker.md)** - Referência rápida

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

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma [issue](https://github.com/ArthurJsph/win-grupo1/issues)
- Consulte a documentação completa
- Verifique os logs: `docker-compose logs -f`

---

**Desenvolvido com ❤️ pela equipe WIN**
