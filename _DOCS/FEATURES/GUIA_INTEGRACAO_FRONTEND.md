# 🎯 Guia Rápido de Integração Frontend - Lojista

> Guia prático para conectar as páginas do lojista aos endpoints do backend

## 📋 Checklist de Integração

### 1. MerchantProducts (Produtos)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantProducts.tsx`

**API Endpoints:**
```typescript
// Buscar lojista logado
const fetchLojista = async () => {
  const response = await api.get('/api/v1/lojistas/me');
  setLojistaId(response.data.id);
};

// Listar produtos do lojista
const fetchProducts = async (lojistaId: string) => {
  const response = await api.get(`/api/v1/produtos/lojista/${lojistaId}`);
  setProducts(response.data);
};

// Criar produto
const createProduct = async (productData) => {
  await api.post('/api/v1/produtos', productData);
};

// Atualizar produto
const updateProduct = async (id: string, productData) => {
  await api.put(`/api/v1/produtos/${id}`, productData);
};

// Deletar produto
const deleteProduct = async (id: string) => {
  await api.delete(`/api/v1/produtos/${id}`);
};

// Atualizar estoque
const updateStock = async (id: string, quantity: number) => {
  await api.patch(`/api/v1/produtos/${id}/estoque`, { 
    quantidadeEstoque: quantity 
  });
};
```

---

### 2. MerchantOrders (Pedidos)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantOrders.tsx`

**API Endpoints:**
```typescript
// Listar pedidos do lojista
const fetchOrders = async (lojistaId: string) => {
  const response = await api.get(`/api/v1/pedidos/lojista/${lojistaId}`);
  setOrders(response.data);
};

// Filtrar por status
const fetchOrdersByStatus = async (lojistaId: string, status: string) => {
  const response = await api.get(
    `/api/v1/pedidos/lojista/${lojistaId}/status/${status}`
  );
  setOrders(response.data);
};

// Buscar pedido específico
const fetchOrder = async (id: string) => {
  const response = await api.get(`/api/v1/pedidos/${id}`);
  return response.data;
};

// Atualizar status do pedido
const updateOrderStatus = async (id: string, newStatus: string) => {
  await api.patch(`/api/v1/pedidos/${id}/status`, { 
    status: newStatus 
  });
};
```

**Status Disponíveis:**
- `PENDENTE`, `PROCESSANDO`, `EM_SEPARACAO`
- `PRONTO_PARA_ENVIO`, `EM_TRANSITO`
- `ENTREGUE`, `CANCELADO`

---

### 3. MerchantReturns (Devoluções) ✨ NOVO

**Arquivo:** `win-frontend/src/pages/merchant/MerchantReturns.tsx`

**API Endpoints:**
```typescript
// Listar devoluções do lojista
const fetchReturns = async (lojistaId: string) => {
  const response = await api.get(`/api/v1/devolucoes/lojista/${lojistaId}`);
  setReturns(response.data);
};

// Filtrar por status
const fetchReturnsByStatus = async (lojistaId: string, status: string) => {
  const response = await api.get(
    `/api/v1/devolucoes/lojista/${lojistaId}/status/${status}`
  );
  setReturns(response.data);
};

// Buscar devolução específica
const fetchReturn = async (id: string) => {
  const response = await api.get(`/api/v1/devolucoes/${id}`);
  return response.data;
};

// Aprovar devolução
const approveReturn = async (id: string, lojistaId: string, justificativa: string) => {
  await api.patch(`/api/v1/devolucoes/${id}/lojista/${lojistaId}`, {
    status: 'APROVADO',
    justificativaLojista: justificativa
  });
};

// Recusar devolução
const rejectReturn = async (id: string, lojistaId: string, justificativa: string) => {
  await api.patch(`/api/v1/devolucoes/${id}/lojista/${lojistaId}`, {
    status: 'RECUSADO',
    justificativaLojista: justificativa
  });
};

// Contar pendentes
const countPendingReturns = async (lojistaId: string) => {
  const response = await api.get(
    `/api/v1/devolucoes/lojista/${lojistaId}/pendentes/count`
  );
  return response.data;
};
```

