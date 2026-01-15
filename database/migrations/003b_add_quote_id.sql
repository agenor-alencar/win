-- ====================================================================
-- Migration 003b: Adicionar Quote ID e Melhorias Uber Direct
-- ====================================================================
-- Descrição: Adiciona campos para salvar ID da cotação Uber e dados de geolocalização
-- Data: 2026-01-14
-- Autor: Win Marketplace Team
-- ====================================================================

BEGIN;

-- ===================================
-- Adicionar campos para Quote ID e Geolocalização
-- ===================================

-- Adicionar quote_id para garantir preço na solicitação
ALTER TABLE entregas 
ADD COLUMN IF NOT EXISTS quote_id_uber VARCHAR(255),
ADD COLUMN IF NOT EXISTS valor_original_cotado DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS valor_arredondado_cliente DECIMAL(10, 2);

-- Adicionar campos de geolocalização (opcionais)
ALTER TABLE entregas
ADD COLUMN IF NOT EXISTS origem_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS origem_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS destino_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS destino_longitude DECIMAL(11, 8);

-- Adicionar índice para quote_id
CREATE INDEX IF NOT EXISTS idx_entrega_quote_id ON entregas(quote_id_uber);

-- Comentários
COMMENT ON COLUMN entregas.quote_id_uber IS 'ID da cotação retornado pela Uber (usado na solicitação para garantir preço)';
COMMENT ON COLUMN entregas.valor_original_cotado IS 'Valor exato retornado pela cotação Uber (antes do arredondamento)';
COMMENT ON COLUMN entregas.valor_arredondado_cliente IS 'Valor arredondado inteligente mostrado ao cliente';
COMMENT ON COLUMN entregas.origem_latitude IS 'Latitude do endereço de origem (lojista)';
COMMENT ON COLUMN entregas.origem_longitude IS 'Longitude do endereço de origem (lojista)';
COMMENT ON COLUMN entregas.destino_latitude IS 'Latitude do endereço de destino (cliente)';
COMMENT ON COLUMN entregas.destino_longitude IS 'Longitude do endereço de destino (cliente)';

COMMIT;
