-- ============================================
-- VERIFICAR CORREÇÕES - LOJISTA JC FERRAGENS
-- ============================================
-- Verifica se o lojista foi criado corretamente
-- ============================================

SELECT 
    u.email,
    u.nome as nome_usuario,
    l.nome_fantasia,
    l.cnpj,
    l.status,
    l.status_aprovacao,
    l.ativo,
    p.nome as perfil
FROM usuarios u
INNER JOIN usuario_perfis up ON u.id = up.usuario_id
INNER JOIN perfis p ON up.perfil_id = p.id
LEFT JOIN lojistas l ON u.id = l.usuario_id
WHERE u.email = 'jcferragensbsb@gmail.com';

-- Verificar se há produtos do lojista JC Ferragens
SELECT 
    l.nome_fantasia as loja,
    COUNT(p.id) as total_produtos,
    SUM(CASE WHEN p.ativo THEN 1 ELSE 0 END) as produtos_ativos
FROM lojistas l
LEFT JOIN produtos p ON l.id = p.lojista_id
WHERE l.cnpj = '12345678000299'
GROUP BY l.nome_fantasia;