**Status Disponíveis:**
- `PENDENTE` - Aguardando análise
- `APROVADO` - Aprovado pelo lojista
- `RECUSADO` - Recusado pelo lojista
- `EM_TRANSITO` - Produto retornando
- `RECEBIDO` - Produto recebido
- `REEMBOLSADO` - Reembolso efetuado
- `CANCELADO` - Cancelado

**Motivos de Devolução:**
- `PRODUTO_DEFEITUOSO`
- `PRODUTO_DIFERENTE`
- `ARREPENDIMENTO`
- `PRODUTO_DANIFICADO`
- `ENTREGA_ATRASADA`
- `NAO_ATENDE_EXPECTATIVA`
- `OUTRO`

---

### 4. MerchantFinancial (Financeiro) ✨ NOVO

**Arquivo:** `win-frontend/src/pages/merchant/MerchantFinancial.tsx`

**API Endpoints:**
```typescript
// Relatório dos últimos 30 dias
const fetchLast30DaysReport = async (lojistaId: string) => {
  const response = await api.get(
    `/api/v1/relatorios-financeiros/lojista/${lojistaId}/ultimos-30-dias`
  );
  setFinancialReport(response.data);
};

// Relatório do mês atual
const fetchCurrentMonthReport = async (lojistaId: string) => {
  const response = await api.get(
    `/api/v1/relatorios-financeiros/lojista/${lojistaId}/mes-atual`
  );
  setFinancialReport(response.data);
};

// Relatório de período personalizado
const fetchCustomPeriodReport = async (
  lojistaId: string, 
  dataInicio: string, 
  dataFim: string
) => {
  const response = await api.get(
    `/api/v1/relatorios-financeiros/lojista/${lojistaId}`,
    {
      params: {
        dataInicio: dataInicio, // formato: 2024-01-01T00:00:00Z
        dataFim: dataFim
      }
    }
  );
  setFinancialReport(response.data);
};
```

**Estrutura do Relatório:**
```typescript
interface RelatorioFinanceiro {
  // Resumo geral
  receitaTotal: number;
  receitaMesAtual: number;
  receitaMesAnterior: number;
  ticketMedio: number;
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosCompletados: number;
  pedidosCancelados: number;
  
  // Comissões e taxas
  comissaoPlataforma: number;
  taxasTransacao: number;
  receitaLiquida: number;
  
  // Devoluções
  totalDevolucoes: number;
  valorDevolucoes: number;
  
  // Período
  periodoInicio: string;
  periodoFim: string;
  
  // Gráficos
  receitaPorDia: Array<{
    periodo: string;
    receita: number;
    quantidadePedidos: number;
  }>;
  
  receitaPorMes: Array<{
    periodo: string;
    receita: number;
    quantidadePedidos: number;
  }>;
  
  // Top produtos
  topProdutos: Array<{
    produtoId: string;
    produtoNome: string;
    quantidadeVendida: number;
    receitaTotal: number;
    precoMedio: number;
  }>;
  
  // Métodos de pagamento
  pagamentosPorMetodo: Array<{
    metodoPagamento: string;
    quantidadePagamentos: number;
    valorTotal: number;
    percentual: number;
  }>;
}
```

---

### 5. MerchantProfile (Perfil)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantProfile.tsx`

**API Endpoints:**
```typescript
// Buscar perfil do lojista logado
const fetchProfile = async () => {
  const response = await api.get('/api/v1/lojistas/me');
  setProfile(response.data);
};

// Atualizar perfil
const updateProfile = async (id: string, profileData) => {
  await api.put(`/api/v1/lojistas/${id}`, profileData);
};

// Upload de logo (se implementado)
const uploadLogo = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  await api.post(`/api/v1/lojistas/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

**Estrutura do Perfil:**
```typescript
interface Lojista {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  descricao: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}
```

---

### 6. MerchantReviews (Avaliações) - A CRIAR

**Arquivo:** `win-frontend/src/pages/merchant/MerchantReviews.tsx` ❌ NÃO EXISTE

**Criar Nova Página com:**
```typescript
// TODO: Adicionar endpoint no backend primeiro
// GET /api/v1/avaliacoes-produtos/lojista/{lojistaId}

const fetchReviews = async (lojistaId: string) => {
  // Endpoint a ser criado no backend
  const response = await api.get(
    `/api/v1/avaliacoes-produtos/lojista/${lojistaId}`
  );
  setReviews(response.data);
};

// Buscar avaliações de um produto específico
const fetchProductReviews = async (produtoId: string) => {
  const response = await api.get(
    `/api/v1/avaliacoes-produtos/produto/${produtoId}`
  );
  return response.data;
};
```

