# ============================================
# TESTE UBER - 3 CAMINHOS PARA INTEGRAÇÃO
# ============================================
# Este script oferece 3 soluções para testar a integração Uber real
# sem ser bloqueado pelo problema de geocodificação

Write-Host "`n╔══════════════════════════════════════════════════════════════╗"
Write-Host "║                                                              ║"
Write-Host "║     INTEGRAÇÃO UBER - ESCOLHA SEU CAMINHO                    ║"
Write-Host "║                                                              ║"
Write-Host "╚══════════════════════════════════════════════════════════════╝`n"

Write-Host "PROBLEMA IDENTIFICADO:" -ForegroundColor Yellow
Write-Host "- Maps_API_KEY = vazio no .env" -ForegroundColor Yellow
Write-Host "- ViaCEP está falhando (investigar depois)" -ForegroundColor Yellow
Write-Host "- Backend tenta real Uber API mas cai no MOCK por geocoding" -ForegroundColor Yellow

Write-Host "`nOPÇÕES:" -ForegroundColor Cyan
Write-Host "
1. [RAPIDO]  CAMINHO RAPIDO (5 min)   - Teste com GPS direto (bypass geocoding)"
Write-Host "2. [CHAVE]   CAMINHO ROBUSTO (10 min) - Adicione Google Maps API"  
Write-Host "3. [DEBUG]   CAMINHO DEBUG (15 min)   - Investigue ViaCEP + Nominatim"
Write-Host "4. [SAIR]    SAIR"
Write-Host ""

$choice = Read-Host "Escolha seu caminho (1-4)"

switch($choice) {
    "1" {
        Test-ViaCEP
        Test-UberComGPS
    }
    "2" {
        Add-GoogleMapsKey
    }
    "3" {
        Debug-Geocoding
    }
    "4" {
        Write-Host "Até logo!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "Opção inválida!" -ForegroundColor Red
        exit 1
    }
}

