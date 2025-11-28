-- ============================================================================
-- MIGRAÇÃO 001: Remover Tabela Administradores
-- ============================================================================
-- Data: 2025-11-27
-- Descrição: Remove a tabela 'administradores' redundante, mantendo a 
--            funcionalidade de administrador através do sistema de perfis
-- Impacto: BAIXO - Sistema já usa perfis para controle de acesso
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Verificar Estado Atual
-- ============================================================================

-- Verificar se existem dados na tabela administradores
SELECT 'VERIFICAÇÃO: Registros em administradores' AS etapa;
SELECT COUNT(*) as total_administradores FROM administradores;

-- Verificar se todos os admins têm o perfil ADMIN
SELECT 'VERIFICAÇÃO: Admins sem perfil ADMIN' AS etapa;
SELECT u.id, u.nome, u.email
FROM administradores a
JOIN usuarios u ON u.id = a.id
WHERE NOT EXISTS (
    SELECT 1 
    FROM usuario_perfis up
    JOIN perfis p ON p.id = up.perfil_id
    WHERE up.usuario_id = u.id 
    AND p.nome = 'ADMIN'
);

-- ============================================================================
-- PASSO 2: Migrar Dados (se necessário)
-- ============================================================================

-- Garantir que todos os usuários da tabela administradores tenham o perfil ADMIN
SELECT 'MIGRAÇÃO: Adicionando perfil ADMIN aos administradores' AS etapa;

INSERT INTO usuario_perfis (usuario_id, perfil_id)
SELECT a.id, p.id 
FROM administradores a
CROSS JOIN perfis p
WHERE p.nome = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM usuario_perfis up 
    WHERE up.usuario_id = a.id AND up.perfil_id = p.id
)
ON CONFLICT DO NOTHING;

-- Verificar resultado da migração
SELECT 'VERIFICAÇÃO: Todos os admins agora têm perfil ADMIN' AS etapa;
SELECT u.id, u.nome, u.email, p.nome as perfil
FROM administradores a
JOIN usuarios u ON u.id = a.id
JOIN usuario_perfis up ON up.usuario_id = u.id
JOIN perfis p ON p.id = up.perfil_id
WHERE p.nome = 'ADMIN';

-- ============================================================================
-- PASSO 3: Remover Tabela
-- ============================================================================

SELECT 'REMOÇÃO: Dropando tabela administradores' AS etapa;

-- Remover constraints e foreign keys se existirem
ALTER TABLE IF EXISTS administradores 
DROP CONSTRAINT IF EXISTS administradores_id_fkey CASCADE;

-- Remover a tabela
DROP TABLE IF EXISTS administradores CASCADE;

-- ============================================================================
-- PASSO 4: Verificação Final
-- ============================================================================

SELECT 'VERIFICAÇÃO FINAL: Tabela administradores removida' AS etapa;
SELECT COUNT(*) as tabela_existe 
FROM information_schema.tables 
WHERE table_name = 'administradores';

-- Verificar que todos os perfis ADMIN estão OK
SELECT 'VERIFICAÇÃO FINAL: Usuários com perfil ADMIN' AS etapa;
SELECT COUNT(*) as total_admins
FROM usuario_perfis up
JOIN perfis p ON p.id = up.perfil_id
WHERE p.nome = 'ADMIN';

-- ============================================================================
-- COMMIT ou ROLLBACK
-- ============================================================================

-- Se tudo estiver OK, descomente a linha abaixo:
-- COMMIT;

-- Para testar sem aplicar as mudanças, use:
ROLLBACK;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- 1. Fazer backup do banco antes de executar
-- 2. Executar este script em modo teste (com ROLLBACK)
-- 3. Verificar os resultados
-- 4. Se tudo OK, trocar ROLLBACK por COMMIT
-- 5. Executar novamente
-- ============================================================================
