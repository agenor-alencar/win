# Guia de Integração do Componente ERP no Formulário de Produtos

## Visão Geral

Este guia explica como integrar o componente `ErpProductSearch` no formulário de produtos (`ProductFormPage.tsx`) para permitir que lojistas importem produtos diretamente do ERP.

## 1. Adicionar Estado e Imports

No topo do arquivo `ProductFormPage.tsx`, adicione os imports:

```typescript
import { ErpProductSearch } from '@/components/ErpProductSearch';
import { ErpProduct, erpApi } from '@/lib/api/ErpApi';
import { useState } from 'react';
```

Adicione os estados necessários (logo após os outros estados):

```typescript
const [modoErp, setModoErp] = useState(false); // true = importar do ERP, false = manual
const [erpSku, setErpSku] = useState(''); // SKU vinculado ao ERP
const [hasErpConfig, setHasErpConfig] = useState(false); // Lojista tem ERP configurado?
```

## 2. Verificar se Lojista Tem ERP Configurado

Adicione um useEffect para verificar se há configuração ERP (após o useEffect que busca o lojistaId):

```typescript
// Verificar se lojista tem ERP configurado
useEffect(() => {
  const checkErpConfig = async () => {
    if (!lojistaId) return;
    
    try {
      const config = await erpApi.buscarConfiguracao(lojistaId);
      setHasErpConfig(config !== null && config.ativo);
    } catch (error) {
      console.error('Erro ao verificar config ERP:', error);
      setHasErpConfig(false);
    }
  };

  checkErpConfig();
}, [lojistaId]);
```

## 3. Handler para Importar Dados do ERP

Adicione a função que será chamada quando o usuário importar um produto do ERP:

```typescript
const handleImportFromErp = (erpProduct: ErpProduct) => {
  setFormData({
    ...formData,
    nome: erpProduct.nome,
    descricao: erpProduct.descricao || '',
    preco: erpProduct.preco.toString(),
    estoque: erpProduct.estoque.toString(),
    sku: erpProduct.sku,
  });
  setErpSku(erpProduct.sku);
  
  toast({
    title: 'Dados importados!',
    description: 'Os dados do produto foram importados do ERP.',
  });
};
```

## 4. Modificar handleSubmit para Vincular ao ERP

Modifique o `handleSubmit` para vincular o produto ao ERP após a criação/edição:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... código existente de validação ...

  try {
    setIsSaving(true);
    
    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      estoque: parseInt(formData.estoque),
      sku: formData.sku,
      categoriaId: formData.categoriaId || null,
      lojistaId: lojistaId,
      ativo: true,
    };

    let produtoId: string;

    if (isEditing) {
      await api.put(`/v1/produtos/${id}`, payload);
      produtoId = id!;
      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      const response = await api.post("/v1/produtos", payload);
      produtoId = response.data.id;
      toast({
        title: "Produto criado!",
        description: "Seu produto foi adicionado ao catálogo.",
      });
    }

    // Se está em modo ERP e tem um SKU ERP, vincular o produto
    if (modoErp && erpSku && !isEditing) {
      try {
        await erpApi.vincularProduto(lojistaId!, {
          produtoId: produtoId,
          erpSku: erpSku,
          importarDados: false, // Já importamos manualmente
        });
        
        toast({
          title: "Produto vinculado ao ERP!",
          description: "O estoque será sincronizado automaticamente.",
        });
      } catch (erpError) {
        console.error('Erro ao vincular produto ao ERP:', erpError);
        // Não falhar a operação se a vinculação falhar
      }
    }

    navigate("/merchant/products");
  } catch (error: any) {
    // ... tratamento de erro existente ...
  } finally {
    setIsSaving(false);
  }
};
```

## 5. Adicionar UI no Formulário

No JSX do formulário, logo após o header "Informações do Produto", adicione:

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Toggle Modo ERP (apenas se lojista tem ERP configurado e não está editando) */}
  {hasErpConfig && !isEditing && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-blue-900">
            Origem do Produto
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Escolha se deseja criar manualmente ou importar do ERP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModoErp(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !modoErp
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-900 border border-blue-300'
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setModoErp(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              modoErp
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-900 border border-blue-300'
            }`}
          >
            Importar do ERP
          </button>
        </div>
      </div>

      {/* Componente de busca do ERP */}
      {modoErp && (
        <ErpProductSearch
          lojistaId={lojistaId!}
          onImport={handleImportFromErp}
          disabled={isSaving}
        />
      )}
    </div>
  )}

  {/* Resto dos campos do formulário */}
  {/* ... campos existentes (nome, descrição, SKU, etc.) ... */}
