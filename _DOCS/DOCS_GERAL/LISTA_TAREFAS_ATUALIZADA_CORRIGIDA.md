# 📋 Lista de Tarefas Atualizada - WIN Marketplace
**Status do Projeto Analisado em: 12/03/2026**

---

## 🎯 Estrutura Profissional de Desenvolvimento

Para transformar o WIN Marketplace em uma plataforma de referência, o foco deve ser em **estabilidade, segurança e experiência do usuário**. A equipe foi dividida em duas frentes complementares.

---

## 👨‍💻 Desenvolvedor 1: Backend, Segurança e Integrações

### ✅ Tarefa 1: Funcionalidade "Lembrar-me" no Login
**Status Atual:** ⚠️ Parcialmente implementado
- ✅ Checkbox visual existe no frontend (MerchantAuth.tsx)
- ✅ Endpoint `/refresh-token` existe no backend
- ❌ Funcionalidade não está conectada (não salva/carrega email)

**O que fazer:**
- Implementar lógica no frontend para salvar email no `localStorage` quando checkbox marcado
- Carregar email automaticamente ao acessar tela de login
- Utilizar o endpoint existente `/api/v1/auth/refresh-token` para renovar sessão
- Adicionar botão "X" para limpar email salvo

**Prioridade:** 🟡 MÉDIA (melhoria de UX)

---

### ✅ Tarefa 2: Recuperação de Senha e Confirmação de E-mail
**Status Atual:** ✅ TOTALMENTE IMPLEMENTADO
- ✅ `PasswordResetService` completo
- ✅ Envio de tokens por e-mail funcionando
- ✅ Endpoints de reset de senha ativos
- ✅ Validação e expiração de tokens

**O que fazer:**
- ~~Implementar serviço de recuperação~~ ✅ JÁ EXISTE
- Testar fluxo end-to-end em produção
- Documentar processo para usuários

**Prioridade:** 🟢 BAIXA (apenas testes e documentação)

---

### ⚠️ Tarefa 3: Sincronização de Estoque com ERP
**Status Atual:** ✅ Estrutura genérica implementada, ⚠️ NavSoft específico não encontrado
- ✅ `MultiErpStockScheduler` implementado
- ✅ `ErpClientFactory` para suportar múltiplos ERPs
- ✅ `LojistaErpConfig` para configuração por lojista
- ❌ Cliente específico NavSoft não implementado

**O que fazer:**
- Criar classe `NavSoftApiClient implements ErpApiClient`
- Implementar endpoint `/api/request/Estoque/BuscarQuantidades`
- Adicionar tratamento para erro 429 (Too Many Requests)
- Configurar rate limiting: máximo 1.000 requisições/hora
- Registrar NavSoft no `ErpClientFactory`

**Prioridade:** 🟡 MÉDIA (depende de contrato com NavSoft)

---

### ✅ Tarefa 4: Webhook e CSRF em Desenvolvimento
**Status Atual:** ✅ JÁ CONFIGURADO CORRETAMENTE
- ✅ CSRF desabilitado em `SecurityConfig.java`
- ✅ Webhooks Uber: `/api/v1/webhooks/**` público
- ✅ Webhooks Pagar.me: `/api/v1/pagamentos/webhooks/**` público

**O que fazer:**
- ~~Ajustar SecurityConfig~~ ✅ JÁ ESTÁ CORRETO
- Apenas validar que webhooks funcionam em localhost

**Prioridade:** 🟢 BAIXA (já resolvido)

---

## 👨‍💻 Desenvolvedor 2: Frontend, UX e Experiência do Cliente

### ⚠️ Tarefa 1: Melhorar Mensagens de Erro no Checkout
**Status Atual:** ⚠️ Erros genéricos, precisa tornar amigável
- ✅ Cálculo de frete implementado (`shippingApi`)
- ⚠️ Mensagens de erro genéricas ("Erro ao calcular frete")

**O que fazer:**
- Capturar erros específicos da API Uber (CEP fora de área, indisponibilidade)
- Exibir mensagens amigáveis:
  - ❌ Genérico: "Erro ao calcular frete"
  - ✅ Amigável: "Poxa! Ainda não entregamos no seu CEP. Digite outro endereço."
