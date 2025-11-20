-- ============================================
-- CORRIGIR LOJISTA FALTANTE - DIOGO CERQUEIRA
-- ============================================
-- Cria registro de lojista para usuário que tem perfil mas não tem lojista
-- ============================================

DO $$
DECLARE
    v_usuario_id UUID;
    v_lojista_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_usuario_id FROM usuarios WHERE email = 'jcferragensbsb@gmail.com';
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuário jcferragensbsb@gmail.com não encontrado!';
    END IF;
    
    -- Verificar se já existe lojista
    SELECT id INTO v_lojista_id FROM lojistas WHERE usuario_id = v_usuario_id;
    
    IF v_lojista_id IS NOT NULL THEN
        RAISE NOTICE 'Lojista já existe para este usuário!';
    ELSE
        -- Criar registro de lojista
        INSERT INTO lojistas (
            id, 
            usuario_id, 
            nome_fantasia, 
            razao_social, 
            cnpj, 
            telefone,
            descricao,
            status, 
            status_aprovacao, 
            comissao,
            ativo,
            criado_em, 
            atualizado_em
        )
        VALUES (
            gen_random_uuid(), 
            v_usuario_id, 
            'JC Ferragens', 
            'JC Ferragens e Materiais de Construção LTDA', 
            '12345678000299', 
            '11987654322',
            'Comércio de ferragens e materiais de construção',
            'ATIVO', 
            'APROVADO', 
            8.50,
            true, 
            NOW(), 
            NOW()
        )
        RETURNING id INTO v_lojista_id;
        
        RAISE NOTICE '✅ Lojista criado com sucesso!';
        RAISE NOTICE 'Usuario: jcferragensbsb@gmail.com';
        RAISE NOTICE 'Lojista ID: %', v_lojista_id;
        RAISE NOTICE 'Nome Fantasia: JC Ferragens';
        RAISE NOTICE 'CNPJ: 12345678000299';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro: %', SQLERRM;
        RAISE;
END $$;
