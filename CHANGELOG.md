# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Sistema de notificações em tempo real
- Chat entre lojistas e clientes
- Programa de fidelidade
- Analytics avançados
- App mobile React Native

---

## [1.0.0] - 2025-03-02

### 🎉 Release Inicial

Primeira versão pública do WIN Marketplace com funcionalidades principais implementadas.

### ✨ Adicionado

#### Backend
- Sistema de autenticação JWT com refresh tokens
- CRUD completo de usuários (Cliente, Lojista, Admin)
- Gestão de produtos com upload de imagens
- Carrinho de compras com gestão de itens
- Sistema de pedidos e checkout
- Integração com Pagar.me (PIX, Cartão, Boleto)
- Integração com Uber Direct API para entregas
- Sistema de avaliações e comentários
- Geolocalização de lojistas
- Busca avançada de produtos
- Sistema de banners promocionais
- API RESTful documentada
- Migrations com Flyway
- Health checks e monitoramento
- Logs estruturados

#### Frontend
- Interface responsiva com TailwindCSS
- Componentes reutilizáveis com Shadcn/ui
- Autenticação e autorização por roles
- Páginas de catálogo e produto
- Carrinho de compras interativo
- Fluxo de checkout completo
- Painel administrativo
- Painel de lojista
- Sistema de busca com filtros
- Integração com APIs de pagamento/entrega
- Loading states e error handling
- Validação de formulários

#### DevOps
- Configuração Docker e Docker Compose
- Containerização de todos os serviços
- Health checks automáticos
- Volume persistence
- Nginx configurado como reverse proxy
- Scripts de automação (create-admin, seed-categorias)
- Otimizações de performance
- Configuração de produção

#### Documentação
- README.md profissional e detalhado
- Guia de instalação completo
- Documentação de configuração
- Guia de contribuição
- Política de segurança
- Código de conduta
- Templates de issues e PRs
- Documentação de API
- Guias de deploy

### 🔒 Segurança

- Autenticação JWT com tokens seguros
- Hashing de senhas com BCrypt (12 rounds)
- Proteção CSRF
- Validação de inputs
- Sanitização de outputs
- SQL injection prevention
- XSS protection
- Rate limiting implementado
- HTTPS ready
- Variáveis de ambiente protegidas

### ⚡ Performance

- Índices otimizados no PostgreSQL
- Queries otimizadas com JPA
- Lazy loading implementado
- Connection pooling configurado
- Cache de queries frequentes
- Compressão de respostas
- Image optimization
- Code splitting no frontend

---

## Tipos de Mudanças

- `Added` - para novas funcionalidades
- `Changed` - para mudanças em funcionalidades existentes
- `Deprecated` - para funcionalidades que serão removidas
- `Removed` - para funcionalidades removidas
- `Fixed` - para correções de bugs
- `Security` - para vulnerabilidades corrigidas

---

## Versionamento

Este projeto usa [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (1.x.x): Mudanças incompatíveis na API
- **MINOR** (x.1.x): Novas funcionalidades compatíveis
- **PATCH** (x.x.1): Correções de bugs compatíveis

---

## Links

- [Unreleased]: https://github.com/ArthurJsph/win-grupo1/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/ArthurJsph/win-grupo1/releases/tag/v1.0.0

---

**Nota**: Para ver a lista completa de commits, visite os [Releases](https://github.com/ArthurJsph/win-grupo1/releases) no GitHub.
