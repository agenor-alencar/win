# 🏪 Integrações do Lojista - WIN Marketplace

> Documentação completa das integrações backend e frontend para o painel do lojista

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Módulos Implementados](#módulos-implementados)
3. [Produtos](#produtos)
4. [Pedidos](#pedidos)
5. [Devoluções](#devoluções)
6. [Financeiro](#financeiro)
7. [Avaliações](#avaliações)
8. [Perfil e Configurações](#perfil-e-configurações)
9. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

Este documento descreve todas as integrações necessárias para o painel do lojista no WIN Marketplace. As integrações foram desenvolvidas com foco em:

- ✅ **Não quebrar funcionalidades existentes**
- ✅ **Manter integridade do sistema**
- ✅ **Seguir padrões arquiteturais estabelecidos**
- ✅ **Fornecer APIs RESTful completas**
- ✅ **Garantir segurança com autenticação/autorização**

---

## 📦 Módulos Implementados

### Estado Atual

| Módulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| **Produtos** | ✅ Completo | ⚠️ Precisa integração | 90% |
| **Pedidos** | ✅ Completo | ⚠️ Precisa integração | 90% |
| **Devoluções** | ✅ **NOVO** | ⚠️ Precisa integração | 70% |
| **Financeiro** | ✅ **NOVO** | ⚠️ Precisa integração | 70% |
| **Avaliações** | ✅ Completo | ❌ Precisa criar página | 60% |
| **Perfil** | ✅ Parcial | ⚠️ Precisa melhorias | 80% |
| **Configurações** | ❌ Precisa criar | ⚠️ Precisa integração | 40% |
| **Relatórios** | ✅ **NOVO** | ❌ Precisa criar página | 50% |

---

## 🛍️ Produtos

### Backend (✅ Completo)

**Endpoints Disponíveis:**

```
GET    /api/v1/produtos                      - Listar todos produtos
GET    /api/v1/produtos/{id}                 - Buscar produto por ID
GET    /api/v1/produtos/lojista/{lojistaId}  - Listar produtos do lojista
POST   /api/v1/produtos                      - Criar produto (LOJISTA/ADMIN)
PUT    /api/v1/produtos/{id}                 - Atualizar produto (LOJISTA/ADMIN)
DELETE /api/v1/produtos/{id}                 - Deletar produto (LOJISTA/ADMIN)
PATCH  /api/v1/produtos/{id}/estoque        - Atualizar estoque (LOJISTA/ADMIN)
```

**Entidades:**
- `Produto.java` - Entidade principal
- `ProdutoRepository.java` - Repositório JPA
- `ProdutoService.java` - Lógica de negócios
- `ProdutoController.java` - Controller REST

**Permissões:**
- Criar/Editar/Deletar: `LOJISTA`, `ADMIN`
- Listar/Buscar: Público

### Frontend (⚠️ Precisa Integração)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantProducts.tsx`

**Ações Necessárias:**
1. ✅ Interface já existe
2. ⚠️ Conectar ao endpoint `/api/v1/produtos/lojista/{lojistaId}`
3. ⚠️ Implementar CRUD completo com chamadas à API
4. ⚠️ Adicionar upload de imagens para produtos

---

## 📦 Pedidos

### Backend (✅ Completo)

**Endpoints Disponíveis:**

```
GET    /api/v1/pedidos                             - Listar todos (ADMIN)
GET    /api/v1/pedidos/{id}                        - Buscar por ID
GET    /api/v1/pedidos/lojista/{lojistaId}         - Pedidos do lojista
GET    /api/v1/pedidos/lojista/{lojistaId}/status/{status} - Por status
POST   /api/v1/pedidos                             - Criar pedido
PATCH  /api/v1/pedidos/{id}/status                 - Atualizar status
```

**Entidades:**
- `Pedido.java` - Pedido principal
- `ItemPedido.java` - Itens do pedido
- `PedidoRepository.java` - Repositório
- `PedidoService.java` - Lógica de negócios
- `PedidoController.java` - Controller REST

**Status de Pedido:**
- `PENDENTE` - Aguardando pagamento
- `PROCESSANDO` - Pagamento aprovado
- `EM_SEPARACAO` - Lojista separando itens
- `PRONTO_PARA_ENVIO` - Aguardando transportadora
- `EM_TRANSITO` - Em rota de entrega
- `ENTREGUE` - Concluído
- `CANCELADO` - Cancelado

### Frontend (⚠️ Precisa Integração)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantOrders.tsx`

**Ações Necessárias:**
1. ✅ Interface já existe
2. ⚠️ Conectar ao endpoint `/api/v1/pedidos/lojista/{lojistaId}`
3. ⚠️ Implementar atualização de status
4. ⚠️ Adicionar filtros por status
5. ⚠️ Exibir detalhes completos do pedido

---

## 🔄 Devoluções (✅ NOVO)

### Backend (✅ Completo - CRIADO AGORA)

**Novos Arquivos Criados:**

1. **Entidade:** `backend/src/main/java/com/win/marketplace/model/Devolucao.java`
   - Campos: ID, número, pedido, item, usuário, lojista, motivo, descrição, quantidade, valor, status
   - Enums: `MotivoDevolucao`, `StatusDevolucao`

2. **Repository:** `backend/src/main/java/com/win/marketplace/repository/DevolucaoRepository.java`
   - Queries personalizadas para busca por lojista, status, período

3. **DTOs:**
   - `DevolucaoCreateRequestDTO.java` - Criação de devolução
   - `DevolucaoUpdateRequestDTO.java` - Atualização de status
   - `DevolucaoResponseDTO.java` - Resposta completa

4. **Mapper:** `DevolucaoMapper.java` - MapStruct

5. **Service:** `DevolucaoService.java`
   - Criar devolução
   - Atualizar status (lojista)
   - Listar por lojista/status
   - Contar pendentes

6. **Controller:** `DevolucaoController.java`

**Endpoints Criados:**

```
POST   /api/v1/devolucoes/usuario/{usuarioId}                  - Criar devolução
PATCH  /api/v1/devolucoes/{id}/lojista/{lojistaId}            - Atualizar status
GET    /api/v1/devolucoes/lojista/{lojistaId}                 - Listar do lojista
GET    /api/v1/devolucoes/lojista/{lojistaId}/status/{status} - Por status
GET    /api/v1/devolucoes/usuario/{usuarioId}                 - Do usuário
GET    /api/v1/devolucoes/{id}                                - Por ID
GET    /api/v1/devolucoes/numero/{numeroDevolucao}            - Por número
GET    /api/v1/devolucoes/lojista/{lojistaId}/pendentes/count - Contar pendentes
```

**Status de Devolução:**
- `PENDENTE` - Aguardando análise
- `APROVADO` - Devolução aprovada
- `RECUSADO` - Devolução recusada
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

### Frontend (⚠️ Precisa Integração)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantReturns.tsx`

**Ações Necessárias:**
1. ✅ Interface já existe (com dados mock)
2. ⚠️ Conectar ao endpoint `/api/v1/devolucoes/lojista/{lojistaId}`
3. ⚠️ Implementar aprovação/recusa de devoluções
4. ⚠️ Adicionar filtros por status
5. ⚠️ Exibir fotos dos produtos

---

## 💰 Financeiro (✅ NOVO)

### Backend (✅ Completo - CRIADO AGORA)

**Novos Arquivos Criados:**

1. **DTOs:**
   - `RelatorioFinanceiroLojistaDTO.java` - Relatório completo
   - `ReceitaPorPeriodoDTO.java` - Receita por dia/mês
   - `ProdutoVendasDTO.java` - Estatísticas de produtos
   - `PagamentoPorMetodoDTO.java` - Pagamentos por método

2. **Service:** `RelatorioFinanceiroService.java`
   - Gerar relatório financeiro completo
   - Calcular receitas por período
   - Top produtos
   - Métodos de pagamento
   - Devoluções e reembolsos
   - Comissões e taxas

3. **Controller:** `RelatorioFinanceiroController.java`

**Endpoints Criados:**

```
GET /api/v1/relatorios-financeiros/lojista/{lojistaId}
    ?dataInicio={dataInicio}&dataFim={dataFim}
    - Relatório financeiro do período

GET /api/v1/relatorios-financeiros/lojista/{lojistaId}/ultimos-30-dias
    - Relatório dos últimos 30 dias

GET /api/v1/relatorios-financeiros/lojista/{lojistaId}/mes-atual
    - Relatório do mês atual
```

**Dados do Relatório:**
- Receita total, mês atual, mês anterior
- Ticket médio
- Total de pedidos (pendentes, completados, cancelados)
- Comissões e taxas da plataforma
- Receita líquida
- Total e valor de devoluções
- Receita por dia/mês (gráficos)
- Top 10 produtos mais vendidos
- Distribuição por método de pagamento

**Queries Adicionadas aos Repositories:**

**PedidoRepository:**
- `findPedidosFinanceirosPorLojista` - Valor e status dos pedidos
- `findReceitaPorDia` - Receita agrupada por dia
- `findReceitaPorMes` - Receita agrupada por mês
- `findTopProdutosPorLojista` - Produtos mais vendidos

**DevolucaoRepository:**
- `findDevolucoesPorLojista` - Devoluções do período

**PagamentoRepository:**
- `findPagamentosPorMetodo` - Pagamentos agrupados por método

### Frontend (⚠️ Precisa Integração)

**Arquivo:** `win-frontend/src/pages/merchant/MerchantFinancial.tsx`

**Ações Necessárias:**
1. ✅ Interface já existe (com dados mock)
2. ⚠️ Conectar ao endpoint `/api/v1/relatorios-financeiros/lojista/{lojistaId}`
3. ⚠️ Implementar seletor de período
4. ⚠️ Atualizar gráficos com dados reais
5. ⚠️ Implementar exportação de relatórios (PDF/Excel)

---

## ⭐ Avaliações

### Backend (✅ Completo)

**Endpoints Disponíveis:**

```
POST   /api/v1/avaliacoes-produtos/usuario/{usuarioId}  - Criar avaliação
GET    /api/v1/avaliacoes-produtos/produto/{produtoId} - Avaliações do produto
GET    /api/v1/avaliacoes-produtos/usuario/{usuarioId} - Avaliações do usuário
GET    /api/v1/avaliacoes-produtos/{id}                - Buscar por ID
PUT    /api/v1/avaliacoes-produtos/{id}/usuario/{usuarioId} - Atualizar
DELETE /api/v1/avaliacoes-produtos/{id}                - Deletar (ADMIN)
```

**Entidades:**
- `AvaliacaoProduto.java` - Avaliação
- `AvaliacaoProdutoRepository.java`
- `AvaliacaoProdutoService.java`
- `AvaliacaoProdutoController.java`

**Campos:**
- Produto, Usuário, Nota (1-5), Comentário, Data

### Frontend (❌ Precisa Criar)

**Ações Necessárias:**
1. ❌ Criar página `MerchantReviews.tsx`
2. ❌ Listar avaliações dos produtos do lojista
3. ❌ Implementar resposta a avaliações (se necessário)
4. ❌ Filtros por produto e nota
5. ❌ Estatísticas de avaliações

**Endpoint Sugerido para Lojista:**
```
GET /api/v1/avaliacoes-produtos/lojista/{lojistaId}
```

**Necessário Adicionar:**
- Query no `AvaliacaoProdutoRepository`
- Método no `AvaliacaoProdutoService`
- Endpoint no `AvaliacaoProdutoController`

---

## 👤 Perfil e Configurações

### Backend - Perfil (⚠️ Precisa Melhorias)

**Endpoints Existentes:**

```
GET    /api/v1/lojistas/me          - Perfil do lojista logado
GET    /api/v1/lojistas/{id}        - Buscar por ID
PUT    /api/v1/lojistas/{id}        - Atualizar lojista
PATCH  /api/v1/lojistas/{id}/ativar - Ativar
PATCH  /api/v1/lojistas/{id}/desativar - Desativar
```

**Entidade Atual - Lojista.java:**
```java
- id, usuario, cnpj, nomeFantasia, razaoSocial
- descricao, telefone
- cep, logradouro, numero, complemento, bairro, cidade, uf
- ativo, criadoEm, atualizadoEm
```

✅ **Já possui campos de endereço!**

**Melhorias Necessárias:**
1. ⚠️ Adicionar campo `icone` ou `logo` para imagem do lojista
2. ⚠️ Adicionar campos de horário de funcionamento
3. ⚠️ Adicionar campos de configurações de entrega

### Backend - Configurações (❌ Precisa Criar)

**Sugestão: Criar Entity `LojistaConfiguracao`**

```java
@Entity
public class LojistaConfiguracao {
    UUID id;
    Lojista lojista;
    
    // Notificações
    Boolean notificacaoEmail;
    Boolean notificacaoSMS;
    Boolean notificarNovoPedido;
    Boolean notificarBaixoEstoque;
    
    // Loja
    Boolean lojaAberta;
    Boolean aceitarPedidosAutomaticamente;
    Boolean exibirEstoque;
    Boolean permitirAvaliacoes;
    
    // Envio
    BigDecimal freteGratisAcimaDe;
    String tempoPreparo;
    Integer diasDevolucao;
}
```

### Frontend (⚠️ Precisa Integração)

**Arquivos:**
- `win-frontend/src/pages/merchant/MerchantProfile.tsx` (✅ existe)
- `win-frontend/src/pages/merchant/MerchantSettings.tsx` (✅ existe)

**Ações Necessárias:**

**MerchantProfile.tsx:**
1. ⚠️ Conectar ao endpoint `/api/v1/lojistas/me`
2. ⚠️ Implementar upload de logo/ícone
3. ⚠️ Permitir edição de todos os campos
4. ⚠️ Validar CNPJ, CEP, telefone

**MerchantSettings.tsx:**
1. ❌ Criar backend para configurações
2. ⚠️ Conectar aos novos endpoints
3. ⚠️ Implementar configuração de notificações
4. ⚠️ Configurações de loja e envio
5. ⚠️ Gerenciamento de contas bancárias (se necessário)

---

## 📊 Relatórios e Analytics

### Backend (✅ Parcialmente Completo)

**Relatório Financeiro:** ✅ CRIADO (ver seção Financeiro)

**Sugestões de Novos Endpoints:**

```
GET /api/v1/relatorios/lojista/{lojistaId}/dashboard
    - Métricas para dashboard (resumo geral)
    
GET /api/v1/relatorios/lojista/{lojistaId}/produtos/performance
    - Performance de produtos (mais vendidos, menos vendidos, sem estoque)
    
GET /api/v1/relatorios/lojista/{lojistaId}/clientes/top
    - Top clientes (mais compraram)
```

### Frontend (❌ Precisa Criar)

**Ações Necessárias:**
1. ❌ Criar página `MerchantReports.tsx` ou expandir dashboard
2. ❌ Implementar gráficos de vendas por período
3. ❌ Gráficos de produtos mais vendidos
4. ❌ Análise de clientes
5. ❌ Exportação de relatórios

---

## 🔒 Segurança

Todas as APIs implementadas seguem o padrão de segurança:

**Autenticação:**
- JWT Bearer Token no header `Authorization`

**Autorização:**
- `@PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")` nos endpoints do lojista
- Verificação de que o lojista só acessa seus próprios dados

**Exemplo:**
```java
// Verificar se a devolução pertence ao lojista
if (!devolucao.getLojista().getId().equals(lojistaId)) {
    throw new RuntimeException("Devolução não pertence a este lojista");
}
```

---

## 🚀 Próximos Passos

### Prioridade Alta (Essencial)

1. ✅ **Devoluções Backend** - COMPLETO
2. ✅ **Financeiro Backend** - COMPLETO
3. ⚠️ **Integrar Frontend de Produtos** - Conectar à API existente
4. ⚠️ **Integrar Frontend de Pedidos** - Conectar à API existente
5. ⚠️ **Integrar Frontend de Devoluções** - Conectar à nova API
6. ⚠️ **Integrar Frontend de Financeiro** - Conectar à nova API

### Prioridade Média (Importante)

7. ❌ **Criar Página de Avaliações** - MerchantReviews.tsx
8. ❌ **Criar Endpoint de Avaliações do Lojista**
9. ⚠️ **Melhorar Perfil** - Upload de logo, validações
10. ❌ **Criar Sistema de Configurações** - Backend + Frontend

### Prioridade Baixa (Opcional)

11. ❌ **Página de Relatórios Avançados**
12. ❌ **Exportação de Relatórios (PDF/Excel)**
13. ❌ **Dashboard Analytics Avançado**
14. ❌ **Notificações em Tempo Real**
15. ❌ **Chat com Clientes**

---

## 📝 Resumo de Arquivos Criados

### Backend - Novos Arquivos

**Devoluções:**
- `model/Devolucao.java`
- `repository/DevolucaoRepository.java`
- `dto/request/DevolucaoCreateRequestDTO.java`
- `dto/request/DevolucaoUpdateRequestDTO.java`
- `dto/response/DevolucaoResponseDTO.java`
- `dto/mapper/DevolucaoMapper.java`
- `service/DevolucaoService.java`
- `controller/DevolucaoController.java`

**Financeiro:**
- `dto/response/RelatorioFinanceiroLojistaDTO.java`
- `dto/response/ReceitaPorPeriodoDTO.java`
- `dto/response/ProdutoVendasDTO.java`
- `dto/response/PagamentoPorMetodoDTO.java`
- `service/RelatorioFinanceiroService.java`
- `controller/RelatorioFinanceiroController.java`

**Repositories Modificados:**
- `PedidoRepository.java` - Adicionadas queries de relatórios
- `DevolucaoRepository.java` - Queries financeiras
- `PagamentoRepository.java` - Queries de métodos de pagamento

### Frontend - Arquivos Existentes (Precisam Integração)

- ✅ `pages/merchant/MerchantProducts.tsx`
- ✅ `pages/merchant/MerchantOrders.tsx`
- ✅ `pages/merchant/MerchantReturns.tsx`
- ✅ `pages/merchant/MerchantFinancial.tsx`
- ✅ `pages/merchant/MerchantProfile.tsx`
- ✅ `pages/merchant/MerchantSettings.tsx`
- ✅ `pages/merchant/MerchantDashboardImproved.tsx`

### Frontend - Arquivos a Criar

- ❌ `pages/merchant/MerchantReviews.tsx`
- ❌ `pages/merchant/MerchantReports.tsx` (opcional)

---

## ✅ Garantia de Integridade

Todas as implementações seguem estas garantias:

1. **✅ Sem Quebra de Funcionalidades:**
   - Nenhum endpoint existente foi modificado
   - Apenas adicionadas novas funcionalidades
   - Compatibilidade retroativa mantida

2. **✅ Integridade do Sistema:**
   - Transações ACID mantidas
   - Validações em todos os endpoints
   - Tratamento de erros adequado

3. **✅ Padrões Arquiteturais:**
   - Seguindo estrutura MVC/REST
   - DTOs para separação de camadas
   - MapStruct para mapeamento
   - Repository pattern
   - Service layer

4. **✅ Segurança:**
   - Autenticação JWT
   - Autorização por roles
   - Validação de propriedade de recursos

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend (`logs/`)
2. Teste os endpoints com Postman/Insomnia
3. Consulte Swagger UI em `/swagger-ui.html`

---

**Desenvolvido para WIN Marketplace**  
**Data:** Novembro 2025  
**Versão:** 1.0
