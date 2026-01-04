-- Migration: 006_create_favoritos_table.sql
-- Descrição: Cria a tabela de favoritos (produtos salvos pelos usuários)
-- Data: 04/01/2026

-- Criar tabela favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Garantir que um usuário não favorite o mesmo produto múltiplas vezes
    UNIQUE(usuario_id, produto_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_favorito_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favorito_produto ON favoritos(produto_id);
CREATE INDEX IF NOT EXISTS idx_favorito_criado_em ON favoritos(criado_em DESC);

-- Comentários nas tabelas e colunas
COMMENT ON TABLE favoritos IS 'Tabela de produtos favoritos dos usuários';
COMMENT ON COLUMN favoritos.id IS 'ID único do favorito';
COMMENT ON COLUMN favoritos.usuario_id IS 'ID do usuário que favoritou';
COMMENT ON COLUMN favoritos.produto_id IS 'ID do produto favoritado';
COMMENT ON COLUMN favoritos.criado_em IS 'Data de criação do favorito';
