-- ============================================
-- LOJISTA EXEMPLO - WIN MARKETPLACE
-- ============================================
-- Cria um lojista de exemplo para testes
-- Seguro: Usa ON CONFLICT, transação atômica
-- ============================================

DO $$
DECLARE
    v_usuario_id UUID;
    v_lojista_id UUID;
    v_perfil_lojista_id UUID;
    v_senha_hash TEXT := '$2a$10$rN8LKqZxvGLhH5XqXBZxT.vGk5yHZJ3YhELF8LFXoNZJZHZJZHZJZ'; -- senha: lojista123
BEGIN
    -- 1. Criar usuário
    INSERT INTO usuarios (id, email, senha_hash, nome, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'lojista@exemplo.com', v_senha_hash, 'Comercial Win Exemplo', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE 
    SET atualizado_em = NOW()
    RETURNING id INTO v_usuario_id;
    
    -- Se UPDATE foi executado, pegar ID existente
    IF v_usuario_id IS NULL THEN
        SELECT id INTO v_usuario_id FROM usuarios WHERE email = 'lojista@exemplo.com';
    END IF;
    
    -- 2. Criar registro de lojista
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
        'Win Comércio e Distribuição', 
        'Win Comércio e Distribuição LTDA', 
        '12345678000190', 
        '11987654321',
        'Distribuidor autorizado de peças automotivas, materiais elétricos e ferragens',
        'ATIVO', 
        'APROVADO', 
        8.50,
        true, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (cnpj) DO UPDATE 
    SET atualizado_em = NOW()
    RETURNING id INTO v_lojista_id;
    
    -- Se UPDATE foi executado, pegar ID existente
    IF v_lojista_id IS NULL THEN
        SELECT id INTO v_lojista_id FROM lojistas WHERE cnpj = '12345678000190';
    END IF;
    
    -- 3. Associar perfil LOJISTA
    SELECT id INTO v_perfil_lojista_id FROM perfis WHERE nome = 'LOJISTA';
    
    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_lojista_id, NOW(), NOW())
    ON CONFLICT (usuario_id, perfil_id) DO NOTHING;
    
    RAISE NOTICE '✅ Lojista exemplo criado com sucesso!';
    RAISE NOTICE 'Email: lojista@exemplo.com';
    RAISE NOTICE 'Senha: lojista123';
    RAISE NOTICE 'Usuario ID: %', v_usuario_id;
    RAISE NOTICE 'Lojista ID: %', v_lojista_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar lojista: %', SQLERRM;
        RAISE;
END $$;
