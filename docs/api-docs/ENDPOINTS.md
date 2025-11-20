# 📋 Referência Completa de Endpoints - WIN Marketplace API

> **Documentação detalhada de todos os endpoints disponíveis**

**Base URL:** `http://localhost:8080`  
**Versão:** v1  
**Autenticação:** JWT Bearer Token

---

## 📑 Índice

- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Produtos](#produtos)
- [Categorias](#categorias)
- [Pedidos](#pedidos)
- [Dev Tools](#dev-tools)

---

## 🔐 Autenticação

### POST `/api/v1/auth/login`

Autentica usuário e retorna token JWT.

**Acesso:** Público

**Request Body:**
```json
{
  "email": "string (required)",
  "senha": "string (required, min: 6)"
}
```

**Response 200 OK:**
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
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Credenciais incorretas

---

### POST `/api/v1/auth/registro`

Registra novo usuário no sistema.

**Acesso:** Público

**Request Body:**
```json
{
  "email": "string (required, email válido)",
  "senha": "string (required, min: 8, deve conter maiúscula, minúscula e número)",
  "nome": "string (required, min: 3)",
  "cpf": "string (required, formato: 000.000.000-00)",
  "telefone": "string (optional)",
  "papel": "string (required: CUSTOMER, MERCHANT)"
}
```

**Response 201 Created:**
```json
{
  "id": 1,
  "email": "novo@usuario.com",
  "nome": "Novo Usuário",
  "papel": "CUSTOMER",
  "ativo": true,
  "criadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `400 Bad Request` - Dados inválidos
- `409 Conflict` - Email já cadastrado

---

### POST `/api/v1/auth/esqueci-senha`

Envia email com link de recuperação de senha.

**Acesso:** Público  
**Requer:** SendGrid configurado

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "mensagem": "Email de recuperação enviado com sucesso"
}
```

**Erros:**
- `404 Not Found` - Email não cadastrado
- `500 Internal Server Error` - Erro ao enviar email

---

### POST `/api/v1/auth/resetar-senha`

Reseta senha usando token recebido por email.

**Acesso:** Público

**Request Body:**
```json
{
  "token": "string (required)",
  "novaSenha": "string (required, min: 8)"
}
```

**Response 200 OK:**
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

**Erros:**
- `400 Bad Request` - Token inválido ou expirado
- `404 Not Found` - Token não encontrado

---

## 👤 Usuários

### GET `/api/v1/usuarios/me`

Retorna dados do usuário autenticado.

**Acesso:** Autenticado  
**Headers:** `Authorization: Bearer {token}`

**Response 200 OK:**
```json
{
  "id": 1,
  "email": "admin@winmarketplace.com",
  "nome": "Administrador",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "papel": "ADMIN",
  "ativo": true,
  "criadoEm": "2025-01-01T00:00:00",
  "atualizadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `401 Unauthorized` - Token inválido ou expirado

---

### PUT `/api/v1/usuarios/me`

Atualiza dados do usuário autenticado.

**Acesso:** Autenticado  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "nome": "string (optional)",
  "telefone": "string (optional)",
  "cpf": "string (optional, não pode ser alterado se já definido)"
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "email": "admin@winmarketplace.com",
  "nome": "Nome Atualizado",
  "telefone": "(11) 98765-4321",
  "atualizadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido

---

### PUT `/api/v1/usuarios/me/senha`

Altera senha do usuário autenticado.

**Acesso:** Autenticado  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "senhaAtual": "string (required)",
  "novaSenha": "string (required, min: 8)"
}
```

**Response 200 OK:**
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

**Erros:**
- `400 Bad Request` - Senha atual incorreta
- `401 Unauthorized` - Token inválido

---

### GET `/api/v1/usuarios` (Admin)

Lista todos os usuários (apenas Admin).

**Acesso:** ADMIN  
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int, default: 0) - Número da página
- `size` (int, default: 20) - Itens por página
- `papel` (string, optional) - Filtrar por papel (ADMIN, MERCHANT, CUSTOMER)
- `ativo` (boolean, optional) - Filtrar por status

**Response 200 OK:**
```json
{
  "content": [
    {
      "id": 1,
      "email": "admin@winmarketplace.com",
      "nome": "Administrador",
      "papel": "ADMIN",
      "ativo": true,
      "criadoEm": "2025-01-01T00:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 5,
  "totalElements": 95
}
```

**Erros:**
- `403 Forbidden` - Usuário não é Admin

---

## 📦 Produtos

### GET `/api/v1/produtos`

Lista produtos ativos com paginação.

**Acesso:** Público

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 20)
- `categoriaId` (long, optional) - Filtrar por categoria
- `lojistaId` (long, optional) - Filtrar por lojista
- `nome` (string, optional) - Buscar por nome
- `precoMin` (decimal, optional) - Preço mínimo
- `precoMax` (decimal, optional) - Preço máximo

**Response 200 OK:**
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Notebook Dell Inspiron 15",
      "descricao": "Notebook com Intel Core i5, 8GB RAM, 256GB SSD",
      "preco": 3500.00,
      "estoque": 10,
      "imagemPrincipal": "http://localhost:8080/uploads/produtos/notebook-dell.jpg",
      "imagens": [
        "http://localhost:8080/uploads/produtos/notebook-dell-1.jpg",
        "http://localhost:8080/uploads/produtos/notebook-dell-2.jpg"
      ],
      "categoria": {
        "id": 1,
        "nome": "Eletrônicos",
        "slug": "eletronicos"
      },
      "lojista": {
        "id": 2,
        "nomeFantasia": "Tech Store",
        "email": "lojista@techstore.com"
      },
      "ativo": true,
      "criadoEm": "2025-10-20T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 3,
  "totalElements": 52
}
```

---

### GET `/api/v1/produtos/{id}`

Busca produto por ID.

**Acesso:** Público

**Path Parameters:**
- `id` (long, required) - ID do produto

**Response 200 OK:**
```json
{
  "id": 1,
  "nome": "Notebook Dell Inspiron 15",
  "descricao": "Notebook com Intel Core i5, 8GB RAM, 256GB SSD",
  "preco": 3500.00,
  "estoque": 10,
  "imagemPrincipal": "http://localhost:8080/uploads/produtos/notebook-dell.jpg",
  "imagens": [...],
  "categoria": {...},
  "lojista": {...},
  "ativo": true,
  "avaliacaoMedia": 4.5,
  "totalAvaliacoes": 23
}
```

**Erros:**
- `404 Not Found` - Produto não encontrado

---

### POST `/api/v1/produtos`

Cria novo produto (apenas Lojista).

**Acesso:** MERCHANT  
**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
```
nome: string (required, min: 3)
descricao: string (required, min: 10)
preco: decimal (required, > 0)
estoque: int (required, >= 0)
categoriaId: long (required)
imagemPrincipal: file (required, jpg/png, max: 5MB)
imagens: file[] (optional, max: 5 arquivos)
```

**Response 201 Created:**
```json
{
  "id": 1,
  "nome": "Notebook Dell Inspiron 15",
  "preco": 3500.00,
  "imagemPrincipal": "http://localhost:8080/uploads/produtos/notebook-dell.jpg",
  "criadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `400 Bad Request` - Dados inválidos ou arquivo muito grande
- `403 Forbidden` - Usuário não é Lojista
- `404 Not Found` - Categoria não encontrada

---

### PUT `/api/v1/produtos/{id}`

Atualiza produto existente (apenas dono ou Admin).

**Acesso:** MERCHANT (dono) ou ADMIN  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "nome": "string (optional)",
  "descricao": "string (optional)",
  "preco": "decimal (optional)",
  "estoque": "int (optional)",
  "categoriaId": "long (optional)",
  "ativo": "boolean (optional, apenas Admin)"
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "nome": "Notebook Dell Inspiron 15 Atualizado",
  "preco": 3299.00,
  "atualizadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `403 Forbidden` - Usuário não é dono do produto
- `404 Not Found` - Produto não encontrado

---

### DELETE `/api/v1/produtos/{id}`

Remove produto (soft delete).

**Acesso:** MERCHANT (dono) ou ADMIN  
**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (long, required)

**Response 204 No Content**

**Erros:**
- `403 Forbidden` - Usuário não é dono do produto
- `404 Not Found` - Produto não encontrado

---

## 🏷️ Categorias

### GET `/api/v1/categorias`

Lista todas as categorias ativas.

**Acesso:** Público

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "nome": "Eletrônicos",
    "slug": "eletronicos",
    "descricao": "Produtos eletrônicos e tecnologia",
    "icone": "laptop",
    "totalProdutos": 152
  },
  {
    "id": 2,
    "nome": "Moda",
    "slug": "moda",
    "descricao": "Roupas, calçados e acessórios",
    "icone": "shirt",
    "totalProdutos": 89
  }
]
```

---

### POST `/api/v1/categorias` (Admin)

Cria nova categoria (apenas Admin).

**Acesso:** ADMIN  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "nome": "string (required, min: 3)",
  "descricao": "string (optional)",
  "icone": "string (optional)"
}
```

