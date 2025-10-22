-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Comentário
COMMENT ON DATABASE win_marketplace IS 'Banco de dados do Win Marketplace - Criado automaticamente';

-- Grant de permissões
GRANT ALL PRIVILEGES ON DATABASE win_marketplace TO postgres;

-- ============================================
-- CRIAR TABELA DE PERFIS
-- ============================================

CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_perfis_nome ON perfis(nome);
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);

-- ============================================
-- POPULAR PERFIS PADRÃO DO SISTEMA
-- ============================================

INSERT INTO perfis (nome, descricao, ativo, criado_em, atualizado_em) VALUES
    ('USER', 'Usuário comum do sistema - pode comprar produtos', true, NOW(), NOW()),
    ('LOJISTA', 'Lojista - pode vender produtos e gerenciar sua loja', true, NOW(), NOW()),
    ('MOTORISTA', 'Motorista - responsável por entregas', true, NOW(), NOW()),
    ('ADMIN', 'Administrador do sistema - acesso total', true, NOW(), NOW())
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- LOG DE CRIAÇÃO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Banco de dados win_marketplace criado com sucesso!';
    RAISE NOTICE 'Timezone: America/Sao_Paulo';
    RAISE NOTICE 'Extensions: uuid-ossp, unaccent';
    RAISE NOTICE 'Tabela perfis criada e populada com 4 perfis: USER, LOJISTA, MOTORISTA, ADMIN';
END $$;