```

## 6. Desabilitar Campos Quando em Modo ERP

Opcionalmente, você pode desabilitar os campos que foram preenchidos pelo ERP para indicar que vieram da importação:

```tsx
<Input
  id="nome"
  placeholder="Ex: Parafuso Phillips 3x20mm"
  value={formData.nome}
  onChange={(e) => handleInputChange("nome", e.target.value)}
  required
  disabled={modoErp && !!erpSku} // Desabilita se importado do ERP
  className={modoErp && erpSku ? 'bg-gray-100' : ''}
/>
```

## 7. Badge Indicando Produto Vinculado ao ERP

Adicione um badge visual quando o produto está vinculado ao ERP:

```tsx
{erpSku && (
  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
    <Link2 className="h-4 w-4" />
    <span>Produto vinculado ao ERP (SKU: {erpSku})</span>
  </div>
)}
```

## 8. Carregar erpSku na Edição

Quando o produto está sendo editado e tem um `erpSku`, carregue esse valor (no useEffect que carrega o produto):

```typescript
useEffect(() => {
  const fetchProduct = async () => {
    if (!isEditing || !id) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/v1/produtos/${id}`);
      const produto = response.data;
      
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || "",
        preco: produto.preco.toString(),
        estoque: produto.estoque.toString(),
        sku: produto.sku || "",
        categoriaId: produto.categoria?.id || "",
      });
      
      // Carregar erpSku se existir
      if (produto.erpSku) {
        setErpSku(produto.erpSku);
        setModoErp(true);
      }
      
      // ... resto do código ...
    } catch (error) {
      // ... tratamento de erro ...
    } finally {
      setIsLoading(false);
    }
  };

  fetchProduct();
}, [id, isEditing, toast]);
```

## Resultado Final

Com essas modificações, o formulário de produtos terá:

1. **Toggle Manual/ERP**: Permite escolher entre criar manualmente ou importar do ERP
2. **Busca de Produto**: Campo para buscar produto por SKU no ERP
3. **Preview**: Mostra dados do produto encontrado no ERP antes de importar
4. **Importação Automática**: Preenche todos os campos com dados do ERP
5. **Vinculação**: Vincula automaticamente o produto ao ERP após criação
6. **Sincronização**: Estoque será sincronizado automaticamente pelo scheduler
7. **Badge Visual**: Indica claramente quando produto está vinculado ao ERP

## Fluxo do Usuário

1. Lojista acessa "Novo Produto"
2. Se tem ERP configurado, vê opção "Manual" ou "Importar do ERP"
3. Escolhe "Importar do ERP"
4. Digita o SKU do produto no ERP e clica "Buscar"
5. Sistema exibe preview com todos os dados do produto
6. Clica "Importar Dados do ERP"
7. Formulário é preenchido automaticamente
8. Pode ajustar categoria e fazer upload de imagens
9. Salva o produto
10. Produto é vinculado ao ERP e estoque sincroniza automaticamente

## Benefícios

- ✅ Menos digitação manual
- ✅ Dados consistentes entre sistemas
- ✅ Sincronização automática de estoque
- ✅ Redução de erros de cadastro
- ✅ Experiência de usuário aprimorada
- ✅ Produtos sempre atualizados com o ERP
