<div align="center">

# 🛒 WIN Marketplace

### Plataforma de E-commerce Multi-Vendor com Pagamentos e Entregas Integradas

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[📸 Demo](#-demonstração) • [🚀 Quick Start](#-quick-start) • [✨ Features](#-features-destacadas) • [📚 Documentação](docs/README.md)**

</div>

---

## 📖 Sobre o Projeto

**WIN Marketplace** é uma plataforma completa de e-commerce multi-vendor desenvolvida com as melhores práticas de engenharia de software. Sistema escalável com **integrações reais de pagamento (Pagar.me)** e **entregas (Uber Direct API)**, demonstrando competências em arquitetura full-stack, DevOps e integrações complexas.

### 🎯 Diferenciais Técnicos

- 🏗️ **Arquitetura Full-Stack Profissional** - Backend Spring Boot 3.5.6 + Frontend React 19 + PostgreSQL 16
- 🔌 **Integrações de Produção** - Pagar.me (PIX/Cartão/Boleto) + Uber Direct API + SendGrid
- 🐳 **DevOps Completo** - Multi-stage Docker builds, health checks, otimização de recursos
- 🔐 **Segurança Enterprise** - JWT, bcrypt, CSRF protection, validações robustas
- ⚡ **Performance Otimizada** - Indexes estratégicos, query optimization, fetch strategies
- 📊 **Multi-tenant** - Sistema preparado para múltiplos lojistas com isolamento de dados

---

## 🎬 Demonstração

> 📸 *Adicione aqui screenshots ou GIFs da aplicação em funcionamento*

```
🏠 Home → 🛍️ Catálogo → 🛒 Carrinho → 💳 Checkout → 📦 Rastreamento
```

### Principais Fluxos
- **Consumidor**: Busca produtos → Adiciona ao carrinho → Checkout com PIX → Acompanha entrega
- **Lojista**: Cadastra produtos → Gerencia estoque → Processa pedidos → Recebe pagamentos
- **Admin**: Dashboard analytics → Gestão de usuários → Moderação → Relatórios

---

## ✨ Features Destacadas

<table>
<tr>
<td width="50%">

### 💳 **Pagamentos**
- PIX instantâneo
- Cartão de crédito/débito
- Boleto bancário
- Split de pagamentos (marketplace)

### 🚚 **Entregas**
- Integração Uber Direct
- Cálculo de frete em tempo real
- Rastreamento de pedidos
- Geolocalização de lojistas

</td>
<td width="50%">

### 🔐 **Segurança**
- Autenticação JWT
- Hashing bcrypt
- Proteção CSRF
- Validações robustas

### ⚡ **Performance**
- Indexes otimizados
- Query optimization
- Lazy/Eager loading estratégico
- Docker multi-stage builds

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Portas disponíveis: `3000`, `5432`, `8080`

### Rodar o Projeto

```bash
# Clone e acesse o projeto
git clone https://github.com/ArthurJsph/win-grupo1.git
cd win-grupo1

# Suba todos os serviços
docker-compose up -d

# Crie o primeiro admin
./scripts/create-admin.ps1  # Windows
./scripts/create-admin.sh   # Linux/Mac
```

### 🌐 Acessar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Credenciais Admin**: `admin@winmarketplace.com` / `Admin@2025`

📖 **[Guia Completo de Instalação](docs/getting-started/first-admin.md)**

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|------------|
| **Backend** | Java 21, Spring Boot 3.5.6, Spring Security 6.5.5, Maven 3.9.5, MapStruct |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Shadcn/ui |
| **Database** | PostgreSQL 16, Flyway Migrations |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |
| **Integrações** | Pagar.me, Uber Direct API, SendGrid |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX Reverse Proxy                   │
└─────────────────────────────────────────────────────────┘
           │                                  │
    ┌──────▼──────┐                  ┌───────▼────────┐
    │   Frontend  │                  │    Backend     │
    │  React 19   │ ◄─── REST ────► │ Spring Boot 3.5│
    │   (Port 3000)│                 │   (Port 8080)  │
    └─────────────┘                  └────────┬───────┘
                                              │
                                     ┌────────▼────────┐
                                     │   PostgreSQL 16 │
                                     │   (Port 5432)   │
                                     └─────────────────┘
```

**Serviços Dockerizados**:
- `win-marketplace-frontend` - Interface do usuário
- `win-marketplace-backend` - API REST e lógica de negócio
- `win-marketplace-db` - Banco de dados com persistência

---

## 📁 Estrutura do Projeto

```
win-marketplace/
├── backend/              # Spring Boot API
│   ├── src/main/java/   # Controllers, Services, Models, DTOs
│   └── resources/       # application.yml, migrations
├── win-frontend/        # React App
│   └── src/             # Components, Pages, Contexts
├── docs/                # Documentação técnica
├── api-docs/            # Documentação da API
├── scripts/             # Automação (create-admin, seeds)
└── docker-compose.yml   # Orquestração dos serviços
```

📖 **[Estrutura Detalhada](docs/architecture/project-structure.md)**

---

## 📚 Documentação

### 📘 Para Desenvolvedores
- **[🔑 API - Credenciais & Endpoints](api-docs/INTEGRATION.md)** - Guia completo de integração
- **[📋 Referência de Endpoints](api-docs/ENDPOINTS.md)** - Todos os endpoints documentados
- **[🎯 Criar Primeiro Admin](docs/getting-started/first-admin.md)** - Setup inicial (5 min)
- **[⚡ Comandos Rápidos](docs/getting-started/quick-reference.md)** - Referência rápida

### ⚙️ Configuração & Deploy
- **[📧 Configurar Email SendGrid](docs/configuration/email-sendgrid.md)** - Setup de email (10 min)
- **[🐳 Deploy com Docker](docs/deployment/docker.md)** - Guia completo Docker
- **[💻 Desenvolvimento Local](docs/deployment/local-development.md)** - Rodar sem Docker
- **[🔐 Segurança](docs/SECURITY.md)** - Boas práticas e políticas

### 🏗️ Arquitetura & Otimizações
- **[📐 Estrutura do Projeto](docs/architecture/project-structure.md)** - Organização do código
- **[✨ Otimizações Aplicadas](docs/OPTIMIZATION.md)** - Performance e melhorias

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

📖 Leia o **[Guia de Contribuição](CONTRIBUTING.md)** completo

---

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Arthur Joseph**  
📧 Email: [agenoralencaar@gmail.com](mailto:agenoralencaar@gmail.com)  
🔗 GitHub: [@ArthurJsph](https://github.com/ArthurJsph)

---

## 🙏 Agradecimentos

Desenvolvido como projeto acadêmico pela **Equipe WIN - Grupo 1**

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

</div>
