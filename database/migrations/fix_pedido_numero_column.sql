-- Migration: Renomear coluna numero_pedido para numero na tabela pedidos
-- Motivo: Alinhar schema do banco de dados com mapeamento JPA
-- Data: 2026-02-14

-- Verificar se a coluna numero_pedido existe antes de renomear
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos' 
        AND column_name = 'numero_pedido'
    ) THEN
        -- Renomear coluna numero_pedido para numero
        ALTER TABLE pedidos RENAME COLUMN numero_pedido TO numero;
        
        RAISE NOTICE 'Coluna numero_pedido renomeada para numero com sucesso';
    ELSE
        RAISE NOTICE 'Coluna numero_pedido não existe, migration já aplicada ou não necessária';
    END IF;
END $$;

-- Verificar se a constraint existe e renomear se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'pedidos_numero_pedido_key' 
        AND table_name = 'pedidos'
    ) THEN
        ALTER TABLE pedidos RENAME CONSTRAINT pedidos_numero_pedido_key TO pedidos_numero_key;
        RAISE NOTICE 'Constraint renomeada com sucesso';
    END IF;
END $$;
