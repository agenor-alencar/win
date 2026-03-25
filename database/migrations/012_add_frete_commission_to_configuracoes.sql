-- Migration: Adicionar colunas frete à tabela configuracoes
-- Objetivo: Suportar configurações de comissão de frete

ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS taxa_comissao_frete DECIMAL(5,2) DEFAULT 7.00;

COMMENT ON COLUMN configuracoes.taxa_comissao_frete IS 'Taxa de comissão Win Marketplace sobre fretes (padrão 7%)';
