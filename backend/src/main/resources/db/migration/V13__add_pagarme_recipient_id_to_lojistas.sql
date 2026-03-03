-- Adiciona campo pagarme_recipient_id na tabela lojistas
-- Para armazenar o ID do recipient criado no Pagar.me

ALTER TABLE lojistas 
ADD COLUMN IF NOT EXISTS pagarme_recipient_id VARCHAR(100);

-- Índice para busca rápida por recipient
CREATE INDEX IF NOT EXISTS idx_lojistas_pagarme_recipient ON lojistas(pagarme_recipient_id);

-- Comentário
COMMENT ON COLUMN lojistas.pagarme_recipient_id IS 'ID do recipient no Pagar.me para split de pagamento';