# ============================================
# FUNÇÃO 1: CAMINHO RÁPIDO - GPS Direto
# ============================================
function Test-UberComGPS {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║ TESTE 1: Uber com GPS Direto (Bypass Geocodificação)       ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n"
    
    Write-Host "Testando com coordenadas reais de São Paulo..." -ForegroundColor Cyan
    Write-Host "Origem: Av Paulista, São Paulo (-23.5615, -46.6560)" -ForegroundColor Green
    Write-Host "Destino: Zona Leste, São Paulo (-23.5725, -46.6440)" -ForegroundColor Green
    Write-Host ""
    
    $body = @{
        lojistaId = "550e8400-e29b-41d4-a716-446655440000"
        cepOrigem = "01310-100"
        cepDestino = "04567-000"
        pesoTotalKg = 5.0
        
        # GPS DIRETO - PULA GEOCODIFICAÇÃO
        origemLatitude = -23.5615
        origemLongitude = -46.6560
        destinoLatitude = -23.5725
        destinoLongitude = -46.6440
    } | ConvertTo-Json
    
    Write-Host "Request Body:" -ForegroundColor Cyan
    Write-Host $body
    Write-Host ""
    
    try {
        Write-Host "POST → http://localhost:8080/api/v1/entregas/simular-frete" -ForegroundColor Magenta
        $response = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
            -Method Post `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body
        
        Write-Host ""
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host ""
        
        if ($response.mockado -eq $false) {
            Write-Host "🎯 RESULTADO REAL (não MOCK):" -ForegroundColor Green
            Write-Host "   Quote ID: $($response.quoteId)" -ForegroundColor Green
            Write-Host "   Provider: $($response.provider)" -ForegroundColor Green
            Write-Host "   Status: $($response.status)" -ForegroundColor Green
            Write-Host "   Valor: R$ $($response.valor)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  RESULTADO MOCK:" -ForegroundColor Yellow
            Write-Host "   Ainda em MOCK - significa geocoding está falhando" -ForegroundColor Yellow
            Write-Host "   Solução: Passe para Caminho 2 (Google Maps)" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Response Completo:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
    } catch {
        Write-Host "❌ ERRO:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Debug Info:" -ForegroundColor Yellow
        Write-Host $_ -ForegroundColor Yellow
    }
}

# ============================================
# FUNÇÃO 2: ADICIONAR GOOGLE MAPS KEY
# ============================================
function Add-GoogleMapsKey {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║ PASSO 1: Obter Chave Google Maps Geocoding API             ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n"
    
    Write-Host "INSTRUÇÕES AUTOMÁTICAS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Acesse: " -NoNewline
    Write-Host "https://cloud.google.com/maps-platform" -ForegroundColor Blue -NoNewline
    Write-Host " (browser vai abrir)"
    
    # Tenta abrir o browser
    try {
        Start-Process "https://cloud.google.com/maps-platform"
        Write-Host "   ✓ Browser aberto" -ForegroundColor Green
    } catch {
        Write-Host "   Abra manualmente no seu browser" -ForegroundColor Yellow
    }
    
    Write-Host "`n2. Clique em 'Get Started'"
    Write-Host "3. Selecione 'Maps' e 'Geocoding API'"
    Write-Host "4. Crie um projeto ou selecione existente"
    Write-Host "5. Ative a API"
    Write-Host "6. Vá em 'Credenciais' → 'Criar Credencial' → 'Chave API'"
    Write-Host "7. Copie a chave (formato: AIzaSyXXXXXXXXXXXXXXXX)"
    
    Write-Host "`n" -ForegroundColor Cyan
    $apiKey = Read-Host "Cole aqui sua Google Maps API Key (ou Enter para ignorar)"
    
    if (![string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "`nAtualizando .env com a chave..." -ForegroundColor Cyan
        
        # Lê o .env
        $envPath = "c:\Users\user\OneDrive\Documentos\win\.env"
        $envContent = Get-Content $envPath -Raw
        
        # Substitui Maps_API_KEY
        $envContent = $envContent -replace 'Maps_API_KEY=.*', "Maps_API_KEY=$apiKey"
        
        # Salva
        Set-Content $envPath -Value $envContent
        
        Write-Host "✅ .env atualizado!" -ForegroundColor Green
        Write-Host "   Maps_API_KEY=$apiKey" -ForegroundColor Green
        
        # Reinicia backend
        Write-Host "`nReiniciando backend..." -ForegroundColor Cyan
        docker restart win-marketplace-backend
        
        Write-Host "✅ Backend reiniciado!" -ForegroundColor Green
        Write-Host "Aguarde 15 segundos para ele inicializar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Testa novamente
        Write-Host "`nTestando integração com Google Maps..." -ForegroundColor Cyan
        Test-UberComGPS
        
    } else {
        Write-Host "Chave não fornecida. Voltando..." -ForegroundColor Yellow
    }
}

# ============================================
# FUNÇÃO 3: DEBUG GEOCODING
# ============================================
function Debug-Geocoding {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║ DEBUG: Testando Serviço de Geocodificação                  ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n"
    
    # 1. Teste ViaCEP
    Write-Host "1️⃣  Testando ViaCEP..." -ForegroundColor Cyan
    try {
        $viaCepResult = Invoke-RestMethod -Uri "https://viacep.com.br/ws/01310100/json/"
        Write-Host "   ✅ ViaCEP OK" -ForegroundColor Green
        Write-Host "   CEP 01310-100: $($viaCepResult.logradouro), $($viaCepResult.localidade) - $($viaCepResult.uf)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ ViaCEP FALHA" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 2. Teste Nominatim
    Write-Host "`n2️⃣  Testando Nominatim/OpenStreetMap..." -ForegroundColor Cyan
    try {
        $nominatimResult = Invoke-RestMethod `
            -Uri "https://nominatim.openstreetmap.org/search?q=Avenida%20Paulista%20Sao%20Paulo&format=json&limit=1" `
            -Headers @{"User-Agent"="WinMarketplace"}
        
        if ($nominatimResult) {
            Write-Host "   ✅ Nominatim OK" -ForegroundColor Green
            Write-Host "   Resultado: $($nominatimResult[0].display_name)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Nominatim sem resultado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Nominatim FALHA" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 3. Teste GeocodingService do backend
    Write-Host "`n3️⃣  Testando GeocodingService do Backend..." -ForegroundColor Cyan
    try {
        $geocodingBody = @{
            cep = "01310-100"
        } | ConvertTo-Json
        
        $geocodingResult = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/geocoding/by-cep" `
            -Method Post `
            -Headers @{"Content-Type"="application/json"} `
            -Body $geocodingBody
        
        Write-Host "   ✅ Backend Geocoding OK" -ForegroundColor Green
        Write-Host "   Latitude: $($geocodingResult.latitude)" -ForegroundColor Green
        Write-Host "   Longitude: $($geocodingResult.longitude)" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Backend Geocoding FALHA" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        
        # Mostra logs do backend
        Write-Host "`n   Mostrando logs do backend..." -ForegroundColor Yellow
        docker logs win-marketplace-backend --since 2m 2>&1 | grep -i "geocod|error|exception" | Select-Object -Last 10
    }
    
    # 4. Resumo
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "📋 RESUMO:" -ForegroundColor Cyan
    Write-Host "   - Se ViaCEP OK + Backend KO → problema na integração backend" -ForegroundColor Gray
    Write-Host "   - Se ViaCEP KO → use Nominatim como fallback" -ForegroundColor Gray
    Write-Host "   - Se ambas KO → use GPS direto ou Google Maps API" -ForegroundColor Gray
}

# ============================================
# FUNÇÃO 0: TESTE VIACEP
# ============================================
function Test-ViaCEP {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗"
    Write-Host "║ PRÉ-TESTE: Verificando ViaCEP Accessibility                ║"
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n"
    
    try {
        $result = Invoke-WebRequest -Uri "https://viacep.com.br/ws/01310100/json/" -UseBasicParsing
        Write-Host "✅ ViaCEP está ACESSÍVEL" -ForegroundColor Green
        Write-Host "   Status: $($result.StatusCode) OK" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  ViaCEP está INACESSÍVEL" -ForegroundColor Yellow
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Possível causa: Firewall/Proxy bloqueando" -ForegroundColor Yellow
    }
    Write-Host ""
}
