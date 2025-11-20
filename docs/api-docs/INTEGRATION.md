# 📘 Guia de Acesso e Integração - WIN Marketplace

> **Documentação para integração e testes da API**

**Versão:** 1.0.0  
**Última atualização:** 23 de outubro de 2025

---

## 🔐 Credenciais de Acesso

### Ambiente de Desenvolvimento

| Tipo | Usuário/Email | Senha | Papel |
|------|--------------|-------|-------|
| **Admin** | admin@winmarketplace.com | Admin123! | ADMIN |
| **Lojista** | lojista@teste.com | Lojista123! | MERCHANT |
| **Cliente** | cliente@teste.com | Cliente123! | CUSTOMER |

### URLs de Acesso

| Ambiente | URL | Status |
|----------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Ativo |
| **Backend API** | http://localhost:8080 | ✅ Ativo |
| **Database** | localhost:5432 | ✅ Ativo |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | 📝 Documentação |

### Banco de Dados

```properties
Host: localhost
Port: 5432
Database: win_marketplace
User: postgres
Password: postgres123 (dev) / [definir no .env para produção]
```

---

## 📝 Resumo das Atualizações

### ✅ Implementado Recentemente

#### 1. **Gerador de Hash de Senha** (v1.2.0)
- ✨ API REST para gerar hash BCrypt
- ✨ Script PowerShell para criar admin via CLI
- ✨ Endpoint de verificação de senha
- 📍 **Como usar:** [docs/getting-started/first-admin.md](../docs/getting-started/first-admin.md)
- 🧪 **Testar:**
  ```bash
  curl -X POST http://localhost:8080/api/v1/dev/hash-password \
       -H "Content-Type: application/json" \
       -d '{"senha": "MinhaSenh@123"}'
  ```

#### 2. **Configuração de Email (SendGrid)** (v1.1.0)
- ✨ Integração com SendGrid para emails transacionais
- ✨ Suporte alternativo Gmail para desenvolvimento
- ✨ Templates de recuperação de senha
- 📍 **Como configurar:** [docs/configuration/email-sendgrid.md](../docs/configuration/email-sendgrid.md)
- 🧪 **Testar:**
  ```bash
  # Endpoint de esqueci senha
  curl -X POST http://localhost:8080/api/v1/auth/esqueci-senha \
       -H "Content-Type: application/json" \
       -d '{"email": "seu@email.com"}'
  ```

#### 3. **Otimizações de Segurança** (v1.0.5)
- 🔒 Senhas removidas do docker-compose.yml
- 🔒 .env.example completo
- 🔒 .gitignore robusto (~180 padrões)
- 📍 **Documentação:** [docs/SECURITY.md](../docs/SECURITY.md)



## 🔌 Endpoints da API

### Autenticação

#### POST `/api/v1/auth/login`
Autentica usuário e retorna token JWT.

**Request:**
```json
{
  "email": "admin@winmarketplace.com",
  "senha": "Admin123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "email": "admin@winmarketplace.com",
  "nome": "Administrador",
  "papel": "ADMIN"
}
```

**Erros:**
- `401 Unauthorized` - Credenciais inválidas
- `400 Bad Request` - Dados inválidos

---

#### POST `/api/v1/auth/esqueci-senha`
Envia email de recuperação de senha.

**Request:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response (200 OK):**
```json
{
  "mensagem": "Email de recuperação enviado com sucesso"
}
```

**Requisitos:**
- ✅ SendGrid configurado (.env com SENDGRID_API_KEY)
- ✅ Email cadastrado no sistema

---

#### POST `/api/v1/auth/resetar-senha`
Reseta senha usando token recebido por email.

**Request:**
```json
{
  "token": "abc123def456",
  "novaSenha": "NovaSenha123!"
}
```

**Response (200 OK):**
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

---

### Dev Tools (Desenvolvimento)

#### POST `/api/v1/dev/hash-password`
Gera hash BCrypt de uma senha.

**⚠️ Disponível apenas quando `DEV_TOOLS_ENABLED=true`**

