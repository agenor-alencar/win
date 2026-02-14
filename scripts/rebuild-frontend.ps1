# Script para reconstruir o frontend no VPS

Write-Host "🔄 Reconstruindo frontend no VPS..." -ForegroundColor Cyan

# Comandos a serem executados no VPS
$commands = @"
cd /root/win
echo "📦 Parando container frontend..."
docker-compose stop frontend

echo "🗑️ Removendo container antigo..."
docker-compose rm -f frontend

echo "🏗️ Reconstruindo imagem do frontend..."
docker-compose build --no-cache frontend

echo "🚀 Iniciando container frontend..."
docker-compose up -d frontend

echo "✅ Frontend reconstruído com sucesso!"
docker-compose ps frontend
"@

# Salvar comandos em arquivo temporário
$commands | Out-File -FilePath "C:\Users\Usuario\Documents\win\temp-rebuild.sh" -Encoding UTF8

Write-Host "`n📋 Comandos preparados. Execute no VPS:" -ForegroundColor Yellow
Write-Host $commands -ForegroundColor Gray

Write-Host "`n⚠️ Para aplicar, execute no terminal SSH:" -ForegroundColor Yellow
Write-Host "ssh root@137.184.87.106" -ForegroundColor Green
Write-Host "cd /root/win && docker-compose up -d --build frontend" -ForegroundColor Green
