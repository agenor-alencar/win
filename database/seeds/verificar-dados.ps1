# ===============================================
# VERIFICACAO COMPLETA DA ESTRUTURA DE DADOS
# ===============================================
# Execute este script para verificar se tudo foi criado corretamente
# ===============================================

Write-Host "[*] VERIFICANDO ESTRUTURA DE DADOS DO WIN MARKETPLACE" -ForegroundColor Cyan
Write-Host "============================================================"

# 1. Verificar Categorias Principais
Write-Host "`n[CATEGORIAS PRINCIPAIS]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome, id FROM categorias WHERE categoria_pai_id IS NULL ORDER BY nome;" -t

# 2. Verificar Subcategorias por Categoria
Write-Host "`n[SUBCATEGORIAS POR CATEGORIA]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT c_pai.nome as categoria, COUNT(*) as total FROM categorias c INNER JOIN categorias c_pai ON c.categoria_pai_id = c_pai.id GROUP BY c_pai.nome ORDER BY c_pai.nome;"

# 3. Verificar Lojista
Write-Host "`n[LOJISTA CADASTRADO]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT l.nome_fantasia, u.email, l.status, l.status_aprovacao FROM lojistas l INNER JOIN usuarios u ON l.usuario_id = u.id;"

# 4. Verificar Produtos por Categoria
Write-Host "`n[PRODUTOS POR CATEGORIA]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT c_pai.nome as categoria, COUNT(p.id) as total_produtos, SUM(p.estoque) as total_estoque FROM produtos p INNER JOIN categorias c ON p.categoria_id = c.id INNER JOIN categorias c_pai ON c.categoria_pai_id = c_pai.id GROUP BY c_pai.nome ORDER BY total_produtos DESC;"

# 5. Verificar Produtos em Destaque
Write-Host "`n[PRODUTOS EM DESTAQUE - Homepage]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome, preco, estoque FROM produtos WHERE destaque = true ORDER BY preco DESC;"

# 6. Estatísticas Gerais
Write-Host "`n[ESTATISTICAS GERAIS]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT 'Total Categorias' as metrica, COUNT(*) as valor FROM categorias UNION ALL SELECT 'Categorias Pai', COUNT(*) FROM categorias WHERE categoria_pai_id IS NULL UNION ALL SELECT 'Subcategorias', COUNT(*) FROM categorias WHERE categoria_pai_id IS NOT NULL UNION ALL SELECT 'Total Produtos', COUNT(*) FROM produtos UNION ALL SELECT 'Produtos Ativos', COUNT(*) FROM produtos WHERE ativo = true UNION ALL SELECT 'Produtos Aprovados', COUNT(*) FROM produtos WHERE status = 'APROVADO' UNION ALL SELECT 'Lojistas Ativos', COUNT(*) FROM lojistas WHERE ativo = true;"

# 7. Produtos Mais Caros e Mais Baratos
Write-Host "`n[TOP 5 PRODUTOS MAIS CAROS]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 5;"

Write-Host "`n[TOP 5 PRODUTOS MAIS BARATOS]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome, preco FROM produtos ORDER BY preco ASC LIMIT 5;"

# 8. Produtos com Maior Estoque
Write-Host "`n[TOP 5 PRODUTOS COM MAIOR ESTOQUE]" -ForegroundColor Yellow
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT nome, estoque FROM produtos ORDER BY estoque DESC LIMIT 5;"

Write-Host "`n============================================================"
Write-Host "[OK] VERIFICACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "`n[CREDENCIAIS DE TESTE]" -ForegroundColor Cyan
Write-Host "   Admin: agenoralencaar@gmail.com (senha definida por voce)"
Write-Host "   Lojista: lojista@exemplo.com / lojista123"
Write-Host "`n[OK] Sistema pronto para uso!" -ForegroundColor Green
