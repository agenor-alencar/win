-- Adicionar colunas de geolocalização na tabela lojistas
-- Script seguro que não falha se as colunas já existirem

DO $$ 
BEGIN
    -- Adicionar coluna latitude se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lojistas' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE lojistas ADD COLUMN latitude DOUBLE PRECISION;
        RAISE NOTICE 'Coluna latitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna latitude já existe';
    END IF;

    -- Adicionar coluna longitude se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lojistas' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE lojistas ADD COLUMN longitude DOUBLE PRECISION;
        RAISE NOTICE 'Coluna longitude adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna longitude já existe';
    END IF;
END $$;

-- Criar índice para consultas geográficas
CREATE INDEX IF NOT EXISTS idx_lojistas_coordinates 
ON lojistas(latitude, longitude);

-- Comentários das colunas
COMMENT ON COLUMN lojistas.latitude IS 'Latitude da localização do lojista (opcional, autocálculo via geocodificação)';
COMMENT ON COLUMN lojistas.longitude IS 'Longitude da localização do lojista (opcional, autocálculo via geocodificação)';

SELECT 'Script executado com sucesso! Colunas de geolocalização adicionadas à tabela lojistas.' as resultado;
