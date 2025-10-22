# 📁 Gerenciamento de Categorias - Sistema WIN Marketplace

## 🎯 Visão Geral

O sistema agora possui um módulo completo de gerenciamento de categorias para administradores, permitindo organizar produtos de forma hierárquica com categorias principais e subcategorias.

---

## 🔐 Permissões e Segurança

### **Endpoints Backend** (`/api/v1/categoria`)

| Endpoint | Método | Permissão | Descrição |
|----------|--------|-----------|-----------|
| `/list/all` | GET | 🌍 Público | Listar todas as categorias |
| `/list/principais` | GET | 🌍 Público | Listar categorias principais |
| `/list/sub/{id}` | GET | 🌍 Público | Listar subcategorias |
| `/list/id/{id}` | GET | 🌍 Público | Buscar por ID |
| `/list/nome?nome=` | GET | 🌍 Público | Buscar por nome |
| `/create` | POST | 🔐 ADMIN | Criar categoria |
| `/create/sub/{id}` | POST | 🔐 ADMIN | Criar subcategoria |
| `/update/{id}` | PUT | 🔐 ADMIN | Atualizar categoria |
| `/delete/{id}` | DELETE | 🔐 ADMIN | Deletar categoria |

**Segurança Implementada**:
- ✅ Endpoints administrativos protegidos com `@PreAuthorize("hasAuthority('ADMIN')")`
- ✅ Token JWT verificado em cada requisição
- ✅ Endpoints públicos liberados no SecurityConfig

---

## 🏗️ Estrutura de Dados

### **Tabela no Banco** (`categorias`)

```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria_pai_id UUID REFERENCES categorias(id),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### **Modelo de Dados**

```typescript
interface Category {
  id: string;                  // UUID
  nome: string;                // Nome da categoria
  descricao: string;           // Descrição (opcional)
  categoriaPaiId?: string;     // ID da categoria pai (null = principal)
  criadoEm: string;            // Data de criação (ISO 8601)
  atualizadoEm: string;        // Data de atualização (ISO 8601)
  subcategorias?: Category[];  // Subcategorias (aninhadas)
}
```

---

## 💻 Funcionalidades do Frontend

### **Página Admin** (`/admin/categories`)

<table>
<tr>
<td>

**Recursos Principais:**
- 📊 Dashboard com estatísticas
- 📋 Lista de categorias hierárquica
- ➕ Criar nova categoria
- ✏️ Editar categoria existente
- 🗑️ Excluir categoria
- 🔄 Atualizar lista
- 🌳 Visualização em árvore (principais + subcategorias)

</td>
<td>

**Estatísticas Exibidas:**
- Total de categorias
- Categorias principais
- Subcategorias
- Data de criação

</td>
</tr>
</table>

### **Modal de Criação/Edição**

```tsx
Campos do Formulário:
- Nome da Categoria * (obrigatório)
- Descrição (opcional)

Validações:
✓ Nome não pode ser vazio
✓ Feedback visual de sucesso/erro
✓ Loading state durante submit
```

---

## 🚀 Como Usar (Administrador)

### **1. Acessar Painel de Categorias**

```
1. Fazer login como ADMIN
2. No menu lateral, clicar em "Categorias"
3. Você verá o painel de gerenciamento
```

### **2. Criar Categoria Principal**

```
1. Clicar no botão "Nova Categoria"
2. Preencher:
   - Nome: Ex: "Eletrônicos"
   - Descrição: Ex: "Smartphones, tablets, notebooks e acessórios"
3. Clicar em "Criar"
4. ✅ Categoria criada com sucesso!
```

### **3. Criar Subcategoria**

**Método 1: Via API**
```bash
POST /api/v1/categoria/create/sub/{categoria-pai-id}
Authorization: Bearer {seu-token}

{
  "nome": "Smartphones",
  "descricao": "Celulares e acessórios"
}
```

**Método 2: Futuro - Adicionar botão na UI**

### **4. Editar Categoria**

```
1. Clicar no ícone de lápis (✏️) ao lado da categoria
2. Atualizar os campos desejados
3. Clicar em "Atualizar"
4. ✅ Categoria atualizada!
```

### **5. Excluir Categoria**

```
1. Clicar no ícone de lixeira (🗑️)
2. Confirmar a exclusão
3. ✅ Categoria excluída!

⚠️ ATENÇÃO: Deletar uma categoria PAI deleta todas as subcategorias!
```

---

## 📡 Exemplos de API

### **Criar Categoria (ADMIN)**

```bash
POST http://localhost:8080/api/v1/categoria/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nome": "Eletrônicos",
  "descricao": "Produtos eletrônicos e tecnologia"
}
```

**Resposta (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "Eletrônicos",
  "descricao": "Produtos eletrônicos e tecnologia",
  "categoriaPaiId": null,
  "criadoEm": "2025-10-21T23:00:00Z",
  "atualizadoEm": "2025-10-21T23:00:00Z"
}
```

### **Listar Todas as Categorias (Público)**

```bash
GET http://localhost:8080/api/v1/categoria/list/all
```

