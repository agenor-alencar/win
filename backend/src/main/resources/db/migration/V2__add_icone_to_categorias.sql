-- Migration para adicionar campo icone na tabela categorias
-- Data: 2024
-- Descrição: Adiciona suporte a ícones personalizados para categorias

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS icone VARCHAR(50);

-- Criar índice para melhorar performance de consultas por ícone
CREATE INDEX IF NOT EXISTS idx_categorias_icone ON categorias(icone);

-- Comentário sobre a coluna
COMMENT ON COLUMN categorias.icone IS 'Nome do ícone Lucide React para exibir na interface (ex: wrench, zap, sparkles)';
