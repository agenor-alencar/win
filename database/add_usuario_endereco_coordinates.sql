-- Adicionar colunas de geolocalização nas tabelas usuarios e enderecos
-- Script seguro que não falha se as colunas já existirem
-- Necessário para integração completa com Uber Direct API

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

-- ==================================================
-- ÍNDICES PARA CONSULTAS GEOGRÁFICAS
-- ==================================================

-- Índice para coordenadas de usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_coordinates 
ON usuarios(latitude, longitude);

-- Índice para coordenadas de endereços
CREATE INDEX IF NOT EXISTS idx_enderecos_coordinates 
ON enderecos(latitude, longitude);

-- Índice composto para buscar endereços principais com coordenadas
CREATE INDEX IF NOT EXISTS idx_enderecos_principal_coords 
ON enderecos(usuario_id, principal, latitude, longitude) 
WHERE ativo = true AND principal = true;

-- ==================================================
-- COMENTÁRIOS DAS COLUNAS
-- ==================================================

COMMENT ON COLUMN usuarios.latitude IS 'Latitude da localização principal do usuário (opcional, auto-geocodificado)';
COMMENT ON COLUMN usuarios.longitude IS 'Longitude da localização principal do usuário (opcional, auto-geocodificado)';

COMMENT ON COLUMN enderecos.latitude IS 'Latitude da localização do endereço (opcional, auto-geocodificado)';
COMMENT ON COLUMN enderecos.longitude IS 'Longitude da localização do endereço (opcional, auto-geocodificado)';

-- ==================================================
-- ESTATÍSTICAS E VERIFICAÇÃO
-- ==================================================

-- Verificar estrutura criada
SELECT 
    'usuarios' as tabela,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL) as com_coordenadas,
    COUNT(*) as total,
    ROUND(COUNT(*) FILTER (WHERE latitude IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM usuarios
UNION ALL
SELECT 
    'enderecos' as tabela,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL) as com_coordenadas,
    COUNT(*) as total,
    ROUND(COUNT(*) FILTER (WHERE latitude IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as percentual
FROM enderecos;

SELECT '🎉 Script executado com sucesso! Colunas de geolocalização adicionadas.' as resultado;