**Resposta (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "Eletrônicos",
    "descricao": "Produtos eletrônicos e tecnologia",
    "categoriaPaiId": null,
    "criadoEm": "2025-10-21T23:00:00Z",
    "atualizadoEm": "2025-10-21T23:00:00Z"
  },
  {
    "id": "660f9511-f39c-52e5-b827-557766551111",
    "nome": "Smartphones",
    "descricao": "Celulares e acessórios",
    "categoriaPaiId": "550e8400-e29b-41d4-a716-446655440000",
    "criadoEm": "2025-10-21T23:05:00Z",
    "atualizadoEm": "2025-10-21T23:05:00Z"
  }
]
```

### **Buscar por Nome (Público)**

```bash
GET http://localhost:8080/api/v1/categoria/list/nome?nome=eletr
```

### **Atualizar Categoria (ADMIN)**

```bash
PUT http://localhost:8080/api/v1/categoria/update/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nome": "Eletrônicos e Tecnologia",
  "descricao": "Smartphones, tablets, notebooks, acessórios e mais"
}
```

### **Deletar Categoria (ADMIN)**

```bash
DELETE http://localhost:8080/api/v1/categoria/delete/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (204 No Content)**

---

## 🎨 Interface do Usuário

### **Dashboard de Categorias**

```
┌─────────────────────────────────────────────────────────┐
│  📁 Categorias                       🔄 Atualizar  ➕ Nova│
│  Gerencie as categorias de produtos do marketplace      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Total: 15    📂 Principais: 8    📁 Subcategorias: 7│
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Categoria            │ Descrição    │ Tipo  │ Ações    │
├─────────────────────────────────────────────────────────┤
│  📁 Eletrônicos       │ Produtos...  │ Princ │ ✏️ 🗑️    │
│    📂 Smartphones     │ Celulares... │ Sub   │ ✏️ 🗑️    │
│    📂 Notebooks       │ Laptops...   │ Sub   │ ✏️ 🗑️    │
│  📁 Moda & Vestuário  │ Roupas...    │ Princ │ ✏️ 🗑️    │
│    📂 Masculino       │ Roupas...    │ Sub   │ ✏️ 🗑️    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Integração com Produtos

### **Relacionamento**

```sql
produtos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255),
  categoria_id UUID REFERENCES categorias(id),  ← FK para categorias
  ...
)
```

**Ao criar um produto**, o lojista/admin seleciona uma categoria da lista.

---

## 📋 Casos de Uso Comuns

### **Organização Sugerida**

```
Eletrônicos
  ├── Smartphones
  ├── Notebooks
  ├── Tablets
  └── Acessórios

Moda & Vestuário
  ├── Masculino
  ├── Feminino
  └── Infantil

Casa & Decoração
  ├── Móveis
  ├── Decoração
  └── Cozinha

Esportes
  ├── Futebol
  ├── Academia
  └── Aventura
```

### **Exemplo: Criar Categoria Completa**

```bash
# 1. Criar categoria principal
POST /api/v1/categoria/create
{
  "nome": "Eletrônicos",
  "descricao": "Produtos eletrônicos e tecnologia"
}
# Retorna: { "id": "abc-123" }

# 2. Criar subcategoria
POST /api/v1/categoria/create/sub/abc-123
{
  "nome": "Smartphones",
  "descricao": "Celulares e acessórios"
}

# 3. Criar outra subcategoria
POST /api/v1/categoria/create/sub/abc-123
{
  "nome": "Notebooks",
  "descricao": "Laptops e ultrabooks"
}
```

---

## ⚠️ Observações Importantes

### **Limitações Atuais**
- ❌ Não há validação de categorias duplicadas (mesmo nome)
- ❌ Não há limite de profundidade de subcategorias
- ❌ Deletar categoria PAI deleta todas as subcategorias automaticamente
- ❌ Não há soft-delete (exclusão lógica)

### **Melhorias Futuras**
- 🔜 Adicionar campo `icone` para representação visual
- 🔜 Adicionar campo `ordem` para ordenação personalizada
- 🔜 Adicionar contador de produtos por categoria
- 🔜 Implementar drag-and-drop para reordenar
- 🔜 Adicionar filtro/busca na lista
- 🔜 Implementar soft-delete (campo `ativo`)
- 🔜 Adicionar validação de nome único

---

## ✅ Checklist de Implementação

**Backend:**
- ✅ Controller com endpoints CRUD
- ✅ Proteção com `@PreAuthorize("hasAuthority('ADMIN')")`
- ✅ Service com lógica de negócio
- ✅ Validações básicas
- ✅ Endpoints públicos para listagem

**Frontend:**
- ✅ Página AdminCategories
- ✅ Service API (CategoryApi.ts)
- ✅ Integração com backend
- ✅ Modal de criação/edição
- ✅ Visualização hierárquica
- ✅ Feedback visual (toasts)
- ✅ Loading states

**Segurança:**
- ✅ JWT obrigatório para operações ADMIN
- ✅ Endpoints públicos apenas para leitura
- ✅ CORS configurado

---

## 🎯 Conclusão

O módulo de gerenciamento de categorias está **100% funcional** e pronto para uso! Os administradores podem agora:

✅ Criar e organizar categorias de produtos  
✅ Editar categorias existentes  
✅ Excluir categorias não utilizadas  
✅ Visualizar hierarquia completa  
✅ Usuários podem navegar por categorias na loja  

**Sistema seguro, eficiente e sem comprometer funcionalidades existentes!** 🎉
