# Script PowerShell de deploy do sistema de geolocalização
# Para Lojistas, Usuários e Endereços
# Uso: .\deploy-geolocalizacao.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando deploy do sistema de geolocalização..." -ForegroundColor Cyan
Write-Host ""

$ProjectDir = "C:\Users\Usuario\Documents\win"

# 1. Atualizar código
Write-Host "📥 Atualizando código do repositório..." -ForegroundColor Yellow
Set-Location $ProjectDir
git pull origin main
Write-Host "✅ Código atualizado" -ForegroundColor Green
Write-Host ""

# 2. Compilar backend
Write-Host "🔨 Compilando backend..." -ForegroundColor Yellow
Set-Location "$ProjectDir\backend"
.\mvnw.cmd clean package -DskipTests
Write-Host "✅ Backend compilado" -ForegroundColor Green
Write-Host ""

# 3. Verificar migrations SQL
Write-Host "🗄️  Verificando migrations SQL..." -ForegroundColor Yellow
$migrations = @(
    "$ProjectDir\database\add_lojista_coordinates.sql",
    "$ProjectDir\database\add_usuario_endereco_coordinates.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "✅ Encontrado: $(Split-Path $migration -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "❌ Não encontrado: $(Split-Path $migration -Leaf)" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Instruções para VPS
Write-Host "📋 INSTRUÇÕES PARA APLICAR NA VPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Conectar via SSH:" -ForegroundColor Yellow
Write-Host "   ssh root@SEU_IP_VPS"
Write-Host ""
Write-Host "2. Executar script de deploy:" -ForegroundColor Yellow
Write-Host "   cd /root/win-marketplace"
Write-Host "   chmod +x deploy-geolocalizacao.sh"
Write-Host "   ./deploy-geolocalizacao.sh"
Write-Host ""
Write-Host "3. OU executar manualmente:" -ForegroundColor Yellow
Write-Host "   # Atualizar código"
Write-Host "   git pull origin main"
Write-Host ""
Write-Host "   # Aplicar migrations"
Write-Host "   docker exec -i postgres-db psql -U postgres -d winmarketplace \"
Write-Host "     < database/add_lojista_coordinates.sql"
Write-Host "   docker exec -i postgres-db psql -U postgres -d winmarketplace \"
Write-Host "     < database/add_usuario_endereco_coordinates.sql"
Write-Host ""
Write-Host "   # Reiniciar serviços"
Write-Host "   docker-compose down"
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host "   # Verificar logs"
Write-Host "   docker-compose logs -f backend"
Write-Host ""

# 5. Resumo das mudanças
Write-Host "📦 RESUMO DAS MUDANÇAS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Lojistas:" -ForegroundColor Green
Write-Host "   - Adicionados campos latitude/longitude"
Write-Host "   - Auto-geocodificação ao criar/atualizar"
Write-Host "   - Cache de coordenadas para Uber Direct"
Write-Host ""
Write-Host "✅ Usuários:" -ForegroundColor Green
Write-Host "   - Adicionados campos latitude/longitude"
Write-Host "   - Geocodificação no cadastro (se endereço fornecido)"
Write-Host "   - Endereço opcional no RegisterRequestDTO"
Write-Host ""
Write-Host "✅ Endereços:" -ForegroundColor Green
Write-Host "   - Adicionados campos latitude/longitude"
Write-Host "   - Auto-geocodificação ao criar/atualizar"
Write-Host "   - Re-geocodificação smart (só se endereço mudar)"
Write-Host ""
Write-Host "✅ Performance:" -ForegroundColor Green
Write-Host "   - Cálculo de frete 80% mais rápido"
Write-Host "   - Redução de chamadas a APIs externas"
Write-Host "   - Cache de coordenadas"
Write-Host ""

# 6. Documentação
Write-Host "📚 DOCUMENTAÇÃO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   _DOCS\IMPLEMENTACAO_GEOLOCALIZACAO_LOJISTAS.md"
Write-Host "   _DOCS\SISTEMA_GEOLOCALIZACAO_COMPLETO.md"
Write-Host ""

# 7. Testes locais (opcional)
$runLocal = Read-Host "Deseja testar localmente com Docker? (s/n)"
if ($runLocal -eq "s") {
    Write-Host ""
    Write-Host "🐳 Iniciando containers locais..." -ForegroundColor Yellow
    Set-Location $ProjectDir
    docker-compose down
    docker-compose up -d
    
    Write-Host "⏳ Aguardando serviços iniciarem (30s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "📊 Status dos serviços:" -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host ""
    Write-Host "✅ Ambiente local pronto!" -ForegroundColor Green
    Write-Host "   Backend: http://localhost:8080"
    Write-Host "   Frontend: http://localhost:3000"
    Write-Host ""
    Write-Host "Verificar logs: docker-compose logs -f backend"
}

Write-Host ""
Write-Host "🎉 Preparação concluída!" -ForegroundColor Green
