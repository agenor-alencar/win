-- ============================================
-- OTIMIZAÇÃO BANCO DE DADOS - FASE 1
-- Melhorias de Performance e Integridade
-- ============================================
-- IMPORTANTE: Execute em ambiente de TESTE primeiro!
-- Faça BACKUP antes de aplicar em produção!
-- ============================================

-- Habilitar extensão para busca full-text
CREATE EXTENSION IF NOT EXISTS pg_trgm;

BEGIN;

-- ============================================
-- PARTE 1: ÍNDICES DE PERFORMANCE
-- ============================================

-- 1.1 Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_lojista_status 
ON pedidos(lojista_id, status) 
WHERE status NOT IN ('CANCELADO', 'ENTREGUE');

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_status 
ON pedidos(usuario_id, status);

CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em_desc 
ON pedidos(criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_pedidos_status_criado 
ON pedidos(status, criado_em DESC);

-- 1.2 Índices para produtos
CREATE INDEX IF NOT EXISTS idx_produtos_lojista_ativo 
ON produtos(lojista_id, ativo) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_produtos_categoria_ativo 
ON produtos(categoria_id, ativo) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_produtos_criado_em_desc 
ON produtos(criado_em DESC) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_produtos_preco 
ON produtos(preco) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_produtos_estoque_baixo 
ON produtos(estoque) 
WHERE ativo = true AND estoque < 10;

-- 1.3 Índices para busca full-text em produtos
CREATE INDEX IF NOT EXISTS idx_produtos_nome_trgm 
ON produtos USING gin(nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_produtos_descricao_trgm 
ON produtos USING gin(descricao gin_trgm_ops);

-- 1.4 Índices para itens de pedido
CREATE INDEX IF NOT EXISTS idx_itens_pedidos_pedido 
ON itens_pedidos(pedido_id);

CREATE INDEX IF NOT EXISTS idx_itens_pedidos_produto 
ON itens_pedidos(produto_id);

CREATE INDEX IF NOT EXISTS idx_itens_pedidos_lojista 
ON itens_pedidos(lojista_id);

-- 1.5 Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida 
ON notificacoes(usuario_id, lida) 
WHERE lida = false;

CREATE INDEX IF NOT EXISTS idx_notificacoes_criado_desc 
ON notificacoes(criado_em DESC);

-- 1.6 Índices para avaliações
CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto_produto 
ON avaliacoes_produto(produto_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto_usuario 
ON avaliacoes_produto(usuario_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto_nota 
ON avaliacoes_produto(nota);

-- 1.7 Índices para cupons
CREATE INDEX IF NOT EXISTS idx_cupons_codigo 
ON cupons(codigo);

CREATE INDEX IF NOT EXISTS idx_cupons_ativo_validade 
ON cupons(ativo, data_inicio, data_fim) 
WHERE ativo = true;

-- 1.8 Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categorias_pai 
ON categorias(categoria_pai_id);

CREATE INDEX IF NOT EXISTS idx_categorias_ativo 
ON categorias(ativo) 
WHERE ativo = true;

-- 1.9 Índices para lojistas
CREATE INDEX IF NOT EXISTS idx_lojistas_status_aprovacao 
ON lojistas(status, status_aprovacao);

-- ============================================
-- PARTE 2: CONSTRAINTS DE VALIDAÇÃO
-- ============================================

-- 2.1 Constraints para produtos
DO $$ 
BEGIN
    -- Preço deve ser positivo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_produto_preco_positivo'
    ) THEN
        ALTER TABLE produtos 
        ADD CONSTRAINT chk_produto_preco_positivo 
        CHECK (preco > 0);
    END IF;

    -- Estoque não pode ser negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_produto_estoque_nao_negativo'
    ) THEN
        ALTER TABLE produtos 
        ADD CONSTRAINT chk_produto_estoque_nao_negativo 
        CHECK (estoque >= 0);
    END IF;

    -- Peso não pode ser negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_produto_peso_nao_negativo'
    ) THEN
        ALTER TABLE produtos 
        ADD CONSTRAINT chk_produto_peso_nao_negativo 
        CHECK (peso IS NULL OR peso >= 0);
    END IF;

    -- Dimensões devem ser positivas
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_produto_dimensoes_positivas'
    ) THEN
        ALTER TABLE produtos 
        ADD CONSTRAINT chk_produto_dimensoes_positivas 
        CHECK (
            (largura IS NULL OR largura > 0) AND
            (altura IS NULL OR altura > 0) AND
            (profundidade IS NULL OR profundidade > 0)
        );
    END IF;
END $$;

-- 2.2 Constraints para pedidos
DO $$ 
BEGIN
    -- Status válidos
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_pedido_status_valido'
    ) THEN
        ALTER TABLE pedidos 
        ADD CONSTRAINT chk_pedido_status_valido 
        CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO'));
    END IF;

    -- Valores devem ser positivos ou zero
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_pedido_valores_nao_negativos'
    ) THEN
        ALTER TABLE pedidos 
        ADD CONSTRAINT chk_pedido_valores_nao_negativos 
        CHECK (
            subtotal >= 0 AND
            desconto >= 0 AND
            frete >= 0 AND
            total >= 0
        );
    END IF;
END $$;

