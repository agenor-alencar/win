-- ============================================
-- PRODUTOS EXEMPLO - WIN MARKETPLACE
-- ============================================
-- Cria 30 produtos de exemplo distribuídos pelas categorias
-- Seguro: Usa ON CONFLICT, referencia IDs existentes
-- ============================================

DO $$
DECLARE
    v_lojista_id UUID;
BEGIN
    -- Buscar ID do lojista exemplo
    SELECT id INTO v_lojista_id FROM lojistas WHERE cnpj = '12345678000190' LIMIT 1;
    
    IF v_lojista_id IS NULL THEN
        RAISE EXCEPTION 'Lojista exemplo não encontrado! Execute primeiro o script 04-lojista-exemplo.sql';
    END IF;
    
    -- ========================================
    -- AUTOPEÇAS - Baterias
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Bateria Moura 60Ah', 'Bateria automotiva 12V 60 amperes', 389.90, 15, 'BAT-MOURA-60AH', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome = 'Baterias' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Bateria Heliar 48Ah', 'Bateria selada 12V 48 amperes', 299.90, 22, 'BAT-HELIAR-48AH', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Baterias' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- AUTOPEÇAS - Filtros
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Filtro de Óleo Mann W920', 'Filtro de óleo para motor', 29.90, 150, 'FILT-OLEO-W920', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Filtros' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Filtro de Ar Tecfil ARS1234', 'Filtro de ar motor', 45.90, 85, 'FILT-AR-ARS1234', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Filtros' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Filtro de Combustível Mahle KC100', 'Filtro para sistema de injeção', 38.50, 120, 'FILT-COMB-KC100', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Filtros' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- AUTOPEÇAS - Pastilhas de Freio
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Pastilha Freio Bosch Cerâmica', 'Jogo pastilhas freio dianteiro', 159.90, 45, 'PAST-BOSCH-CER', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome = 'Pastilhas de Freio' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Lona Freio Frasle Traseira', 'Jogo lonas freio traseiro', 89.90, 60, 'LONA-FRAS-TRAS', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Pastilhas de Freio' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- AUTOPEÇAS - Correias
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Correia Dentada Gates PowerGrip', 'Correia sincronizadora motor', 125.90, 35, 'CORR-GATES-DENT', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Correias' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Correia Poly-V 6PK1175', 'Correia estriada alternador', 49.90, 75, 'CORR-POLY-6PK', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Correias' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- ELÉTRICA - Fios e Cabos
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Cabo Flexível 2,5mm 100m Pirelli', 'Rolo cabo elétrico flexível', 189.90, 25, 'CABO-PIR-2.5-100', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome = 'Fios e Cabos' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Fio Rígido 1,5mm 100m Cobrecom', 'Rolo fio sólido residencial', 129.90, 40, 'FIO-COB-1.5-100', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Fios e Cabos' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- ELÉTRICA - Interruptores
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Interruptor Simples Tramontina', 'Interruptor 1 tecla 10A', 12.90, 200, 'INT-TRAM-SIMPLES', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Interruptores' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Tomada 2P+T 20A Pial Legrand', 'Tomada padrão novo brasileiro', 18.90, 150, 'TOM-PIAL-2PT-20A', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Interruptores' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- ELÉTRICA - Disjuntores
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Disjuntor Bipolar 25A Schneider', 'Disjuntor termomagnético 2 polos', 45.90, 80, 'DISJ-SCH-2P-25A', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Disjuntores' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Disjuntor DPS 20kA Clamper', 'Dispositivo proteção surto', 89.90, 55, 'DPS-CLAMP-20KA', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome = 'Disjuntores' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- EMBALAGEM - Caixas de Papelão
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Caixa Papelão 30x30x30cm - Pct 25un', 'Embalagem transporte papelão onda dupla', 89.90, 100, 'CX-PAP-30-25UN', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome LIKE 'Caixas de Papel%' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Caixa Papelão 60x40x40cm - Pct 10un', 'Caixa grande para mudanças e entregas', 69.90, 75, 'CX-PAP-60-10UN', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome LIKE 'Caixas de Papel%' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- EMBALAGEM - Plástico Bolha
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Plástico Bolha 1,30m x 100m', 'Rolo proteção para transporte', 159.90, 30, 'PLAS-BOLHA-130', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome LIKE 'Pl%stico Bolha' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- EMBALAGEM - Fita Adesiva
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Fita Adesiva Marrom 48mm x 50m - Pct 5un', 'Fita para embalagem PP transparente', 25.90, 200, 'FITA-MAR-48-5UN', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Fita Adesiva' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Fita Dupla Face 19mm x 30m', 'Fita adesiva dupla face espuma', 18.90, 150, 'FITA-DUPLA-19', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Fita Adesiva' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- FERRAGENS - Parafusos
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Parafuso Sextavado M8 x 40mm - Pct 100un', 'Parafuso aço zincado com porca', 35.90, 120, 'PAR-SEX-M8-100UN', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Parafusos' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Parafuso Phillips M6 x 30mm - Caixa 500un', 'Parafuso cabeça chata fenda cruzeta', 89.90, 45, 'PAR-PHIL-M6-500', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Parafusos' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- FERRAGENS - Dobradiças
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Dobradiça 3" Cromada - Par', 'Dobradiça porta interna 2 unidades', 12.90, 180, 'DOBR-3-CROM-PAR', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome LIKE 'Dobrad%' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Dobradiça Pivotante Pado 100kg', 'Dobradiça industrial carga pesada', 89.90, 35, 'DOBR-PIV-PADO', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome LIKE 'Dobrad%' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- FERRAGENS - Fechaduras
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Fechadura Interna Papaiz 40mm Cromada', 'Fechadura cilindro porta interna', 45.90, 65, 'FECH-PAP-40-CROM', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Fechaduras' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Fechadura Eletrônica Digital Intelbras', 'Fechadura biométrica + senha', 589.90, 12, 'FECH-INT-DIGIT', 'APROVADO', true, true, NOW(), NOW()
    FROM categorias WHERE nome = 'Fechaduras' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    -- ========================================
    -- FERRAGENS - Ferramentas
    -- ========================================
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Jogo Chaves Allen 1,5 a 10mm - 9 Peças', 'Chaves hexagonais em estojo', 29.90, 90, 'FERR-ALLEN-9PC', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Ferramentas' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    INSERT INTO produtos (id, lojista_id, categoria_id, nome, descricao, preco, estoque, sku, status, ativo, destaque, criado_em, atualizado_em)
    SELECT gen_random_uuid(), v_lojista_id, id, 'Alicate Universal 8" Tramontina', 'Alicate corte e pressão profissional', 65.90, 55, 'FERR-ALIC-UNI-8', 'APROVADO', true, false, NOW(), NOW()
    FROM categorias WHERE nome = 'Ferramentas' LIMIT 1
    ON CONFLICT (sku) DO NOTHING;
    
    RAISE NOTICE '✅ Produtos criados com sucesso!';
    RAISE NOTICE 'Total de produtos: %', (SELECT COUNT(*) FROM produtos WHERE lojista_id = v_lojista_id);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar produtos: %', SQLERRM;
        RAISE;
END $$;
