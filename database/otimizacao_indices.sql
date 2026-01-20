-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE - ÍNDICES
-- =====================================================
-- Data: 20 de Janeiro de 2026
-- Objetivo: Reduzir consumo de CPU otimizando queries
-- =====================================================

-- ÍNDICES PARA TABELA PEDIDOS
-- Muito usada em dashboards e relatórios
CREATE INDEX IF NOT EXISTS idx_pedido_criado_em ON pedido(criado_em);
CREATE INDEX IF NOT EXISTS idx_pedido_status ON pedido(status);
CREATE INDEX IF NOT EXISTS idx_pedido_usuario_id ON pedido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_motorista_id ON pedido(motorista_id);
CREATE INDEX IF NOT EXISTS idx_pedido_numero ON pedido(numero_pedido);

-- Índice composto para queries de dashboard (status + data)
CREATE INDEX IF NOT EXISTS idx_pedido_status_criado ON pedido(status, criado_em DESC);

-- ÍNDICES PARA TABELA PRODUTOS
CREATE INDEX IF NOT EXISTS idx_produto_lojista_id ON produto(lojista_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria_id ON produto(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produto_ativo ON produto(ativo);
CREATE INDEX IF NOT EXISTS idx_produto_criado_em ON produto(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_produto_nome ON produto(nome);
CREATE INDEX IF NOT EXISTS idx_produto_erp_sku ON produto(erp_sku);

-- Índice composto para listagem de produtos ativos
CREATE INDEX IF NOT EXISTS idx_produto_ativo_lojista ON produto(ativo, lojista_id, criado_em DESC);

-- Índice composto para busca de produtos por nome
CREATE INDEX IF NOT EXISTS idx_produto_nome_ativo ON produto(nome, ativo);

-- ÍNDICES PARA TABELA ITEM_PEDIDO
-- Usada em relatórios e estatísticas
CREATE INDEX IF NOT EXISTS idx_item_pedido_pedido_id ON item_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_item_pedido_produto_id ON item_pedido(produto_id);
CREATE INDEX IF NOT EXISTS idx_item_pedido_lojista_id ON item_pedido(lojista_id);

-- ÍNDICES PARA TABELA USUARIOS
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_cpf ON usuario(cpf);
CREATE INDEX IF NOT EXISTS idx_usuario_ativo ON usuario(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_criado_em ON usuario(criado_em);

-- ÍNDICES PARA TABELA LOJISTA
CREATE INDEX IF NOT EXISTS idx_lojista_usuario_id ON lojista(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lojista_ativo ON lojista(ativo);
CREATE INDEX IF NOT EXISTS idx_lojista_cnpj ON lojista(cnpj);

-- ÍNDICES PARA TABELA CATEGORIA
CREATE INDEX IF NOT EXISTS idx_categoria_pai_id ON categoria(categoria_pai_id);
CREATE INDEX IF NOT EXISTS idx_categoria_nome ON categoria(nome);

-- ÍNDICES PARA TABELA ENTREGA
CREATE INDEX IF NOT EXISTS idx_entrega_pedido_id ON entrega(pedido_id);
CREATE INDEX IF NOT EXISTS idx_entrega_status ON entrega(status_entrega);
CREATE INDEX IF NOT EXISTS idx_entrega_criado_em ON entrega(criado_em);

-- ÍNDICES PARA TABELA AVALIACAO_PRODUTO
CREATE INDEX IF NOT EXISTS idx_avaliacao_produto_id ON avaliacao_produto(produto_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_usuario_id ON avaliacao_produto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_criado_em ON avaliacao_produto(criado_em DESC);

-- ÍNDICES PARA TABELA NOTIFICACAO
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario_id ON notificacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacao_lida ON notificacao(lida);
CREATE INDEX IF NOT EXISTS idx_notificacao_criado_em ON notificacao(criado_em DESC);

-- ÍNDICES PARA TABELA BANNER
CREATE INDEX IF NOT EXISTS idx_banner_ativo ON banner(ativo);
CREATE INDEX IF NOT EXISTS idx_banner_posicao ON banner(posicao);
CREATE INDEX IF NOT EXISTS idx_banner_data_inicio ON banner(data_inicio);
CREATE INDEX IF NOT EXISTS idx_banner_data_fim ON banner(data_fim);

-- =====================================================
-- ANÁLISE DAS TABELAS PARA ATUALIZAR ESTATÍSTICAS
-- =====================================================
-- Executar após criar os índices para otimizar o planner

ANALYZE pedido;
ANALYZE produto;
ANALYZE item_pedido;
ANALYZE usuario;
ANALYZE lojista;
ANALYZE categoria;
ANALYZE entrega;
ANALYZE avaliacao_produto;
ANALYZE notificacao;
ANALYZE banner;

-- =====================================================
-- VERIFICAR ÍNDICES CRIADOS
-- =====================================================
-- Execute esta query para verificar os índices criados:
-- SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
