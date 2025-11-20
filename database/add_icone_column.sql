-- Script para adicionar coluna icone na tabela categorias
-- Execute este script diretamente no banco se o backend não estiver rodando
-- Se o backend estiver rodando com ddl-auto: update, não é necessário executar manualmente

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS icone VARCHAR(50);

-- Comentário sobre a coluna
COMMENT ON COLUMN categorias.icone IS 'Nome do ícone Lucide React (wrench, zap, sparkles, package, car, hammer, paintbrush, home, lightbulb, tool, hardhat, bolt, plug, scissors, boxes, shoppingbag, factory, settings)';

-- Exemplo de atualização manual de categorias existentes:
-- UPDATE categorias SET icone = 'wrench' WHERE nome ILIKE '%ferrag%';
-- UPDATE categorias SET icone = 'zap' WHERE nome ILIKE '%elétric%';
-- UPDATE categorias SET icone = 'sparkles' WHERE nome ILIKE '%limp%';
-- UPDATE categorias SET icone = 'package' WHERE nome ILIKE '%embalag%';
-- UPDATE categorias SET icone = 'car' WHERE nome ILIKE '%automotiv%';
-- UPDATE categorias SET icone = 'hammer' WHERE nome ILIKE '%ferramenta%';
-- UPDATE categorias SET icone = 'paintbrush' WHERE nome ILIKE '%pintur%';
-- UPDATE categorias SET icone = 'home' WHERE nome ILIKE '%constru%' OR nome ILIKE '%casa%';

SELECT 'Coluna icone adicionada com sucesso!' as status;
