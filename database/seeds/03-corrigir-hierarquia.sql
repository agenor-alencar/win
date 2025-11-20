-- ============================================
-- CORRIGIR HIERARQUIA DE CATEGORIAS
-- ============================================
-- Associa subcategorias órfãs às categorias pai corretas
-- ============================================

-- Subcategorias de Autopeças
UPDATE categorias 
SET categoria_pai_id = (SELECT id FROM categorias WHERE nome = 'Autopeças' AND categoria_pai_id IS NULL)
WHERE nome IN ('Filtros', 'Pastilhas de Freio', 'Correias', 'Velas de Ignição', 'Baterias')
  AND categoria_pai_id IS NULL;

-- Subcategorias de Elétrica
UPDATE categorias 
SET categoria_pai_id = (SELECT id FROM categorias WHERE nome = 'Elétrica' AND categoria_pai_id IS NULL)
WHERE nome IN ('Fios e Cabos', 'Interruptores', 'Disjuntores', 'Lâmpadas', 'Eletrodutos')
  AND categoria_pai_id IS NULL;

-- Subcategorias de Ferragens
UPDATE categorias 
SET categoria_pai_id = (SELECT id FROM categorias WHERE nome = 'Ferragens' AND categoria_pai_id IS NULL)
WHERE nome IN ('Parafusos', 'Pregos', 'Dobradiças', 'Fechaduras', 'Ferramentas')
  AND categoria_pai_id IS NULL;

-- Verificação final
DO $$
DECLARE
    total_categorias_pai INTEGER;
    total_subcategorias INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_categorias_pai FROM categorias WHERE categoria_pai_id IS NULL;
    SELECT COUNT(*) INTO total_subcategorias FROM categorias WHERE categoria_pai_id IS NOT NULL;
    
    RAISE NOTICE '✅ Hierarquia corrigida!';
    RAISE NOTICE 'Categorias principais: %', total_categorias_pai;
    RAISE NOTICE 'Subcategorias: %', total_subcategorias;
END $$;
