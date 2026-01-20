-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE - ÍNDICES
-- =====================================================
-- Data: 20 de Janeiro de 2026
-- Objetivo: Reduzir consumo de CPU otimizando queries
-- =====================================================

-- ÍNDICES PARA TABELA PEDIDOS
-- Muito usada em dashboards e relatórios
CREATE INDEX IF NOT EXISTS idx_pedido_criado_em ON pedidos(criado_em);
CREATE INDEX IF NOT EXISTS idx_pedido_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedido_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_motorista_id ON pedidos(motorista_id);
CREATE INDEX IF NOT EXISTS idx_pedido_numero ON pedidos(numero_pedido);

-- Índice composto para queries de dashboard (status + data)
CREATE INDEX IF NOT EXISTS idx_pedido_status_criado ON pedidos(status, criado_em DESC);

-- ÍNDICES PARA TABELA PRODUTOS
CREATE INDEX IF NOT EXISTS idx_produto_lojista_id ON produtos(lojista_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria_id ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produto_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produto_criado_em ON produtos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_produto_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produto_erp_sku ON produtos(erp_sku);

-- Índice composto para listagem de produtos ativos
CREATE INDEX IF NOT EXISTS idx_produto_ativo_lojista ON produtos(ativo, lojista_id, criado_em DESC);

-- Índice composto para busca de produtos por nome
CREATE INDEX IF NOT EXISTS idx_produto_nome_ativo ON produtos(nome, ativo);

-- ÍNDICES PARA TABELA ITENS_PEDIDOS
-- Usada em relatórios e estatísticas
CREATE INDEX IF NOT EXISTS idx_item_pedido_pedido_id ON itens_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_item_pedido_produto_id ON itens_pedidos(produto_id);
CREATE INDEX IF NOT EXISTS idx_item_pedido_lojista_id ON itens_pedidos(lojista_id);

-- ÍNDICES PARA TABELA USUARIOS
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuario_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuario_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_criado_em ON usuarios(criado_em);

-- ÍNDICES PARA TABELA LOJISTAS
CREATE INDEX IF NOT EXISTS idx_lojista_usuario_id ON lojistas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lojista_ativo ON lojistas(ativo);
CREATE INDEX IF NOT EXISTS idx_lojista_cnpj ON lojistas(cnpj);

-- ÍNDICES PARA TABELA CATEGORIAS
CREATE INDEX IF NOT EXISTS idx_categoria_pai_id ON categorias(categoria_pai_id);
CREATE INDEX IF NOT EXISTS idx_categoria_nome ON categorias(nome);

-- ÍNDICES PARA TABELA ENTREGAS
CREATE INDEX IF NOT EXISTS idx_entrega_pedido_id ON entregas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_entrega_status ON entregas(status_entrega);
CREATE INDEX IF NOT EXISTS idx_entrega_criado_em ON entregas(criado_em);

-- ÍNDICES PARA TABELA AVALIACOES_PRODUTO
CREATE INDEX IF NOT EXISTS idx_avaliacao_produto_id ON avaliacoes_produto(produto_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_usuario_id ON avaliacoes_produto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_criado_em ON avaliacoes_produto(criado_em DESC);

-- ÍNDICES PARA TABELA NOTIFICACOES
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacao_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacao_criado_em ON notificacoes(criado_em DESC);

-- ÍNDICES PARA TABELA BANNERS
CREATE INDEX IF NOT EXISTS idx_banner_ativo ON banners(ativo);
CREATE INDEX IF NOT EXISTS idx_banner_posicao ON banners(posicao);
CREATE INDEX IF NOT EXISTS idx_banner_data_inicio ON banners(data_inicio);
CREATE INDEX IF NOT EXISTS idx_banner_data_fim ON banners(data_fim);

-- =====================================================
-- ANÁLISE DAS TABELAS PARA ATUALIZAR ESTATÍSTICAS
-- =====================================================
-- Executar após criar os índices para otimizar o planner

ANALYZE pedidos;
ANALYZE produtos;
ANALYZE itens_pedidos;
ANALYZE usuarios;
ANALYZE lojistas;
ANALYZE categorias;
ANALYZE entregas;
ANALYZE avaliacoes_produto;
ANALYZE notificacoes;
ANALYZE banners;

-- =====================================================
-- VERIFICAR ÍNDICES CRIADOS
-- =====================================================
-- Execute esta query para verificar os índices criados:
-- SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