**Response 201 Created:**
```json
{
  "id": 3,
  "nome": "Livros",
  "slug": "livros",
  "descricao": "Livros físicos e digitais",
  "criadoEm": "2025-10-23T14:30:00"
}
```

---

## 🛒 Pedidos

### GET `/api/v1/pedidos/meus`

Lista pedidos do usuário autenticado.

**Acesso:** Autenticado  
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 20)
- `status` (string, optional) - PENDENTE, PAGO, ENVIADO, ENTREGUE, CANCELADO

**Response 200 OK:**
```json
{
  "content": [
    {
      "id": 1,
      "numero": "PED-2025-00001",
      "status": "PAGO",
      "total": 3500.00,
      "itens": [
        {
          "produto": {
            "id": 1,
            "nome": "Notebook Dell",
            "imagemPrincipal": "..."
          },
          "quantidade": 1,
          "precoUnitario": 3500.00,
          "subtotal": 3500.00
        }
      ],
      "criadoEm": "2025-10-23T14:00:00",
      "atualizadoEm": "2025-10-23T14:05:00"
    }
  ],
  "totalElements": 5
}
```

---

### POST `/api/v1/pedidos`

Cria novo pedido.

**Acesso:** CUSTOMER  
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    },
    {
      "produtoId": 5,
      "quantidade": 1
    }
  ],
  "enderecoEntregaId": 1,
  "metodoPagamento": "CARTAO_CREDITO"
}
```

**Response 201 Created:**
```json
{
  "id": 1,
  "numero": "PED-2025-00001",
  "status": "PENDENTE",
  "total": 7000.00,
  "criadoEm": "2025-10-23T14:30:00"
}
```

**Erros:**
- `400 Bad Request` - Produto sem estoque
- `404 Not Found` - Produto não encontrado

---

## 🛠️ Dev Tools

### POST `/api/v1/dev/hash-password`

Gera hash BCrypt de senha.

**Acesso:** Público (apenas se `DEV_TOOLS_ENABLED=true`)

**Request Body:**
```json
{
  "senha": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "senha": "MinhaSenh@123",
  "hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "algoritmo": "BCrypt",
  "strength": 10,
  "sqlExample": "INSERT INTO usuarios ...",
  "timestamp": "2025-10-23T14:30:00"
}
```

**Erros:**
- `404 Not Found` - Dev tools desabilitado

---

### POST `/api/v1/dev/verify-password`

Verifica se senha corresponde ao hash.

**Acesso:** Público (apenas se `DEV_TOOLS_ENABLED=true`)

**Request Body:**
```json
{
  "senha": "string (required)",
  "hash": "string (required)"
}
```

**Response 200 OK:**
```json
{
  "match": true,
  "mensagem": "Senha corresponde ao hash"
}
```

**Response 200 OK (não corresponde):**
```json
{
  "match": false,
  "mensagem": "Senha NÃO corresponde ao hash"
}
```

---

## 📝 Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| `200 OK` | Sucesso | Operação concluída com sucesso |
| `201 Created` | Criado | Recurso criado com sucesso |
| `204 No Content` | Sem conteúdo | Operação concluída, sem retorno |
| `400 Bad Request` | Requisição inválida | Dados inválidos ou faltando |
| `401 Unauthorized` | Não autorizado | Token inválido/expirado ou falta de autenticação |
| `403 Forbidden` | Proibido | Sem permissão para acessar recurso |
| `404 Not Found` | Não encontrado | Recurso não existe |
| `409 Conflict` | Conflito | Recurso já existe (ex: email duplicado) |
| `500 Internal Server Error` | Erro interno | Erro no servidor |

---

## 🔐 Papéis e Permissões

| Papel | Código | Permissões |
|-------|--------|------------|
| **Admin** | `ADMIN` | Acesso total ao sistema |
| **Lojista** | `MERCHANT` | Gerenciar produtos próprios, ver pedidos |
| **Cliente** | `CUSTOMER` | Fazer pedidos, avaliar produtos |

---

## 📚 Documentação Relacionada

- [Guia de Integração](INTEGRATION.md)
- [Collection Postman](POSTMAN.md)
- [README API](README.md)

---

**Última atualização:** 23 de outubro de 2025  
**Versão da API:** 1.0.0
