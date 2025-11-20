# 📚 Documentação da API - WIN Marketplace

Esta pasta contém a documentação completa da API REST do WIN Marketplace para consumo externo.

---

## 📖 Documentos Disponíveis

| Documento | Descrição | Público-Alvo |
|-----------|-----------|--------------|
| **[INTEGRATION.md](INTEGRATION.md)** | 🔑 Guia completo de integração, credenciais e testes | Desenvolvedores |
| **[ENDPOINTS.md](ENDPOINTS.md)** | 📋 Referência completa de todos os endpoints | Desenvolvedores |
| **[POSTMAN.md](POSTMAN.md)** | 📮 Collection Postman para testes | QA/Testers |

---

## 🚀 Início Rápido

### Para Integrar com a API

1. **Ler:** [INTEGRATION.md](INTEGRATION.md) - Credenciais e setup
2. **Testar:** Endpoints de autenticação
3. **Implementar:** Sua integração
4. **Consultar:** [ENDPOINTS.md](ENDPOINTS.md) para referência completa

### Para Testar a API

1. **Subir o sistema:**
   ```bash
   docker-compose up -d
   ```

2. **Obter token:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@winmarketplace.com","senha":"Admin123!"}'
   ```

3. **Usar token nos requests:**
   ```bash
   curl http://localhost:8080/api/v1/produtos \
        -H "Authorization: Bearer {seu_token}"
   ```

---

## 🔌 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/login` - Login e obtenção de token
- `POST /api/v1/auth/esqueci-senha` - Recuperação de senha
- `POST /api/v1/auth/resetar-senha` - Resetar senha

### Produtos
- `GET /api/v1/produtos` - Listar produtos
- `GET /api/v1/produtos/{id}` - Buscar produto por ID
- `POST /api/v1/produtos` - Criar produto (MERCHANT)
- `PUT /api/v1/produtos/{id}` - Atualizar produto
- `DELETE /api/v1/produtos/{id}` - Remover produto

### Usuários
- `GET /api/v1/usuarios/me` - Dados do usuário autenticado
- `PUT /api/v1/usuarios/me` - Atualizar dados

### Dev Tools (Desenvolvimento)
- `POST /api/v1/dev/hash-password` - Gerar hash BCrypt
- `POST /api/v1/dev/verify-password` - Verificar senha

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Token)** para autenticação.

### Como Obter Token

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "senha": "suaSenha"
}
```

### Como Usar Token

```bash
GET /api/v1/produtos
Authorization: Bearer {seu_token_jwt}
```

---

## 📋 Credenciais de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@winmarketplace.com | Admin123! |
| Lojista | lojista@teste.com | Lojista123! |
| Cliente | cliente@teste.com | Cliente123! |

---

## 🌐 URLs

| Ambiente | URL | Swagger |
|----------|-----|---------|
| **Local** | http://localhost:8080 | http://localhost:8080/swagger-ui.html |
| **Dev** | https://dev-api.winmarketplace.com | https://dev-api.winmarketplace.com/swagger-ui.html |
| **Prod** | https://api.winmarketplace.com | https://api.winmarketplace.com/swagger-ui.html |

---

## 📚 Documentação Relacionada

### Backend
- [Backend README](../backend/README.md)
- [Estrutura do Projeto](../docs/architecture/project-structure.md)

### Configuração
- [Criar Admin](../docs/getting-started/first-admin.md)
- [Configurar Email](../docs/configuration/email-sendgrid.md)
- [Docker](../docs/deployment/docker.md)

### Segurança
- [Guia de Segurança](../docs/SECURITY.md)
- [Otimizações](../docs/OPTIMIZATION.md)

---

## 🛠️ Ferramentas Recomendadas

- **Postman** - Testar endpoints interativamente
- **cURL** - Testar via linha de comando
- **Insomnia** - Alternativa ao Postman
- **Swagger UI** - Documentação interativa integrada

---

## 📞 Suporte

- 📧 Email: suporte@winmarketplace.com
- 🐛 Issues: https://github.com/ArthurJsph/win-grupo1/issues
- 📖 Documentação: [docs/README.md](../docs/README.md)

---

**Última atualização:** 23 de outubro de 2025
