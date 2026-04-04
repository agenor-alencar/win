@"
# Script para testar WebSocket e monitorar logs em tempo real

write-host "🚀 === Teste WebSocket WIN Marketplace ===" -ForegroundColor Cyan
write-host ""
write-host "1️⃣  Página de teste aberta: file:///c:/Users/user/OneDrive/Documentos/win/websocket-test.html" -ForegroundColor Yellow
write-host ""
write-host "2️⃣  Clique em [Conectar] na página para ativar WebSocket"
write-host ""  
write-host "3️⃣  Monitorando logs do backend..." -ForegroundColor Green
write-host ""

# Monitorar logs em tempo real
docker-compose logs -f backend --tail 0 | Select-String -Pattern "WebSocket|📡|📊|📍|⚠️|🔔|entrega|webhook|Processando" | ForEach-Object {
    write-host $_ -ForegroundColor Magenta
}
"@ | powershell