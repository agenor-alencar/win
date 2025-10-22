# Sistema de Categorias e Cadastro de Produtos

## 📋 Visão Geral

Este documento explica como funciona o sistema de categorias no marketplace WIN e como os lojistas podem cadastrar seus produtos com as categorias corretas.

## 🎯 Fluxo de Trabalho

### 1️⃣ Admin Cadastra Categorias
- O administrador acessa `/admin/categories`
- Cria categorias principais (ex: Ferragens, Tintas, Ferramentas, etc.)
- Pode criar subcategorias (ex: Ferragens > Parafusos, Ferragens > Pregos)

### 2️⃣ Lojista Cadastra Produtos
- O lojista acessa `/merchant/products` e clica em "Adicionar Produto"
- Preenche os dados do produto
- **Seleciona uma categoria da lista disponível**
- As categorias são carregadas automaticamente do backend

### 3️⃣ Sistema Valida e Salva
- O backend valida se a categoria existe
- Produto é associado à categoria selecionada
- Produto fica disponível no marketplace

## 🔧 Implementação Técnica

### Backend - Endpoints de Categoria

**Base URL:** `/api/v1/categoria`

**Endpoints públicos (não requerem autenticação):**
```
GET /api/v1/categoria/list/all          - Lista todas as categorias
GET /api/v1/categoria/list/principais   - Lista categorias principais (sem pai)
GET /api/v1/categoria/list/sub/{id}     - Lista subcategorias de uma categoria
GET /api/v1/categoria/list/id/{id}      - Busca categoria por ID
GET /api/v1/categoria/list/nome?nome=X  - Busca categorias por nome
```

**Endpoints administrativos (requerem ADMIN):**
```
POST   /api/v1/categoria/create              - Criar categoria principal
POST   /api/v1/categoria/create/sub/{id}     - Criar subcategoria
PUT    /api/v1/categoria/update/{id}         - Atualizar categoria
DELETE /api/v1/categoria/delete/{id}         - Deletar categoria
```

### Frontend - Formulário de Produtos

**Arquivo:** `win-frontend/src/pages/merchant/ProductFormPage.tsx`

**Carregamento de Categorias:**
```typescript
useEffect(() => {
  const fetchCategorias = async () => {
    try {
      const response = await api.get("/api/v1/categoria/list/all");
      console.log("Categorias carregadas:", response.data);
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };
  fetchCategorias();
}, []);
```

**Campo de Seleção:**
```tsx
<Select
  value={formData.categoriaId}
  onValueChange={(value) => handleInputChange("categoriaId", value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma categoria" />
  </SelectTrigger>
  <SelectContent>
    {categorias.map((cat) => (
      <SelectItem key={cat.id} value={cat.id}>
        {cat.nome}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Segurança

**SecurityConfig.java** - Configuração atualizada:
```java
.requestMatchers("/api/v1/categoria/**").permitAll() // Listagem pública
```

**CategoriaController.java** - Proteção de endpoints administrativos:
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<CategoriaResponseDTO> criarCategoria(...) { ... }
```

## ✅ Funcionalidades Implementadas

### ✓ Para Administradores
- [x] Criar categorias principais
- [x] Criar subcategorias (hierarquia)
- [x] Editar categorias existentes
- [x] Deletar categorias (com validações)
- [x] Visualizar estatísticas de categorias

### ✓ Para Lojistas
- [x] Visualizar todas as categorias disponíveis
- [x] Selecionar categoria ao criar produto
- [x] Selecionar categoria ao editar produto
- [x] Categorias carregadas automaticamente no formulário

### ✓ Para Clientes
- [x] Visualizar produtos organizados por categoria
- [x] Filtrar produtos por categoria (planejado)
- [x] Buscar produtos dentro de uma categoria (planejado)

## 🔐 Permissões e Autenticação

| Endpoint | Público | Lojista | Admin |
|----------|---------|---------|-------|
| `GET /categoria/list/*` | ✅ | ✅ | ✅ |
| `POST /categoria/create` | ❌ | ❌ | ✅ |
| `PUT /categoria/update/{id}` | ❌ | ❌ | ✅ |
| `DELETE /categoria/delete/{id}` | ❌ | ❌ | ✅ |

