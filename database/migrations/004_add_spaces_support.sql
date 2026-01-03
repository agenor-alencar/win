-- ============================================
-- Migration 004: Adicionar suporte a DigitalOcean Spaces
-- ============================================
-- 
-- Adiciona colunas para armazenamento de múltiplas versões de imagens
-- (original, thumbnail, medium) e metadados de upload
--
-- Data: 29/12/2025
-- ============================================

BEGIN;

-- Adicionar novas colunas à tabela imagem_produto
ALTER TABLE imagem_produto
    ADD COLUMN IF NOT EXISTS url_thumbnail VARCHAR(500),
    ADD COLUMN IF NOT EXISTS url_medium VARCHAR(500),
    ADD COLUMN IF NOT EXISTS tamanho_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS tamanho_thumbnail_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS tamanho_medium_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS tipo_conteudo VARCHAR(100),
    ADD COLUMN IF NOT EXISTS texto_alternativo VARCHAR(200);

-- Renomear coluna 'ordem' para 'ordem_exibicao' (se existir E ordem_exibicao não existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' AND column_name='ordem')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='imagem_produto' AND column_name='ordem_exibicao') THEN
        ALTER TABLE imagem_produto RENAME COLUMN ordem TO ordem_exibicao;
    END IF;
END $$;

-- Remover coluna 'principal' (agora usa ordem_exibicao = 0)
ALTER TABLE imagem_produto DROP COLUMN IF EXISTS principal;

-- Remover coluna 'nome_arquivo' (agora o nome está na URL)
ALTER TABLE imagem_produto DROP COLUMN IF EXISTS nome_arquivo;

-- Alterar coluna criado_em para usar OffsetDateTime (se necessário)
DO $$ 
BEGIN
    -- Verifica se a coluna existe como TIMESTAMP e converte para TIMESTAMP WITH TIME ZONE
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' 
               AND column_name='criado_em' 
               AND data_type='timestamp without time zone') THEN
        ALTER TABLE imagem_produto 
            ALTER COLUMN criado_em TYPE TIMESTAMP WITH TIME ZONE 
            USING criado_em AT TIME ZONE 'UTC';
    END IF;
END $$;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_imagem_produto_ordem 
    ON imagem_produto(produto_id, ordem_exibicao);

-- Comentários nas colunas
COMMENT ON COLUMN imagem_produto.url IS 'URL da imagem original no DigitalOcean Spaces';
COMMENT ON COLUMN imagem_produto.url_thumbnail IS 'URL da versão thumbnail (300x300)';
COMMENT ON COLUMN imagem_produto.url_medium IS 'URL da versão média (800x800)';
COMMENT ON COLUMN imagem_produto.tamanho_bytes IS 'Tamanho da imagem original em bytes';
COMMENT ON COLUMN imagem_produto.tamanho_thumbnail_bytes IS 'Tamanho do thumbnail em bytes';
COMMENT ON COLUMN imagem_produto.tamanho_medium_bytes IS 'Tamanho da versão média em bytes';
COMMENT ON COLUMN imagem_produto.tipo_conteudo IS 'MIME type (image/jpeg, image/png, etc)';
COMMENT ON COLUMN imagem_produto.texto_alternativo IS 'Texto alternativo para acessibilidade (alt)';
COMMENT ON COLUMN imagem_produto.ordem_exibicao IS 'Ordem de exibição (0 = principal)';

COMMIT;

-- ============================================
-- Verificação
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 004 aplicada com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE 'Novas colunas adicionadas:';
    RAISE NOTICE '  - url_thumbnail';
    RAISE NOTICE '  - url_medium';
    RAISE NOTICE '  - tamanho_bytes';
    RAISE NOTICE '  - tamanho_thumbnail_bytes';
    RAISE NOTICE '  - tamanho_medium_bytes';
    RAISE NOTICE '  - tipo_conteudo';
    RAISE NOTICE '  - texto_alternativo';
    RAISE NOTICE '';
    RAISE NOTICE 'Colunas removidas:';
    RAISE NOTICE '  - principal (use ordem_exibicao = 0)';
    RAISE NOTICE '  - nome_arquivo (nome está na URL)';
    RAISE NOTICE '';
    RAISE NOTICE 'Pronto para usar DigitalOcean Spaces! 🚀';
END $$;
