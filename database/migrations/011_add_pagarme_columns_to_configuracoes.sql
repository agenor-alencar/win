-- Migration: Adicionar colunas Pagar.me é tabela configuracoes
-- Objetivo: Suportar integração com gateway Pagar.me

ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_recipient_id_marketplace VARCHAR(255);
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_api_key_sandbox VARCHAR(500);
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_public_key_sandbox VARCHAR(255);
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_api_key_production VARCHAR(500);
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_public_key_production VARCHAR(255);
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS pagarme_environment VARCHAR(50) DEFAULT 'sandbox';

COMMENT ON COLUMN configuracoes.pagarme_recipient_id_marketplace IS 'ID da conta recebedora Pagar.me da Win Marketplace';
COMMENT ON COLUMN configuracoes.pagarme_api_key_sandbox IS 'Chave API sandbox Pagar.me';
COMMENT ON COLUMN configuracoes.pagarme_public_key_sandbox IS 'Chave pública sandbox Pagar.me';
COMMENT ON COLUMN configuracoes.pagarme_api_key_production IS 'Chave API produção Pagar.me';
COMMENT ON COLUMN configuracoes.pagarme_public_key_production IS 'Chave pública produção Pagar.me';
COMMENT ON COLUMN configuracoes.pagarme_environment IS 'Ambiente atual (sandbox ou production)';
