-- ============================================
-- SUBCATEGORIAS - WIN MARKETPLACE
-- ============================================
-- Cria subcategorias para as categorias existentes
-- Seguro: Usa ON CONFLICT DO NOTHING
-- ============================================

-- Subcategorias de Autopeças
INSERT INTO categorias (id, nome, descricao, slug, categoria_pai_id, ativo, ordem) 
VALUES 
    (gen_random_uuid(), 'Filtros', 'Filtros de óleo, ar, combustível', 'filtros', 
     (SELECT id FROM categorias WHERE nome = 'Autopeças'), true, 1),
    (gen_random_uuid(), 'Pastilhas de Freio', 'Pastilhas e lonas de freio', 'pastilhas-freio', 
     (SELECT id FROM categorias WHERE nome = 'Autopeças'), true, 2),
    (gen_random_uuid(), 'Correias', 'Correias dentadas e poly-v', 'correias', 
     (SELECT id FROM categorias WHERE nome = 'Autopeças'), true, 3),
    (gen_random_uuid(), 'Velas de Ignição', 'Velas para motores', 'velas-ignicao', 
     (SELECT id FROM categorias WHERE nome = 'Autopeças'), true, 4),
    (gen_random_uuid(), 'Baterias', 'Baterias automotivas', 'baterias', 
     (SELECT id FROM categorias WHERE nome = 'Autopeças'), true, 5)
ON CONFLICT (nome) DO NOTHING;

-- Subcategorias de Elétrica
INSERT INTO categorias (id, nome, descricao, slug, categoria_pai_id, ativo, ordem) 
VALUES 
    (gen_random_uuid(), 'Fios e Cabos', 'Cabos elétricos diversos', 'fios-cabos', 
     (SELECT id FROM categorias WHERE nome = 'Elétrica'), true, 1),
    (gen_random_uuid(), 'Interruptores', 'Interruptores e tomadas', 'interruptores', 
     (SELECT id FROM categorias WHERE nome = 'Elétrica'), true, 2),
    (gen_random_uuid(), 'Disjuntores', 'Disjuntores e proteção', 'disjuntores', 
     (SELECT id FROM categorias WHERE nome = 'Elétrica'), true, 3),
    (gen_random_uuid(), 'Lâmpadas', 'Lâmpadas LED e fluorescentes', 'lampadas', 
     (SELECT id FROM categorias WHERE nome = 'Elétrica'), true, 4),
    (gen_random_uuid(), 'Eletrodutos', 'Conduítes e eletrodutos', 'eletrodutos', 
     (SELECT id FROM categorias WHERE nome = 'Elétrica'), true, 5)
ON CONFLICT (nome) DO NOTHING;

-- Subcategorias de Embalagem
INSERT INTO categorias (id, nome, descricao, slug, categoria_pai_id, ativo, ordem) 
VALUES 
    (gen_random_uuid(), 'Caixas de Papelão', 'Caixas para transporte', 'caixas-papelao', 
     (SELECT id FROM categorias WHERE nome = 'Embalagem'), true, 1),
    (gen_random_uuid(), 'Plástico Bolha', 'Proteção para transporte', 'plastico-bolha', 
     (SELECT id FROM categorias WHERE nome = 'Embalagem'), true, 2),
    (gen_random_uuid(), 'Fita Adesiva', 'Fitas para embalagem', 'fita-adesiva', 
     (SELECT id FROM categorias WHERE nome = 'Embalagem'), true, 3),
    (gen_random_uuid(), 'Sacos Plásticos', 'Sacos e sacolas', 'sacos-plasticos', 
     (SELECT id FROM categorias WHERE nome = 'Embalagem'), true, 4),
    (gen_random_uuid(), 'Etiquetas', 'Etiquetas adesivas', 'etiquetas', 
     (SELECT id FROM categorias WHERE nome = 'Embalagem'), true, 5)
ON CONFLICT (nome) DO NOTHING;

-- Subcategorias de Ferragens
INSERT INTO categorias (id, nome, descricao, slug, categoria_pai_id, ativo, ordem) 
VALUES 
    (gen_random_uuid(), 'Parafusos', 'Parafusos diversos', 'parafusos', 
     (SELECT id FROM categorias WHERE nome = 'Ferragens'), true, 1),
    (gen_random_uuid(), 'Pregos', 'Pregos e grampos', 'pregos', 
     (SELECT id FROM categorias WHERE nome = 'Ferragens'), true, 2),
    (gen_random_uuid(), 'Dobradiças', 'Dobradiças para portas', 'dobradicas', 
     (SELECT id FROM categorias WHERE nome = 'Ferragens'), true, 3),
    (gen_random_uuid(), 'Fechaduras', 'Fechaduras e trincos', 'fechaduras', 
     (SELECT id FROM categorias WHERE nome = 'Ferragens'), true, 4),
    (gen_random_uuid(), 'Ferramentas', 'Ferramentas manuais', 'ferramentas', 
     (SELECT id FROM categorias WHERE nome = 'Ferragens'), true, 5)
ON CONFLICT (nome) DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Subcategorias criadas com sucesso!';
    RAISE NOTICE 'Total de subcategorias: %', (SELECT COUNT(*) FROM categorias WHERE categoria_pai_id IS NOT NULL);
END $$;