- Adicionar sugestões quando frete falhar (retirada na loja, outro CEP)
- Implementar loading states claros durante cálculo

**Prioridade:** 🔴 ALTA (impacta conversão)

---

### ⚠️ Tarefa 2: Integração Pagar.me V5 - Tokenização Segura
**Status Atual:** ✅ Backend pronto, ⚠️ Frontend precisa ajustes
- ✅ `PagarMeService` implementado no backend
- ✅ Endpoint de PIX funcionando
- ⚠️ Frontend pode não estar usando Public Key corretamente

**O que fazer:**
- Garantir que frontend use **apenas** `PAGARME_PUBLIC_KEY` (pk_...)
- Tokenizar cartão de crédito no navegador antes de enviar ao backend
- Criar tela de sucesso PIX com:
  - QR Code grande e clicável
  - Linha "Copia e Cola" com botão de copiar
  - Timer de expiração (30 minutos)
  - Atualização automática quando pagamento aprovado
- Nunca enviar dados de cartão em plain text ao backend

**Prioridade:** 🔴 ALTA (segurança PCI-DSS)

---

### 🆕 Tarefa 3: Estrutura Base do App Android
**Status Atual:** ❌ NÃO EXISTE
- ❌ Projeto Android não encontrado no repositório

**O que fazer:**
- Criar novo projeto no Android Studio (Kotlin + Jetpack Compose)
- Implementar telas básicas:
  - Splash Screen
  - Home com listagem de produtos (consumir API existente)
  - Detalhes do produto
- Configurar chamadas HTTP para API: `http://winmarketplace.com.br/api/v1`
- Adicionar autenticação (usar tokens JWT existentes)

**Prioridade:** 🟡 MÉDIA (expansão de plataforma)

---

## 👨‍💻 Desenvolvedor 1: Workflow de Status e Automações

### ⚠️ Tarefa 5: Filtrar Pedidos do Lojista por Pagamento Aprovado
**Status Atual:** ⚠️ Lista todos os pedidos, independente de pagamento

**O que fazer:**
- Modificar `PedidoRepository` para filtrar por `statusPagamento = 'APROVADO'`
- Criar endpoint específico: `/api/v1/pedidos/lojista/{id}/pendentes-preparacao`
- Retornar apenas pedidos pagos que aguardam preparo
- Atualizar frontend do lojista para usar novo endpoint

**Prioridade:** 🔴 ALTA (lojista não deve ver pedidos não pagos)

---

### ⚠️ Tarefa 6: Workflow de Transição de Status
**Status Atual:** ✅ Enum correto, ⚠️ Transições não validadas

**Observação importante:** ❌ Não existe status `PRONTO_PARA_RETIRADA`
- ✅ Status correto é: **`PRONTO`**

**Enum atual:**
```java
PENDENTE, CONFIRMADO, PREPARANDO, PRONTO, EM_TRANSITO, ENTREGUE, CANCELADO
```

**O que fazer:**
- Criar `PedidoStatusService` com método `transicionarStatus(UUID pedidoId, StatusPedido novoStatus)`
- Validar transições permitidas:
  - PENDENTE → CONFIRMADO (após pagamento aprovado)
  - CONFIRMADO → PREPARANDO (lojista iniciou preparo)
  - PREPARANDO → PRONTO (lojista finalizou preparo)
  - PRONTO → EM_TRANSITO (motorista coletou)
  - EM_TRANSITO → ENTREGUE (entrega concluída)
  - Qualquer → CANCELADO (com validações)
- Enviar notificações ao cliente e admin em cada mudança
- Registrar histórico de mudanças (`pedido_status_historico`)

**Prioridade:** 🔴 ALTA (core do sistema)

---

### 🆕 Tarefa 7: Gatilho Automático Uber Direct ao Status PRONTO
**Status Atual:** ⚠️ Chamada manual, precisa automatizar

