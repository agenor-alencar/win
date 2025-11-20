-- Migration para atualizar tabela pedidos para usar JSONB
-- Adiciona campos que estavam faltando e converte endereço para JSONB

-- 1. Adicionar colunas JSONB se não existirem
ALTER TABLE pedidos 
    ADD COLUMN IF NOT EXISTS endereco_entrega JSONB,
    ADD COLUMN IF NOT EXISTS pagamento JSONB,
    ADD COLUMN IF NOT EXISTS nota_fiscal JSONB,
    ADD COLUMN IF NOT EXISTS motorista_id UUID REFERENCES motoristas(id),
    ADD COLUMN IF NOT EXISTS codigo_entrega VARCHAR(10),
    ADD COLUMN IF NOT EXISTS peso_total_kg DECIMAL(8,3),
    ADD COLUMN IF NOT EXISTS volume_total_m3 DECIMAL(8,3),
    ADD COLUMN IF NOT EXISTS maior_dimensao_cm DECIMAL(8,2);

-- 2. Migrar dados existentes de endereco_entrega_id para JSONB (se houver dados)
UPDATE pedidos p
SET endereco_entrega = jsonb_build_object(
    'cep', e.cep,
    'logradouro', e.logradouro,
    'numero', e.numero,
    'complemento', e.complemento,
    'bairro', e.bairro,
    'cidade', e.cidade,
    'uf', e.uf
)
FROM enderecos e
WHERE p.endereco_entrega_id = e.id
  AND p.endereco_entrega IS NULL;

-- 3. Tornar endereco_entrega NOT NULL para novos registros
ALTER TABLE pedidos 
    ALTER COLUMN endereco_entrega SET NOT NULL;

-- 4. Remover coluna antiga (opcional - comentado por segurança)
-- ALTER TABLE pedidos DROP COLUMN IF EXISTS endereco_entrega_id;

-- 5. Remover cupom_id (não está sendo usado no código atual)
ALTER TABLE pedidos DROP COLUMN IF EXISTS cupom_id;

-- 6. Atualizar check constraint de status
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_status_check CHECK (status IN (
    'PENDENTE',
    'CONFIRMADO', 
    'PREPARANDO',
    'PRONTO',
    'EM_TRANSITO',
    'ENTREGUE',
    'CANCELADO'
));