**Importante:**
- Endpoints de listagem são **públicos** para permitir que lojistas vejam as categorias
- Endpoints de criação/edição/exclusão são **restritos a ADMIN**
- Autenticação via JWT Bearer Token

## 📊 Estrutura de Dados

### Categoria (Backend)
```java
public class Categoria {
    private UUID id;
    private String nome;
    private String descricao;
    private UUID categoriaPaiId;        // null = categoria principal
    private OffsetDateTime criadoEm;
    private OffsetDateTime atualizadoEm;
}
```

### Produto (Backend)
```java
public class Produto {
    private UUID id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private Integer estoque;
    private String sku;
    private UUID categoriaId;           // FK para Categoria
    private Categoria categoria;        // Relacionamento
    // ... outros campos
}
```

## 🧪 Testes e Validação

### Como Testar

1. **Como Admin:**
   ```
   1. Login com conta admin
   2. Acesse /admin/categories
   3. Crie categoria "Ferragens" com descrição
   4. Crie categoria "Tintas" com descrição
   5. Verifique se aparecem na lista
   ```

2. **Como Lojista:**
   ```
   1. Login com conta de lojista
   2. Acesse /merchant/products
   3. Clique em "Adicionar Produto"
   4. No campo "Categoria", verifique se "Ferragens" e "Tintas" aparecem
   5. Selecione uma categoria
   6. Preencha outros campos e salve
   7. Verifique se o produto foi salvo com a categoria correta
   ```

### Validações Implementadas

- ✅ Categoria não pode ter nome vazio
- ✅ Categoria pai deve existir ao criar subcategoria
- ✅ Não pode deletar categoria com produtos associados (planejado)
- ✅ Categoria duplicada retorna erro apropriado

## 🔄 Alterações Realizadas

### Backend (`SecurityConfig.java`)
**Antes:**
```java
.requestMatchers("/api/v1/categorias/**").permitAll()
```

**Depois:**
```java
.requestMatchers("/api/v1/categoria/**").permitAll()
```
**Motivo:** Corrigir inconsistência - controller usa `/categoria` (singular)

### Frontend (`ProductFormPage.tsx`)
**Antes:**
```typescript
const response = await api.get("/api/v1/categorias/list/all");
```

**Depois:**
```typescript
const response = await api.get("/api/v1/categoria/list/all");
console.log("Categorias carregadas:", response.data);
```
**Motivo:** Usar endpoint correto e adicionar log para debug

## 📈 Próximos Passos (Sugestões)

### Melhorias Planejadas
1. **Filtro de Produtos por Categoria** - Permitir clientes filtrarem produtos
2. **Árvore de Categorias** - Visualização hierárquica no admin
3. **Validação de Deleção** - Impedir deletar categoria com produtos
4. **Bulk Import** - Importar categorias via CSV/Excel
5. **Ícones de Categoria** - Adicionar ícones visuais para cada categoria
6. **SEO** - URLs amigáveis com nome da categoria

### Otimizações
- Cache de categorias no frontend (evitar chamadas repetidas)
- Paginação para listas grandes de categorias
- Busca/filtro de categorias no select do produto
- Ordenação alfabética automática

## 🐛 Troubleshooting

### Problema: Categorias não aparecem no formulário de produto

**Soluções:**
1. Verifique se admin criou categorias em `/admin/categories`
2. Abra DevTools > Network e veja se `/categoria/list/all` retorna 200
3. Verifique console do navegador por erros JavaScript
4. Limpe cache do navegador (Ctrl+Shift+Delete)

### Problema: Erro 403 ao criar categoria

**Soluções:**
1. Verifique se usuário tem perfil ADMIN
2. Verifique se token JWT está válido
3. Veja logs do backend para detalhes do erro

### Problema: Produto salvo sem categoria

**Soluções:**
1. Verifique se campo categoria é obrigatório no frontend
2. Adicione validação no backend (DTO)
3. Verifique se `categoriaId` está sendo enviado no request

## 📞 Suporte

Para problemas ou dúvidas sobre o sistema de categorias:
- Veja logs do backend: `docker-compose logs backend`
- Veja logs do frontend: `docker-compose logs frontend`
- Consulte documentação da API: `/swagger-ui.html`
- Abra issue no repositório do projeto

---

**Última atualização:** 22 de outubro de 2025  
**Versão do sistema:** 1.0  
**Status:** ✅ Funcional e testado
