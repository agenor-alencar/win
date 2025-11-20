# 🔧 Correções e Melhorias para MerchantProducts.tsx

## ✅ Funções que já estão funcionando:
- `fetchProducts()` - ✅ Busca produtos do lojista
- `fetchCategories()` - ✅ Busca categorias
- `handleToggleStatus()` - ✅ Ativar/Desativar produto
- `handleDeleteProduct()` - ✅ Deletar produto

## ⚠️ Funções que precisam ser corrigidas/implementadas:

### 1. handleAddProduct (Criar Produto)

**Localização:** Linha ~227
**Status:** ⚠️ Apenas mostra sucesso, não chama API

**Substituir por:**

```typescript
const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!lojista) {
    notifyError("Erro", "Lojista não identificado");
    return;
  }

  try {
    const productData = {
      nome: newProduct.name,
      descricao: newProduct.description,
      preco: parseFloat(newProduct.price),
      quantidadeEstoque: parseInt(newProduct.stock),
      categoriaId: newProduct.category,
      lojistaId: lojista.id,
      ativo: true,
      sku: newProduct.sku || undefined,
    };

    await api.post("/api/v1/produtos", productData);
    
    success("Produto adicionado!", "Produto criado com sucesso");
    setShowAddProduct(false);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      sku: "",
      image: null,
    });
    
    await fetchProducts(); // Recarregar lista
  } catch (err: any) {
    console.error("Erro ao criar produto:", err);
    notifyError(
      "Erro ao criar produto",
      err.response?.data?.message || "Não foi possível criar o produto"
    );
  }
};
```

### 2. handleEditProduct (Atualizar Produto)

**Status:** ❌ NÃO EXISTE - Precisa ser criado

**Adicionar após handleAddProduct:**

```typescript
const handleEditProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!editingProduct) return;

  try {
    const productData = {
      nome: editingProduct.nome,
      descricao: editingProduct.descricao,
      preco: editingProduct.preco,
      quantidadeEstoque: editingProduct.estoque,
      categoriaId: editingProduct.categoria.id,
      lojistaId: editingProduct.lojista.id,
      ativo: editingProduct.ativo,
    };

    await api.put(`/api/v1/produtos/${editingProduct.id}`, productData);
    
    success("Produto atualizado!", "Alterações salvas com sucesso");
    setEditingProduct(null);
    await fetchProducts(); // Recarregar lista
  } catch (err: any) {
    console.error("Erro ao atualizar produto:", err);
    notifyError(
      "Erro ao atualizar",
      err.response?.data?.message || "Não foi possível atualizar o produto"
    );
  }
};
```

### 3. handleUpdateStock (Atualizar Estoque)

**Status:** ❌ NÃO EXISTE - Precisa ser criado

**Adicionar:**

```typescript
const handleUpdateStock = async (productId: string, newQuantity: number) => {
  try {
    await api.patch(`/api/v1/produtos/${productId}/estoque`, {
      quantidadeEstoque: newQuantity,
    });
    
    success("Estoque atualizado!", "Quantidade alterada com sucesso");
    await fetchProducts();
  } catch (err: any) {
    console.error("Erro ao atualizar estoque:", err);
    notifyError(
      "Erro ao atualizar estoque",
      err.response?.data?.message || "Não foi possível atualizar o estoque"
    );
  }
};
```

### 4. Funções antigas que podem ser removidas:

```typescript
// REMOVER - Duplicado/Não usado
const toggleProductStatus = (productId: number) => {
  success("Status atualizado!", "Produto foi ativado/desativado");
};

// REMOVER - Duplicado/Não usado
const deleteProduct = (productId: number) => {
  success("Produto removido!", "Produto foi excluído da loja");
};
```

## 📝 Campos do Backend vs Frontend

### Backend (API) espera:
```typescript
{
  nome: string;              // ✅ OK
  descricao: string;         // ✅ OK
  preco: number;             // ✅ OK (converter string para number)
  quantidadeEstoque: number; // ⚠️ Frontend usa "stock"
  categoriaId: UUID;         // ⚠️ Frontend usa "category"
  lojistaId: UUID;           // ✅ OK
  ativo: boolean;            // ✅ OK
  sku?: string;              // ✅ OK (opcional)
}
```

### Ajustes necessários no estado `newProduct`:
```typescript
const [newProduct, setNewProduct] = useState({
  name: "",           // API: nome
  description: "",    // API: descricao
  price: "",          // API: preco (converter para number)
  stock: "",          // API: quantidadeEstoque (converter para number)
  category: "",       // API: categoriaId
  sku: "",            // API: sku
  image: null,        // TODO: Implementar upload de imagem
});
```

## 🎯 Próximas Melhorias (Opcionais):

1. **Upload de Imagens**
   - Endpoint: `POST /api/v1/imagens-produto/{produtoId}`
   - Implementar upload com FormData

2. **Validações**
   - Preço mínimo: R$ 0,01
   - Estoque mínimo: 0
   - Nome obrigatório (mín. 3 caracteres)
   - Descrição obrigatória

3. **Feedback Visual**
   - Loading states nos botões
   - Skeleton loaders
   - Animações de transição

## ✅ Checklist de Integração:

- [x] Buscar produtos do lojista
- [x] Buscar categorias
- [x] Ativar/Desativar produto
- [x] Deletar produto
- [ ] Criar produto (função existe mas não chama API)
- [ ] Editar produto (função não existe)
- [ ] Atualizar estoque (função não existe)
- [ ] Upload de imagens (não implementado)

## 🚀 Para aplicar as correções:

1. Substituir a função `handleAddProduct` pela versão acima
2. Adicionar as funções `handleEditProduct` e `handleUpdateStock`
3. Remover as funções `toggleProductStatus` e `deleteProduct` (duplicadas)
4. Testar criação/edição de produtos

---

**Nota:** As correções acima garantem que o frontend se comunique corretamente com o backend sem quebrar funcionalidades existentes.
