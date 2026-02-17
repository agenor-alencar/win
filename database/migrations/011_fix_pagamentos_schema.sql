-- Migration: Adicionar colunas faltantes na tabela pagamentos
-- Data: 2026-02-14
-- Descrição: Adiciona colunas parcelas, informacoes_cartao e observacoes para compatibilidade com entidade JPA

-- Adicionar coluna parcelas (número de parcelas do cartão)
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS parcelas INTEGER;

-- Adicionar coluna informacoes_cartao (últimos 4 dígitos, bandeira, etc)
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS informacoes_cartao VARCHAR(100);

-- Adicionar coluna observacoes (notas adicionais sobre o pagamento)
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS observacoes VARCHAR(200);

-- Comentários
COMMENT ON COLUMN pagamentos.parcelas IS 'Número de parcelas (para pagamentos com cartão)';
COMMENT ON COLUMN pagamentos.informacoes_cartao IS 'Informações do cartão (últimos 4 dígitos, bandeira)';
COMMENT ON COLUMN pagamentos.observacoes IS 'Observações adicionais sobre o pagamento';
