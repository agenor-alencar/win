-- ============================================
-- Migration 004 (Fix): Adicionar suporte a DigitalOcean Spaces
-- ============================================
-- Versão corrigida que verifica todas as condições antes de alterar
-- Data: 03/01/2026
-- ============================================

BEGIN;

-- 1. Adicionar novas colunas (somente se não existirem)
DO $$ 
BEGIN
    -- url_thumbnail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='url_thumbnail') THEN
        ALTER TABLE imagem_produto ADD COLUMN url_thumbnail VARCHAR(500);
    END IF;
    
    -- url_medium
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='url_medium') THEN
        ALTER TABLE imagem_produto ADD COLUMN url_medium VARCHAR(500);
    END IF;
    
    -- tamanho_bytes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='tamanho_bytes') THEN
        ALTER TABLE imagem_produto ADD COLUMN tamanho_bytes BIGINT;
    END IF;
    
    -- tamanho_thumbnail_bytes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='tamanho_thumbnail_bytes') THEN
        ALTER TABLE imagem_produto ADD COLUMN tamanho_thumbnail_bytes BIGINT;
    END IF;
    
    -- tamanho_medium_bytes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='tamanho_medium_bytes') THEN
        ALTER TABLE imagem_produto ADD COLUMN tamanho_medium_bytes BIGINT;
    END IF;
    
    -- tipo_conteudo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='tipo_conteudo') THEN
        ALTER TABLE imagem_produto ADD COLUMN tipo_conteudo VARCHAR(100);
    END IF;
    
    -- texto_alternativo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='imagem_produto' AND column_name='texto_alternativo') THEN
        ALTER TABLE imagem_produto ADD COLUMN texto_alternativo VARCHAR(200);
    END IF;
    
    RAISE NOTICE '✅ Colunas verificadas/adicionadas';
END $$;

-- 2. Renomear coluna 'ordem' para 'ordem_exibicao' (se necessário)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' AND column_name='ordem')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='imagem_produto' AND column_name='ordem_exibicao') THEN
        ALTER TABLE imagem_produto RENAME COLUMN ordem TO ordem_exibicao;
        RAISE NOTICE '✅ Coluna "ordem" renomeada para "ordem_exibicao"';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='imagem_produto' AND column_name='ordem_exibicao') THEN
        RAISE NOTICE '⚠️  Coluna "ordem_exibicao" já existe, nenhuma alteração necessária';
    END IF;
END $$;

-- 3. Remover colunas obsoletas (se existirem)
DO $$ 
BEGIN
    -- Remover coluna 'principal'
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' AND column_name='principal') THEN
        ALTER TABLE imagem_produto DROP COLUMN principal;
        RAISE NOTICE '✅ Coluna "principal" removida';
    END IF;
    
    -- Remover coluna 'nome_arquivo'
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' AND column_name='nome_arquivo') THEN
        ALTER TABLE imagem_produto DROP COLUMN nome_arquivo;
        RAISE NOTICE '✅ Coluna "nome_arquivo" removida';
    END IF;
END $$;

-- 4. Garantir que criado_em seja TIMESTAMP WITH TIME ZONE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' 
               AND column_name='criado_em' 
               AND data_type='timestamp without time zone') THEN
        ALTER TABLE imagem_produto 
            ALTER COLUMN criado_em TYPE TIMESTAMP WITH TIME ZONE 
            USING criado_em AT TIME ZONE 'UTC';
        RAISE NOTICE '✅ Coluna "criado_em" convertida para TIMESTAMP WITH TIME ZONE';
    END IF;
END $$;

-- 5. Criar índice (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE indexname='idx_imagem_produto_ordem') THEN
        CREATE INDEX idx_imagem_produto_ordem 
            ON imagem_produto(produto_id, ordem_exibicao);
        RAISE NOTICE '✅ Índice "idx_imagem_produto_ordem" criado';
    ELSE
        RAISE NOTICE '⚠️  Índice "idx_imagem_produto_ordem" já existe';
    END IF;
END $$;

-- 6. Adicionar comentários nas colunas
DO $$
BEGIN
    EXECUTE 'COMMENT ON COLUMN imagem_produto.url IS ''URL da imagem original no DigitalOcean Spaces''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.url_thumbnail IS ''URL da versão thumbnail (300x300)''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.url_medium IS ''URL da versão média (800x800)''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.tamanho_bytes IS ''Tamanho da imagem original em bytes''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.tamanho_thumbnail_bytes IS ''Tamanho do thumbnail em bytes''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.tamanho_medium_bytes IS ''Tamanho da versão média em bytes''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.tipo_conteudo IS ''MIME type (image/jpeg, image/png, etc)''';
    EXECUTE 'COMMENT ON COLUMN imagem_produto.texto_alternativo IS ''Texto alternativo para acessibilidade (alt)''';
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='imagem_produto' AND column_name='ordem_exibicao') THEN
        EXECUTE 'COMMENT ON COLUMN imagem_produto.ordem_exibicao IS ''Ordem de exibição (0 = principal)''';
    END IF;
    
    RAISE NOTICE '✅ Comentários adicionados';
END $$;

COMMIT;

-- ============================================
-- Verificação Final
-- ============================================
DO $$
DECLARE
    coluna_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO coluna_count
    FROM information_schema.columns 
    WHERE table_name='imagem_produto' 
    AND column_name IN (
        'url_thumbnail', 
        'url_medium', 
        'tamanho_bytes', 
        'tamanho_thumbnail_bytes', 
        'tamanho_medium_bytes', 
        'tipo_conteudo', 
        'texto_alternativo'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🚀 Migration 004 CONCLUÍDA!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Status: % de 7 colunas necessárias presentes', coluna_count;
    
    IF coluna_count = 7 THEN
        RAISE NOTICE '✅ Banco 100%% pronto para DigitalOcean Spaces!';
    ELSE
        RAISE NOTICE '⚠️  Algumas colunas podem estar faltando';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;