**Request:**
```json
{
  "senha": "MinhaSenh@123"
}
```

**Response (200 OK):**
```json
{
  "senha": "MinhaSenh@123",
  "hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "algoritmo": "BCrypt",
  "strength": 10,
  "sqlExample": "INSERT INTO usuarios (email, senha, nome, papel) VALUES ('admin@exemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'ADMIN');",
  "timestamp": "2025-10-23T14:30:00"
}
```

**Como testar:**
```bash
# PowerShell
$body = @{ senha = "MinhaSenh@123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $body

# cURL
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
     -H "Content-Type: application/json" \
     -d '{"senha":"MinhaSenh@123"}'
```

---

#### POST `/api/v1/dev/verify-password`
Verifica se uma senha corresponde a um hash.

**Request:**
```json
{
  "senha": "MinhaSenh@123",
  "hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
}
```

**Response (200 OK):**
```json
{
  "match": true,
  "mensagem": "Senha corresponde ao hash"
}
```

---

### Produtos

#### GET `/api/v1/produtos`
Lista todos os produtos ativos.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 0)
- `size` (opcional): Itens por página (padrão: 20)
- `categoriaId` (opcional): Filtrar por categoria
- `lojistaId` (opcional): Filtrar por lojista

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Notebook Dell",
      "descricao": "Notebook Dell Inspiron 15",
      "preco": 3500.00,
      "estoque": 10,
      "imagemPrincipal": "http://localhost:8080/uploads/produtos/notebook-dell.jpg",
      "categoria": {
        "id": 1,
        "nome": "Eletrônicos"
      },
      "lojista": {
        "id": 2,
        "nomeFantasia": "Tech Store"
      }
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 1,
  "totalElements": 1
}
```

---

#### POST `/api/v1/produtos`
Cria novo produto (apenas MERCHANT).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
nome: "Notebook Dell"
descricao: "Notebook Dell Inspiron 15"
preco: 3500.00
estoque: 10
categoriaId: 1
imagemPrincipal: [arquivo]
```

**Response (201 Created):**
```json
{
  "id": 1,
  "nome": "Notebook Dell",
  "descricao": "Notebook Dell Inspiron 15",
  "preco": 3500.00,
  "estoque": 10,
  "imagemPrincipal": "http://localhost:8080/uploads/produtos/notebook-dell.jpg",
  "criadoEm": "2025-10-23T14:30:00"
}
```

---

### Usuários

#### GET `/api/v1/usuarios/me`
Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@winmarketplace.com",
  "nome": "Administrador",
  "papel": "ADMIN",
  "ativo": true,
  "criadoEm": "2025-01-01T00:00:00"
}
```

---

#### PUT `/api/v1/usuarios/me`
Atualiza dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "nome": "Novo Nome",
  "telefone": "(11) 98765-4321"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@winmarketplace.com",
  "nome": "Novo Nome",
  "telefone": "(11) 98765-4321",
  "papel": "ADMIN",
  "atualizadoEm": "2025-10-23T14:30:00"
}
```

---

## 🧪 Como Testar a Integração

### 1. **Subir o Sistema**

```bash
# Clonar repositório
git clone https://github.com/ArthurJsph/win-grupo1.git
cd win-grupo1

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Subir containers
docker-compose up -d

# Verificar logs
docker-compose logs -f backend
```

### 2. **Testar Autenticação**

```bash
# Login como Admin
curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@winmarketplace.com",
       "senha": "Admin123!"
     }'

# Guardar o token retornado
TOKEN="seu_token_aqui"
```

### 3. **Testar Endpoints Protegidos**

```bash
# Buscar dados do usuário
curl http://localhost:8080/api/v1/usuarios/me \
     -H "Authorization: Bearer $TOKEN"

# Listar produtos
curl http://localhost:8080/api/v1/produtos \
     -H "Authorization: Bearer $TOKEN"
```

### 4. **Testar Recuperação de Senha**

**Pré-requisito:** SendGrid configurado no `.env`

