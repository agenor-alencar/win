-- Adicionar coluna temporario na tabela enderecos
-- Data: 27/01/2026
-- Descrição: Suporte a endereços temporários criados pelo CEPWidget

ALTER TABLE enderecos 
ADD COLUMN IF NOT EXISTS temporario BOOLEAN DEFAULT FALSE;

-- Criar índice para busca rápida de endereços temporários
CREATE INDEX IF NOT EXISTS idx_enderecos_temporario 
ON enderecos (usuario_id, temporario, ativo) 
WHERE temporario = TRUE AND ativo = TRUE;

-- Comentários para documentação
COMMENT ON COLUMN enderecos.temporario IS 'Indica se o endereço é temporário (criado pelo CEPWidget e será completado no checkout)';
