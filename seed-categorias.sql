-- Script SQL para cadastrar categorias padrão
-- Execute: docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < seed-categorias.sql

-- Inserir categorias principais
INSERT INTO categorias (id, nome, descricao, criado_em, atualizado_em, categoria_pai_id) VALUES
(gen_random_uuid(), 'Eletrônicos', 'Produtos eletrônicos em geral', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Moda e Vestuário', 'Roupas, calçados e acessórios', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Casa e Decoração', 'Produtos para casa e decoração', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Esportes e Lazer', 'Artigos esportivos e de lazer', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Livros e Papelaria', 'Livros, revistas e artigos de papelaria', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Alimentos e Bebidas', 'Produtos alimentícios e bebidas', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Beleza e Cuidados Pessoais', 'Cosméticos e produtos de higiene', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Brinquedos e Jogos', 'Brinquedos, jogos e entretenimento', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Automotivo', 'Peças e acessórios automotivos', NOW(), NOW(), NULL),
(gen_random_uuid(), 'Ferramentas e Construção', 'Ferramentas e materiais de construção', NOW(), NOW(), NULL)
ON CONFLICT DO NOTHING;