-- 2.3 Constraints para itens de pedido
DO $$ 
BEGIN
    -- Quantidade deve ser positiva
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_item_pedido_quantidade_positiva'
    ) THEN
        ALTER TABLE itens_pedidos 
        ADD CONSTRAINT chk_item_pedido_quantidade_positiva 
        CHECK (quantidade > 0);
    END IF;

    -- Preço deve ser positivo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_item_pedido_preco_positivo'
    ) THEN
        ALTER TABLE itens_pedidos 
        ADD CONSTRAINT chk_item_pedido_preco_positivo 
        CHECK (preco_unitario > 0);
    END IF;

    -- Subtotal deve ser positivo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_item_pedido_subtotal_positivo'
    ) THEN
        ALTER TABLE itens_pedidos 
        ADD CONSTRAINT chk_item_pedido_subtotal_positivo 
        CHECK (subtotal > 0);
    END IF;
END $$;

-- 2.4 Constraints para cupons
DO $$ 
BEGIN
    -- Data fim >= data início
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_cupom_datas_validas'
    ) THEN
        ALTER TABLE cupons 
        ADD CONSTRAINT chk_cupom_datas_validas 
        CHECK (data_fim >= data_inicio);
    END IF;

    -- Desconto entre 0 e 100
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_cupom_desconto_valido'
    ) THEN
        ALTER TABLE cupons 
        ADD CONSTRAINT chk_cupom_desconto_valido 
        CHECK (desconto > 0 AND desconto <= 100);
    END IF;

    -- Valor mínimo não negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_cupom_valor_minimo_valido'
    ) THEN
        ALTER TABLE cupons 
        ADD CONSTRAINT chk_cupom_valor_minimo_valido 
        CHECK (valor_minimo IS NULL OR valor_minimo >= 0);
    END IF;
END $$;

-- 2.5 Constraints para avaliações
DO $$ 
BEGIN
    -- Nota entre 1 e 5
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_avaliacao_nota_valida'
    ) THEN
        ALTER TABLE avaliacoes_produto 
        ADD CONSTRAINT chk_avaliacao_nota_valida 
        CHECK (nota >= 1 AND nota <= 5);
    END IF;
END $$;

-- 2.6 Constraints para lojistas
DO $$ 
BEGIN
    -- Comissão entre 0 e 100
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_lojista_comissao_valida'
    ) THEN
        ALTER TABLE lojistas 
        ADD CONSTRAINT chk_lojista_comissao_valida 
        CHECK (comissao >= 0 AND comissao <= 100);
    END IF;
END $$;

-- ============================================
-- PARTE 3: CAMPOS DE AUDITORIA
-- ============================================

-- 3.1 Adicionar atualizado_em onde falta
ALTER TABLE avaliacoes_produto 
ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE cupons 
ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3.2 Criar função para atualizar automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.3 Criar triggers para atualização automática
DROP TRIGGER IF EXISTS trigger_avaliacoes_produto_atualizado ON avaliacoes_produto;
CREATE TRIGGER trigger_avaliacoes_produto_atualizado
BEFORE UPDATE ON avaliacoes_produto
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_cupons_atualizado ON cupons;
CREATE TRIGGER trigger_cupons_atualizado
BEFORE UPDATE ON cupons
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

-- ============================================
-- PARTE 4: VIEWS ÚTEIS PARA PERFORMANCE
-- ============================================

-- 4.1 View para produtos com baixo estoque
CREATE OR REPLACE VIEW v_produtos_estoque_baixo AS
SELECT 
    p.id,
    p.nome,
    p.estoque,
    p.estoque_minimo,
    l.nome_fantasia as lojista,
    l.email as lojista_email
FROM produtos p
INNER JOIN lojistas l ON p.lojista_id = l.id
WHERE p.ativo = true 
AND p.estoque < COALESCE(p.estoque_minimo, 10);

-- 4.2 View para pedidos recentes por lojista
CREATE OR REPLACE VIEW v_pedidos_recentes_lojista AS
SELECT DISTINCT
    p.id as pedido_id,
    p.numero_pedido,
    p.status,
    p.total,
    p.criado_em,
    ip.lojista_id,
    l.nome_fantasia as lojista,
    u.nome as cliente,
    u.email as cliente_email
FROM pedidos p
INNER JOIN itens_pedidos ip ON p.id = ip.pedido_id
INNER JOIN lojistas l ON ip.lojista_id = l.id
INNER JOIN usuarios u ON p.usuario_id = u.id
WHERE p.criado_em >= NOW() - INTERVAL '30 days'
ORDER BY p.criado_em DESC;

-- 4.3 View para estatísticas de produtos
CREATE OR REPLACE VIEW v_produtos_estatisticas AS
SELECT 
    p.id,
    p.nome,
    p.preco,
    p.estoque,
    COALESCE(AVG(ap.nota), 0) as avaliacao_media,
    COUNT(DISTINCT ap.id) as total_avaliacoes,
    COUNT(DISTINCT ip.id) as total_vendas,
    COALESCE(SUM(ip.quantidade), 0) as quantidade_vendida,
    COALESCE(SUM(ip.subtotal), 0) as receita_total
FROM produtos p
LEFT JOIN avaliacoes_produto ap ON p.id = ap.produto_id
LEFT JOIN itens_pedidos ip ON p.id = ip.produto_id
WHERE p.ativo = true
GROUP BY p.id, p.nome, p.preco, p.estoque;

-- ============================================
-- COMMIT
-- ============================================

-- Se tudo correu bem até aqui, faça commit
COMMIT;

-- ============================================
-- VALIDAÇÃO PÓS-EXECUÇÃO
-- ============================================

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('produtos', 'pedidos', 'itens_pedidos', 'notificacoes')
ORDER BY tablename, indexname;

-- Verificar constraints criadas
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_name LIKE 'chk_%'
ORDER BY tc.table_name, tc.constraint_name;

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verificar views
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'v_%'
ORDER BY table_name;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