```bash
# Solicitar recuperação
curl -X POST http://localhost:8080/api/v1/auth/esqueci-senha \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@winmarketplace.com"}'

# Verificar email recebido
# Usar token do email para resetar
curl -X POST http://localhost:8080/api/v1/auth/resetar-senha \
     -H "Content-Type: application/json" \
     -d '{
       "token": "token_recebido_por_email",
       "novaSenha": "NovaSenha123!"
     }'
```

### 5. **Testar Dev Tools**

```bash
# Gerar hash de senha
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
     -H "Content-Type: application/json" \
     -d '{"senha": "TesteSenha123!"}'

# Verificar senha
curl -X POST http://localhost:8080/api/v1/dev/verify-password \
     -H "Content-Type: application/json" \
     -d '{
       "senha": "TesteSenha123!",
       "hash": "$2a$10$..."
     }'
```

---

## 📚 Documentação Adicional

### Guias de Configuração

- 📘 [Criar Primeiro Admin](../docs/getting-started/first-admin.md)
- 📘 [Configurar Email SendGrid](../docs/configuration/email-sendgrid.md)
- 📘 [Executar com Docker](../docs/deployment/docker.md)
- 📘 [Desenvolvimento Local](../docs/deployment/local-development.md)

### Referências Técnicas

- 📖 [Estrutura do Projeto](../docs/architecture/project-structure.md)
- 📖 [Especificações](../docs/architecture/specifications.md)
- 📖 [Segurança](../docs/SECURITY.md)
- 📖 [Otimizações](../docs/OPTIMIZATION.md)

### Exemplos Práticos

- 💡 [10 Exemplos de Hash](../docs/admin/hash-examples.md)
- 💡 [Comandos Docker](../docs/deployment/docker-commands.md)
- 💡 [Quick Reference](../docs/getting-started/quick-reference.md)

---

## 🐛 Troubleshooting

### Erro: "DevTools endpoint não encontrado"

**Causa:** `DEV_TOOLS_ENABLED` não está configurado

**Solução:**
```bash
# Adicionar no .env
DEV_TOOLS_ENABLED=true

# Restartar backend
docker-compose restart backend
```

---

### Erro: "Email não enviado"

**Causa:** SendGrid não configurado ou API Key inválida

**Solução:**
1. Verificar `.env`:
   ```properties
   SENDGRID_API_KEY=SG.xxxxx
   MAIL_FROM=noreply@seudominio.com
   ```
2. Verificar logs:
   ```bash
   docker logs win-marketplace-backend --tail 50
   ```
3. Consultar: [docs/configuration/email-sendgrid.md](../docs/configuration/email-sendgrid.md)

---

### Erro: "401 Unauthorized"

**Causa:** Token expirado ou inválido

**Solução:**
1. Fazer login novamente para obter novo token
2. Verificar se token está no formato `Bearer {token}` no header
3. Verificar validade do token (padrão: 24h)

---

## 🔐 Segurança em Produção

### ⚠️ Antes de Deploy

- [ ] Alterar **TODAS** as senhas padrão
- [ ] Definir `DEV_TOOLS_ENABLED=false`
- [ ] Configurar `SPRING_PROFILES_ACTIVE=prod`
- [ ] Usar banco de dados dedicado (não localhost)
- [ ] Configurar HTTPS/SSL
- [ ] Definir `JWT_SECRET` forte (32+ caracteres)
- [ ] Revisar [docs/SECURITY.md](../docs/SECURITY.md)

### 🔒 Credenciais Produção

```properties
# NÃO usar valores padrão!
POSTGRES_PASSWORD=[gerar senha forte]
SENDGRID_API_KEY=[sua API key real]
JWT_SECRET=[gerar secret forte: openssl rand -base64 32]
FRONTEND_URL=[seu domínio real]
```

---

## 📞 Suporte

- 📧 **Email:** suporte@winmarketplace.com
- 🐛 **Issues:** https://github.com/ArthurJsph/win-grupo1/issues
- 📚 **Documentação:** [docs/README.md](../docs/README.md)

---

**✅ Sistema pronto para integração e testes!**

**Versão:** 1.0.0  
**Última revisão:** 23 de outubro de 2025
