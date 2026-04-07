-- Adicionar colunas de geolocalização nas tabelas usuarios e enderecos
-- Flyway migration para garantir execução após init.sql

-- ==================================================
-- TABELA USUARIOS
-- ==================================================
DO $$ 
BEGIN
    -- Adicionar coluna latitude na tabela usuarios
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN latitude DOUBLE PRECISION;
        RAISE NOTICE '✅ Coluna usuarios.latitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna usuarios.latitude já existe';
    END IF;

    -- Adicionar coluna longitude na tabela usuarios
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN longitude DOUBLE PRECISION;
        RAISE NOTICE '✅ Coluna usuarios.longitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna usuarios.longitude já existe';
    END IF;
END $$;

-- ==================================================
-- TABELA ENDERECOS
-- ==================================================
DO $$ 
BEGIN
    -- Adicionar coluna latitude na tabela enderecos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enderecos' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE enderecos ADD COLUMN latitude DOUBLE PRECISION;
        RAISE NOTICE '✅ Coluna enderecos.latitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna enderecos.latitude já existe';
    END IF;

    -- Adicionar coluna longitude na tabela enderecos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enderecos' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE enderecos ADD COLUMN longitude DOUBLE PRECISION;
        RAISE NOTICE '✅ Coluna enderecos.longitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna enderecos.longitude já existe';
    END IF;
END $$;
