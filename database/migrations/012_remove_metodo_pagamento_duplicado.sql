-- Migration: Remover coluna duplicada metodo_pagamento
-- Data: 2026-02-17
-- Descrição: A tabela tinha metodo e metodo_pagamento. Mantemos apenas metodo.

-- Copiar dados de metodo_pagamento para metodo (se houver registros antigos)
UPDATE pagamentos 
SET metodo = metodo_pagamento 
WHERE metodo IS NULL AND metodo_pagamento IS NOT NULL;

-- Remover a constraint NOT NULL antes de dropar
ALTER TABLE pagamentos ALTER COLUMN metodo_pagamento DROP NOT NULL;

-- Dropar a coluna duplicada
ALTER TABLE pagamentos DROP COLUMN IF EXISTS metodo_pagamento;

-- Garantir que metodo seja NOT NULL
ALTER TABLE pagamentos ALTER COLUMN metodo SET NOT NULL;
