-- Migration para adicionar campos de Recipient ID do Pagar.me
-- Necessários para split de pagamento entre marketplace e lojistas

-- Adicionar campo recipient_id na tabela lojistas
ALTER TABLE lojistas 
ADD COLUMN IF NOT EXISTS pagarme_recipient_id VARCHAR(100);

COMMENT ON COLUMN lojistas.pagarme_recipient_id IS 'ID do recebedor (recipient) no Pagar.me para split de pagamento';

-- Adicionar campo recipient_id_marketplace na tabela configuracoes
ALTER TABLE configuracoes 
ADD COLUMN IF NOT EXISTS pagarme_recipient_id_marketplace VARCHAR(100);

COMMENT ON COLUMN configuracoes.pagarme_recipient_id_marketplace IS 'ID do recebedor (recipient) do marketplace no Pagar.me para receber comissão e frete';

-- Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_lojistas_pagarme_recipient 
ON lojistas(pagarme_recipient_id) 
WHERE pagarme_recipient_id IS NOT NULL;