**O que fazer:**
- Criar listener/interceptor para mudanças de status
- Quando `pedido.status = PRONTO`:
  1. Validar que entrega tem `tipoEntrega = 'UBER'`
  2. Chamar automaticamente `UberFlashService.criarEntrega()`
  3. Salvar `deliveryId` retornado
  4. Transicionar status para `EM_TRANSITO` após confirmação Uber
  5. Notificar cliente com link de rastreamento
- Adicionar retry em caso de falha (máximo 3 tentativas)
- Fallback: se Uber falhar, notificar admin

**Prioridade:** 🟡 MÉDIA (automação importante)

---

## 👨‍💻 Desenvolvedor 2: Dashboard e Interface do Lojista

### ⚠️ Tarefa 8: Redesign da Lista de Pedidos (Merchant Dashboard)
**Status Atual:** ⚠️ Dashboard existe mas pode ser otimizado

**O que fazer:**
- Criar cards compactos com informações essenciais:
  - ID do pedido (formato curto: #12345)
  - Hora do pedido (relativa: "Há 5 minutos")
  - Valor total
  - Produtos (resumo: "3x Hambúrguer, 2x Refrigerante")
- Implementar botões de ação dinâmica por status:
  - `CONFIRMADO` → Botão "Iniciar Preparo"
  - `PREPARANDO` → Botão "Marcar como Pronto"
  - `PRONTO` → Badge "Aguardando Motorista"
  - `EM_TRANSITO` → Badge "Em Entrega"
- Adicionar filtros: Todos, Em Preparo, Prontos, Em Trânsito
- Sons de notificação para novos pedidos

**Prioridade:** 🔴 ALTA (experiência do lojista)

---

### 🆕 Tarefa 9: Tela "Modo Preparo" para Lojista
**Status Atual:** ❌ NÃO EXISTE

**O que fazer:**
- Criar modal/página de detalhes ao clicar em "Iniciar Preparo"
- Exibir checklist dos produtos:
  ```
  ✅ 2x Hambúrguer Artesanal
  ✅ 1x Batata Frita Grande
  ☐ 2x Refrigerante Lata
  ```
- Permitir marcar items conforme separados
- Botão "Finalizar Preparo" só habilitado quando 100% checado
- Timer: quanto tempo levou o preparo (métrica)
- Imprimir comanda (opcional)

**Prioridade:** 🟡 MÉDIA (melhoria operacional)

---

### ⚠️ Tarefa 10: Funcionalidade "Lembrar-me" no Login (Frontend)
**Status Atual:** ⚠️ Checkbox existe mas não funciona

**O que fazer:**
- Implementar em `MerchantAuth.tsx` (linha 255):
  ```typescript
  const [rememberMe, setRememberMe] = useState(false);
  
  // Ao logar com sucesso:
  if (rememberMe) {
    localStorage.setItem('savedEmail', email);
  }
  
  // No useEffect inicial:
  const savedEmail = localStorage.getItem('savedEmail');
  if (savedEmail) {
    setLoginData(prev => ({ ...prev, email: savedEmail }));
  }
  ```
- Adicionar botão "X" ao lado do input para limpar email salvo
- Aplicar mesma lógica no login de usuários (não apenas lojista)

**Prioridade:** 🟡 MÉDIA (melhoria de UX)

---

### 🆕 Tarefa 11: Bootstrap do App Android - Rastreamento
**Status Atual:** ❌ Projeto não existe

**O que fazer:**
- Configurar estrutura MVVM no Android Studio
- Criar tela de rastreamento consumindo:
  - Endpoint: `GET /api/v1/entregas/{id}/rastreamento`
  - Dados: localização do motorista, ETA, status
- Implementar mapa (Google Maps SDK)
- Atualização em tempo real (WebSocket ou polling a cada 10s)
- Notificações push quando status mudar

**Prioridade:** 🟡 MÉDIA (depende da Tarefa 3)

---

## 🆕 FUNCIONALIDADES ESSENCIAIS FALTANTES

### 🔴 CRÍTICAS - Necessárias para Sistema Completo

#### ⚠️ Tarefa 12: Sistema de Notificações Completo
**Status Atual:** ✅ Service existe, ⚠️ Templates e triggers incompletos
- ✅ `NotificacaoService` implementado
- ❌ Falta templates de email personalizados

**O que fazer:**
- Criar templates HTML para cada evento:
  - Pedido criado (com resumo e link de rastreamento)
  - Status alterado (cada mudança de status)
  - Pagamento aprovado/recusado
  - Produto favorito em promoção
  - Estoque reposto de item favorito
- Implementar notificações no frontend (toast/popup)
- Adicionar preferências de notificação no perfil do usuário
- Implementar fila de emails (não bloquear requisição)

**Prioridade:** 🔴 ALTA (comunicação com cliente)

---

#### ⚠️ Tarefa 13: Gestão Inteligente de Estoque
**Status Atual:** ✅ Campo estoque existe, ❌ Sem automações

**O que fazer:**
- Criar `EstoqueService` com:
  - Método `verificarEstoqueBaixo()` - alert quando < 5 unidades
  - Método `desabilitarSemEstoque()` - produto.ativo = false se estoque = 0
  - Método `reservarEstoque(pedidoId)` - reservar ao criar pedido
  - Método `liberarEstoque(pedidoId)` - liberar se pagamento falhar/cancelar
- Implementar job scheduled (a cada 1 hora):
  - Verificar produtos com estoque < 5
  - Notificar lojista por email
  - Exibir badge "Estoque Baixo" no dashboard
- Adicionar endpoint `GET /api/v1/produtos/analytics/estoque-critico`
- Histórico de movimentação de estoque

**Prioridade:** 🔴 ALTA (evitar venda sem estoque)

---

#### ⚠️ Tarefa 14: Histórico Detalhado de Pedidos
**Status Atual:** ❌ Não existe tabela de auditoria

**O que fazer:**
- Criar entidade `PedidoHistorico`:
  ```java
  - id (UUID)
  - pedidoId (FK)
  - statusAnterior
  - statusNovo
  - usuarioId (quem alterou)
  - motivoCancelamento (se aplicável)
  - dataHora
  - observacoes
  ```
- Criar `PedidoHistoricoRepository` e Service
- Interceptar TODAS as mudanças de status em `PedidoService`
- Registrar automaticamente no histórico
- Endpoint `GET /api/v1/pedidos/{id}/historico` para timeline
- Exibir timeline visual no frontend (como tracking de entrega)

**Prioridade:** 🔴 ALTA (auditoria e transparência)

---

#### ⚠️ Tarefa 15: Cancelamento com Estorno Automático
**Status Atual:** ✅ Status CANCELADO existe, ❌ Sem lógica de estorno

**O que fazer:**
- Criar `CancelamentoService`:
  - Validar se pedido pode ser cancelado (regras de negócio)
  - Cancelar no Pagar.me automaticamente
  - Processar estorno (total ou parcial)
  - Devolver estoque reservado
  - Notificar todas as partes (cliente, lojista, admin)
- Regras de cancelamento:
  - PENDENTE/CONFIRMADO: Cancelamento livre
  - PREPARANDO: Cancelamento com aprovação do lojista
  - PRONTO/EM_TRANSITO: Apenas admin pode cancelar
  - ENTREGUE: Apenas devolução (processo separado)
- Endpoint `POST /api/v1/pedidos/{id}/cancelar` com motivo obrigatório
- Implementar no frontend modal de cancelamento com dropdown de motivos

**Prioridade:** 🔴 ALTA (experiência do cliente)

---

#### ⚠️ Tarefa 16: Aplicação de Cupons no Checkout
**Status Atual:** ✅ CupomController existe, ⚠️ Não integrado no checkout

**O que fazer:**
- Criar endpoint `POST /api/v1/cupons/validar`:
  - Validar código do cupom
  - Verificar validade, limite de uso, usuário elegível
  - Retornar desconto calculado
- Integrar no `PedidoService` para aplicar desconto ao criar pedido
- No frontend (checkout):
  - Campo "Tem um cupom?" com input
  - Botão "Aplicar" que valida e mostra desconto
  - Exibir valor original, desconto e valor final
  - Permitir remover cupom aplicado
- Criar tipos de cupom:
  - Percentual (ex: 10% de desconto)
  - Valor fixo (ex: R$ 20 off)
  - Frete grátis
  - Primeira compra
- Gerar cupons automáticos (ex: BEMVINDO10 para novos usuários)

**Prioridade:** 🟡 MÉDIA (aumenta conversão)

---

### 🟡 IMPORTANTES - Melhorias Significativas

#### ⚠️ Tarefa 17: Busca Avançada com Filtros
**Status Atual:** ✅ PesquisaController básico existe

**O que fazer:**
- Expandir `ProdutoRepository` com query methods:
  - `findByFilters(categoria, precoMin, precoMax, lojistaId, ordenacao)`
  - Implementar ordenação (mais vendidos, menor preço, melhor avaliação)
- Criar endpoint `GET /api/v1/produtos/buscar-avancada?q=...&categoria=...&precoMin=...`
- No frontend:
  - Sidebar com filtros (checkboxes por categoria, range de preço)
  - Dropdown de ordenação
  - Tags dos filtros aplicados (removíveis)
  - Contador de resultados
- Adicionar autocomplete na busca:
  - Endpoint `GET /api/v1/produtos/sugestoes?q=ham`
  - Retornar top 5 sugestões enquanto digita
- Salvar histórico de buscas em `localStorage` (últimas 5)

**Prioridade:** 🟡 MÉDIA (melhora descoberta de produtos)

---

#### ⚠️ Tarefa 18: Chat em Tempo Real (Cliente ↔ Lojista)
**Status Atual:** ✅ MensagemController existe, ❌ Sem WebSocket

**O que fazer:**
- Configurar WebSocket com Spring Boot:
  - Adicionar dependência `spring-boot-starter-websocket`
  - Criar `WebSocketConfig` e `ChatWebSocketHandler`
  - Endpoints: `/ws/chat/{conversaId}`
- Criar `ConversaService`:
  - Iniciar conversa ao clicar em "Falar com Lojista"
  - Listar conversas ativas do usuário
  - Marcar mensagens como lidas
- No frontend:
  - Ícone de chat flutuante (como WhatsApp)
  - Modal de chat com histórico de mensagens
  - Indicador "digitando..."
  - Badge de mensagens não lidas
  - Sons de notificação
  - Push notification quando app em background
- Dashboard do lojista: lista de conversas com badge de pendentes

**Prioridade:** 🟡 MÉDIA (suporte ao cliente)

---

#### ⚠️ T19: Carrinhoarefa  Abandonado - Recuperação
**Status Atual:** ✅ CarrinhoController existe, ❌ Sem sistema de recuperação

**O que fazer:**
- Implementar salvamento automático:
  - Usuário deslogado: salvar em `localStorage`
  - Usuário logado: persistir no banco (`CarrinhoItem`)
  - Ao logar: mesclar carrinhos (localStorage + banco)
- Criar job scheduled `CarrinhoAbandonadoJob`:
  - Rodar a cada 6 horas
  - Buscar carrinhos não convertidos em pedido há > 24h
  - Enviar email de recuperação com:
    - Produtos no carrinho (imagens)
    - Link "Finalizar Compra"
    - Cupom de incentivo (5% off para finalizar hoje)
- Dashboard admin: métricas de taxa de abandono
- A/B test: enviar email após 24h vs 48h

**Prioridade:** 🟡 MÉDIA (recuperar vendas perdidas)

---

#### 🆕 Tarefa 20: Dashboard Administrativo Avançado
**Status Atual:** ✅ AdminController básico existe

**O que fazer:**
- Adicionar endpoints de analytics:
  - `GET /api/v1/admin/relatorio/vendas?periodo=...`
  - `GET /api/v1/admin/relatorio/comissoes?lojistaId=...`
  - `GET /api/v1/admin/dashboard/metricas` (KPIs principais)
- Métricas importantes:
  - Receita total, GMV (Gross Merchandise Value)
  - Taxa de conversão (visitas → compras)
  - Ticket médio
  - Produtos mais vendidos (top 10)
  - Lojistas com mais vendas
  - Taxa de cancelamento
  - NPS (Net Promoter Score)
- Gráficos no frontend:
  - Vendas por dia/semana/mês (line chart)
  - Vendas por categoria (pie chart)
  - Funil de conversão (funnel chart)
- Exportar relatórios (CSV/PDF)

**Prioridade:** 🟡 MÉDIA (tomada de decisão)

---

### 🟢 DESEJÁVEIS - Longo Prazo

#### 🆕 Tarefa 21: Sistema de Disputa/Contestação Avançado
**Status Atual:** ✅ DevolucaoController existe, ⚠️ Fluxo incompleto

**O que fazer:**
- Expandir sistema de devoluções:
  - Cliente abre disputa (produto com defeito, não recebido)
  - Lojista responde (pode aceitar ou contestar)
  - Admin media (se lojista contestar)
  - Chat tripartite (cliente ↔ lojista ↔ admin)
- Adicionar fotos/vídeos como evidência
- Tipos de resolução:
  - Estorno total
  - Estorno parcial
  - Reenvio do produto
  - Cupom de compensação
- Deadline para resposta (lojista: 48h, admin: 72h)
- Histórico completo da disputa

**Prioridade:** 🟢 BAIXA (pode usar processo manual inicialmente)

---

#### 🆕 Tarefa 22: Programa de Fidelidade/Cashback
**Status Atual:** ❌ Não existe

**O que fazer:**
- Criar entidade `PontosFidelidade`:
  ```java
  - usuarioId (FK)
  - pontos (Integer)
  - origem (COMPRA, INDICACAO, BONUS)
  - valor (R$ usado para ganhar pontos)
  ```
- Regras:
  - 1% do valor da compra vira pontos (R$ 100 = 100 pontos)
  - 100 pontos = R$ 1 de desconto
  - Pontos expiram em 12 meses
- Indicação de amigos:
  - Gerar link único de indicação
  - Indicador ganha 50 pontos quando indicado faz primeira compra
  - Indicado ganha 50 pontos de boas-vindas
- Dashboard de pontos no perfil do usuário
- Resgatar pontos como desconto no checkout

**Prioridade:** 🟢 BAIXA (gamificação para retenção)

---

#### 🆕 Tarefa 23: Emissão de Nota Fiscal Eletrônica
**Status Atual:** ❌ Não existe

**O que fazer:**
- Integrar com emissor de NFe (Focus NFe, Tiny, Bling)
- Configurar por lojista (cada lojista tem seu CNPJ/certificado)
- Emitir automaticamente ao status ENTREGUE
- Enviar PDF por email para cliente
- Armazenar XML e PDF no DigitalOcean Spaces
- Compliance: obrigatório para PMEs

**Prioridade:** 🟢 BAIXA (pode ser manual inicialmente)

---

## 📊 Resumo de Prioridades ATUALIZADO

### 🔴 ALTA - Implementar Imediatamente:
1. ✅ Melhorar mensagens de erro no checkout
2. ✅ Tokenização segura Pagar.me no frontend
3. ✅ Filtrar pedidos do lojista por pagamento aprovado
4. ✅ Workflow robusto de transição de status
5. ✅ Redesign da lista de pedidos do lojista
6. 🆕 Sistema de notificações completo (Tarefa 12)
7. 🆕 Gestão inteligente de estoque (Tarefa 13)
8. 🆕 Histórico detalhado de pedidos (Tarefa 14)
9. 🆕 Cancelamento com estorno automático (Tarefa 15)

### 🟡 MÉDIA - Próximas Sprints:
10. ⚠️ Implementar "Lembrar-me" funcional
11. ⚠️ Sincronização com ERP NavSoft
12. ⚠️ Gatilho automático Uber ao status PRONTO
13. ⚠️ Tela "Modo Preparo" para lojista
14. ⚠️ Iniciar estrutura do App Android
15. 🆕 Aplicação de cupons no checkout (Tarefa 16)
16. 🆕 Busca avançada com filtros (Tarefa 17)
17. 🆕 Chat em tempo real (Tarefa 18)
18. 🆕 Carrinho abandonado (Tarefa 19)
19. 🆕 Dashboard administrativo avançado (Tarefa 20)

### 🟢 BAIXA - Melhorias Contínuas:
20. ✅ Testar recuperação de senha em produção
21. ✅ Validar webhooks em localhost
22. ⚠️ Bootstrap rastreamento no Android (depende de app)
23. 🆕 Sistema de disputa avançado (Tarefa 21)
24. 🆕 Programa de fidelidade (Tarefa 22)
25. 🆕 Emissão de NFe (Tarefa 23)

---

## 📝 Observações Importantes

### ✅ O que já está PRONTO e funcionando:
- ✅ Recuperação de senha completa
- ✅ Refresh tokens no backend
- ✅ Estrutura de integração ERP (genérica)
- ✅ CSRF e webhooks configurados
- ✅ Status de pedidos (enum correto)
- ✅ Integração Uber Direct
- ✅ Pagar.me backend
- ✅ Dashboard com dados reais integrado
- ✅ Cálculo de frete funcionando
- ✅ Sistema de mensagens (base)
- ✅ Carrinho de compras (básico)
- ✅ Sistema de cupons (base)
- ✅ Avaliações de produtos
- ✅ Sistema de favoritos

### ⚠️ Correções de nomenclatura:
- ❌ Não use `PRONTO_PARA_RETIRADA` → ✅ Use `PRONTO`
- ❌ Não use `PREPARANDO_PEDIDO` → ✅ Use `PREPARANDO`

### 🚫 O que NÃO precisa fazer:
- ❌ Implementar recuperação de senha (já existe)
- ❌ Configurar SecurityConfig para webhooks (já está OK)
- ❌ Criar endpoint refresh-token (já existe)
- ❌ Criar estrutura básica de carrinho (já existe)
- ❌ Criar controller de mensagens (já existe)

### 🆕 O que é novo e precisa criar:
- 🆕 Cliente NavSoftApiClient específico
- 🆕 App Android completo
- 🆕 Tela "Modo Preparo"
- 🆕 Gatilho automático Uber
- 🆕 Sistema de notificações completo com templates
- 🆕 Gestão inteligente de estoque com alertas
- 🆕 Histórico auditável de pedidos
- 🆕 Cancelamento com estorno automático
- 🆕 Busca avançada com filtros
- 🆕 Chat em tempo real com WebSocket
- 🆕 Recuperação de carrinho abandonado
- 🆕 Dashboard administrativo avançado

### 🎯 Cobertura do Sistema:
- **Antes da atualização:** ~65% dos fluxos essenciais
- **Após esta lista:** ~95% dos fluxos para MVP completo
- **Faltam para 100%:** NFe (pode ser manual), Fidelidade (opcional)

---

## 🎯 Sugestão de Distribuição ATUALIZADA

### Sprint 1 (2 semanas) - Core Crítico:
- Dev 1: Histórico de pedidos + Gestão de estoque
- Dev 2: Mensagens de erro amigáveis + Tokenização Pagar.me

### Sprint 2 (2 semanas) - Experiência do Usuário:
- Dev 1: Cancelamento com estorno + Sistema de notificações
- Dev 2: Redesign dashboard lojista + Modo Preparo

### Sprint 3 (2 semanas) - Automação e Fluxos:
- Dev 1: Filtrar pedidos por pagamento + Workflow de status + Gatilho Uber
- Dev 2: Aplicação de cupons + Busca avançada

### Sprint 4 (2 semanas) - Retenção e Conversão:
- Dev 1: Dashboard administrativo avançado + Testes E2E
- Dev 2: Carrinho abandonado + Remember-me

### Sprint 5 (3 semanas) - Expansão:
- Dev 1: Integração NavSoft ERP + Chat backend (WebSocket)
- Dev 2: Chat frontend + Início do App Android

### Sprint 6 (3 semanas) - Melhorias Finais:
- Dev 1: Sistema de disputa avançado
- Dev 2: App Android rastreamento + Programa de fidelidade (opcional)

---

**Última Atualização:** 12/03/2026  
**Validado contra:** Código-fonte atual do WIN Marketplace  
**Status do Projeto:** Lista completa com 95% dos fluxos essenciais mapeados  
**Novas Tarefas Adicionadas:** 12 funcionalidades críticas identificadas e documentadas
