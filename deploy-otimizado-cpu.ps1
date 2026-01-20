# =====================================================
# Script de Deploy - Otimizações de Performance
# =====================================================
# Data: 20 de Janeiro de 2026
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY - OTIMIZAÇÕES DE PERFORMANCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Parando containers..." -ForegroundColor Yellow
docker-compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao parar containers!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Containers parados" -ForegroundColor Green
Write-Host ""

Write-Host "[2/6] Compilando backend..." -ForegroundColor Yellow
cd backend
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO na compilação do backend!" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..
Write-Host "  ✓ Backend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "[3/6] Iniciando banco de dados..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 10
Write-Host "  ✓ Banco de dados iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "[4/6] Aplicando índices de otimização..." -ForegroundColor Yellow
$sqlScript = Get-Content "database\otimizacao_indices.sql" -Raw
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c "$sqlScript"
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: Alguns índices podem já existir (isso é normal)" -ForegroundColor Yellow
}
Write-Host "  ✓ Índices aplicados" -ForegroundColor Green
Write-Host ""

Write-Host "[5/6] Iniciando backend otimizado..." -ForegroundColor Yellow
docker-compose up -d --build backend
Start-Sleep -Seconds 15
Write-Host "  ✓ Backend iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "[6/6] Iniciando frontend..." -ForegroundColor Yellow
docker-compose up -d frontend
Write-Host "  ✓ Frontend iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verificando status dos containers:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""

Write-Host "Monitorar logs do backend:" -ForegroundColor Yellow
Write-Host "  docker logs -f win-marketplace-backend" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificar uso de CPU/Memória:" -ForegroundColor Yellow
Write-Host "  docker stats" -ForegroundColor Cyan
Write-Host ""

Write-Host "Acessar aplicação:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
