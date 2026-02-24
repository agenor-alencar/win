-- V11: Adicionar campo taxa_comissao_frete na tabela configuracoes
-- Data: 22/02/2026
-- Descrição: Campo configurável para taxa de comissão sobre frete Uber

-- Adicionar coluna taxa_comissao_frete
ALTER TABLE configuracoes 
ADD COLUMN IF NOT EXISTS taxa_comissao_frete NUMERIC(5,2) NOT NULL DEFAULT 10.00;

-- Comentário explicativo
COMMENT ON COLUMN configuracoes.taxa_comissao_frete IS 'Percentual de comissão aplicado sobre o valor do frete retornado pela Uber Direct API. Exemplo: 10.00 = 10%';

-- Log da migration
INSERT INTO logs_sistema (tipo, mensagem, criado_em) 
VALUES ('MIGRATION', 'V11: Campo taxa_comissao_frete adicionado com sucesso', NOW())
ON CONFLICT DO NOTHING;
