-- ============================================================================
-- MIGRAÇÃO 002: Consolidar Sistema de Avaliações
-- ============================================================================
-- Data: 2025-11-27
-- Descrição: Consolida tabelas de avaliações duplicadas (avaliacoes, 
--            avaliacoes_produto, avaliacoes_produtos) em uma única tabela
--            'avaliacoes_produto' com estrutura otimizada
-- Impacto: MÉDIO - Migração de dados entre tabelas
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Verificar Estado Atual
-- ============================================================================

SELECT 'VERIFICAÇÃO: Contagem de registros nas tabelas de avaliações' AS etapa;

SELECT 
    (SELECT COUNT(*) FROM avaliacoes) as avaliacoes_count,
    (SELECT COUNT(*) FROM avaliacoes_produto) as avaliacoes_produto_count,
    (SELECT COUNT(*) FROM avaliacoes_produtos) as avaliacoes_produtos_count;

-- ============================================================================
-- PASSO 2: Criar Índices na Tabela Destino (se não existirem)
-- ============================================================================

SELECT 'OTIMIZAÇÃO: Garantindo índices na tabela avaliacoes_produto' AS etapa;

CREATE INDEX IF NOT EXISTS idx_avaliacao_produto ON avaliacoes_produto(produto_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_usuario ON avaliacoes_produto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_criado_em ON avaliacoes_produto(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacao_nota ON avaliacoes_produto(nota);

-- ============================================================================
-- PASSO 3: Migrar Dados da Tabela 'avaliacoes' para 'avaliacoes_produto'
-- ============================================================================

SELECT 'MIGRAÇÃO: Movendo dados de avaliacoes para avaliacoes_produto' AS etapa;

INSERT INTO avaliacoes_produto (id, produto_id, usuario_id, nota, comentario, criado_em, atualizado_em)
SELECT 
    a.id,
    a.produto_id,
    a.usuario_id,
    a.nota,
    a.comentario,
    a.criado_em,
    COALESCE(a.criado_em, NOW()) as atualizado_em
FROM avaliacoes a
WHERE a.produto_id IS NOT NULL  -- Apenas avaliações de produtos
AND NOT EXISTS (
    SELECT 1 FROM avaliacoes_produto ap 
    WHERE ap.id = a.id OR (ap.produto_id = a.produto_id AND ap.usuario_id = a.usuario_id)
)
ON CONFLICT (id) DO NOTHING;

-- Contagem de registros migrados
SELECT COUNT(*) as registros_migrados
FROM avaliacoes a
WHERE a.produto_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM avaliacoes_produto ap WHERE ap.id = a.id
);

-- ============================================================================
-- PASSO 4: Migrar Dados da Tabela 'avaliacoes_produtos' para 'avaliacoes_produto'
-- ============================================================================

SELECT 'MIGRAÇÃO: Movendo dados de avaliacoes_produtos para avaliacoes_produto' AS etapa;

INSERT INTO avaliacoes_produto (id, produto_id, usuario_id, nota, comentario, criado_em, atualizado_em)
SELECT 
    ap.id,
    ap.produto_id,
    ap.usuario_id,
    ap.nota,
    ap.comentario,
    ap.criado_em,
    COALESCE(ap.atualizado_em, ap.criado_em, NOW()) as atualizado_em
FROM avaliacoes_produtos ap
WHERE NOT EXISTS (
    SELECT 1 FROM avaliacoes_produto aprod 
    WHERE aprod.id = ap.id OR (aprod.produto_id = ap.produto_id AND aprod.usuario_id = ap.usuario_id)
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PASSO 5: Verificar Integridade dos Dados Migrados
-- ============================================================================

SELECT 'VERIFICAÇÃO: Comparando totais após migração' AS etapa;

SELECT 
    'avaliacoes_produto' as tabela,
    COUNT(*) as total
FROM avaliacoes_produto
UNION ALL
SELECT 
    'avaliacoes (original)' as tabela,
    COUNT(*) as total
FROM avaliacoes WHERE produto_id IS NOT NULL
UNION ALL
SELECT 
    'avaliacoes_produtos (original)' as tabela,
    COUNT(*) as total
FROM avaliacoes_produtos;

-- ============================================================================
-- PASSO 6: Remover Tabelas Antigas
-- ============================================================================

SELECT 'LIMPEZA: Removendo tabelas redundantes' AS etapa;

-- Remover constraints e foreign keys se existirem
ALTER TABLE IF EXISTS avaliacoes 
DROP CONSTRAINT IF EXISTS avaliacoes_produto_id_fkey CASCADE;

ALTER TABLE IF EXISTS avaliacoes 
DROP CONSTRAINT IF EXISTS avaliacoes_usuario_id_fkey CASCADE;

ALTER TABLE IF EXISTS avaliacoes_produtos 
DROP CONSTRAINT IF EXISTS avaliacoes_produtos_produto_id_fkey CASCADE;

ALTER TABLE IF EXISTS avaliacoes_produtos 
DROP CONSTRAINT IF EXISTS avaliacoes_produtos_usuario_id_fkey CASCADE;

-- Dropar as tabelas
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS avaliacoes_produtos CASCADE;

-- ============================================================================
-- PASSO 7: Verificação Final
-- ============================================================================

SELECT 'VERIFICAÇÃO FINAL: Tabelas removidas' AS etapa;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('avaliacoes', 'avaliacoes_produtos') THEN '❌ DEVE SER REMOVIDA'
        WHEN table_name = 'avaliacoes_produto' THEN '✅ MANTIDA'
        ELSE 'Outra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'avalia%'
ORDER BY table_name;

SELECT 'VERIFICAÇÃO FINAL: Total de avaliações na tabela consolidada' AS etapa;
SELECT COUNT(*) as total_avaliacoes FROM avaliacoes_produto;

-- ============================================================================
-- FINALIZAR TRANSAÇÃO
-- ============================================================================

-- Aplicar as mudanças permanentemente
COMMIT;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- Este script está configurado para COMMIT automático.
-- Se quiser apenas testar, troque COMMIT por ROLLBACK acima.
-- 
-- IMPORTANTE: Após executar este script:
-- 1. Atualizar o código Java para usar apenas AvaliacaoProduto
-- 2. Mover as entidades antigas para _deprecated/
-- 3. Rebuild da aplicação
-- ============================================================================