---

## 🔐 Autenticação

**Todas as requisições precisam do token JWT:**

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

---

## 📝 Exemplo Completo: Integração de Produtos

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/Api';
import { useNotification } from '@/contexts/NotificationContext';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeEstoque: number;
  lojistaId: string;
  categoriaId: string;
  ativo: boolean;
}

export default function MerchantProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lojistaId, setLojistaId] = useState<string>('');
  const { success, error: showError } = useNotification();

  // 1. Buscar ID do lojista logado
  useEffect(() => {
    fetchLojistaId();
  }, []);

  const fetchLojistaId = async () => {
    try {
      const response = await api.get('/api/v1/lojistas/me');
      setLojistaId(response.data.id);
    } catch (err) {
      showError('Erro ao buscar dados do lojista');
      console.error(err);
    }
  };

  // 2. Buscar produtos quando lojistaId estiver disponível
  useEffect(() => {
    if (lojistaId) {
      fetchProducts();
    }
  }, [lojistaId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/produtos/lojista/${lojistaId}`);
      setProducts(response.data);
    } catch (err) {
      showError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Criar produto
  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      await api.post('/api/v1/produtos', {
        ...productData,
        lojistaId: lojistaId,
      });
      success('Produto criado com sucesso!');
      fetchProducts(); // Recarregar lista
    } catch (err) {
      showError('Erro ao criar produto');
      console.error(err);
    }
  };

  // 4. Atualizar produto
  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await api.put(`/api/v1/produtos/${id}`, productData);
      success('Produto atualizado com sucesso!');
      fetchProducts();
    } catch (err) {
      showError('Erro ao atualizar produto');
      console.error(err);
    }
  };

  // 5. Deletar produto
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    
    try {
      await api.delete(`/api/v1/produtos/${id}`);
      success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (err) {
      showError('Erro ao excluir produto');
      console.error(err);
    }
  };

  // 6. Atualizar estoque
  const handleUpdateStock = async (id: string, quantity: number) => {
    try {
      await api.patch(`/api/v1/produtos/${id}/estoque`, {
        quantidadeEstoque: quantity,
      });
      success('Estoque atualizado!');
      fetchProducts();
    } catch (err) {
      showError('Erro ao atualizar estoque');
      console.error(err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Meus Produtos</h1>
      {/* Render products list */}
    </div>
  );
}
```

---

## 🎨 Tratamento de Erros

```typescript
// Interceptor de resposta para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Não autenticado - redirecionar para login
          localStorage.removeItem('token');
          window.location.href = '/merchant/login';
          break;
        case 403:
          // Sem permissão
          alert('Você não tem permissão para esta ação');
          break;
        case 404:
          // Recurso não encontrado
          console.error('Recurso não encontrado');
          break;
        case 500:
          // Erro no servidor
          alert('Erro no servidor. Tente novamente mais tarde.');
          break;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## ✅ Checklist Final

- [ ] Produtos: Listar, Criar, Editar, Deletar, Atualizar Estoque
- [ ] Pedidos: Listar, Filtrar por Status, Atualizar Status
- [ ] Devoluções: Listar, Aprovar, Recusar, Ver Detalhes
- [ ] Financeiro: Relatório 30 dias, Mês Atual, Período Customizado
- [ ] Perfil: Buscar, Atualizar, Upload Logo
- [ ] Avaliações: Criar página e integrar (backend precisa endpoint)
- [ ] Configurações: Criar backend e integrar

---

## 🚀 Próximas Ações

1. **Começar com Produtos e Pedidos** (já tem backend completo)
2. **Integrar Devoluções** (backend novo, pronto para usar)
3. **Integrar Financeiro** (backend novo, pronto para usar)
4. **Criar página de Avaliações** (backend existe, falta endpoint do lojista)
5. **Implementar Configurações** (precisa criar backend)

---

**Documentação Completa:** Ver `docs/INTEGRACOES_LOJISTA.md`  
**Endpoints:** Ver `docs/api-docs/ENDPOINTS.md`
