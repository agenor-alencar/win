-- ====================================================================
-- Migration 003c: Adicionar Flag de Frete Grátis Primeira Compra
-- ====================================================================
-- Descrição: Adiciona campo para marcar quando a WIN paga o frete (primeira compra)
-- Data: 2026-01-14
-- Autor: Win Marketplace Team
-- ====================================================================

BEGIN;

-- Adicionar campo para flag de frete grátis primeira compra
ALTER TABLE entregas 
ADD COLUMN IF NOT EXISTS frete_gratis_primeira_compra BOOLEAN NOT NULL DEFAULT FALSE;

-- Comentário
COMMENT ON COLUMN entregas.frete_gratis_primeira_compra IS 'Indica se o frete foi grátis para o cliente (primeira compra) - WIN assume o custo';

COMMIT;
