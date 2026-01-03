-- ============================================
-- Migration 005: Criar tabela de banners
-- ============================================
-- 
-- Cria a tabela para gerenciamento de banners da home page
-- Os banners são gerenciados exclusivamente por usuários ADMIN
--
-- Data: 03/01/2026
-- ============================================

BEGIN;

-- Criar tabela de banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(500),
    imagem_url VARCHAR(1000) NOT NULL,
    link_url VARCHAR(1000),
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_banner_ativo_ordem 
    ON banners(ativo, ordem) WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_banner_ordem 
    ON banners(ordem);

-- Comentários nas colunas
COMMENT ON TABLE banners IS 'Banners exibidos no carrossel da página inicial';
COMMENT ON COLUMN banners.id IS 'Identificador único do banner';
COMMENT ON COLUMN banners.titulo IS 'Título do banner (ex: "Ferragens e Ferramentas")';
COMMENT ON COLUMN banners.subtitulo IS 'Subtítulo ou descrição do banner';
COMMENT ON COLUMN banners.imagem_url IS 'URL da imagem no DigitalOcean Spaces';
COMMENT ON COLUMN banners.link_url IS 'URL de destino ao clicar no banner (opcional)';
COMMENT ON COLUMN banners.ordem IS 'Ordem de exibição (menor = primeiro)';
COMMENT ON COLUMN banners.ativo IS 'Se o banner está ativo e visível';
COMMENT ON COLUMN banners.criado_em IS 'Data de criação do banner';
COMMENT ON COLUMN banners.atualizado_em IS 'Data da última atualização';

-- Inserir banners de exemplo (marcas parceiras)
INSERT INTO banners (titulo, subtitulo, imagem_url, link_url, ordem, ativo) VALUES
    ('Ferragens e Ferramentas', 'Encontre as melhores marcas: Ingco, Bosch, Makita e mais', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/banners/placeholder-ferragens.jpg', '/categoria/ferragens', 1, true),
    ('Frete Grátis na Primeira Compra', 'Aproveite nossas marcas parceiras: Hafele, Stanley, Dewalt, Irwin', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/banners/placeholder-marcas.jpg', '/produtos', 2, true),
    ('Promoções de Ferramentas', 'Descontos especiais em ferramentas FGVTN e muito mais', 'https://win-marketplace-storage.sfo3.digitaloceanspaces.com/banners/placeholder-promocoes.jpg', '/promocoes', 3, true);

COMMIT;

-- ============================================
-- Para aplicar esta migration:
-- docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql
-- ============================================
