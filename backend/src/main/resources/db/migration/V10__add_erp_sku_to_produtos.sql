-- Adiciona coluna erp_sku na tabela produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS erp_sku VARCHAR(100);

-- Índice para busca rápida por SKU do ERP
CREATE INDEX IF NOT EXISTS idx_produto_erp_sku ON produtos(erp_sku) 
WHERE erp_sku IS NOT NULL;

-- Comentário
COMMENT ON COLUMN produtos.erp_sku IS 'SKU do produto no ERP integrado (para sincronização de estoque)';
