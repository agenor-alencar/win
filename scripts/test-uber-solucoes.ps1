# ============================================
# TESTE UBER - 3 CAMINHOS PARA INTEGRACAO
# ============================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "INTEGRACAO UBER - ESCOLHA SEU CAMINHO" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

Write-Host "PROBLEMA IDENTIFICADO:" -ForegroundColor Yellow
Write-Host "- Maps_API_KEY = vazio no .env"
Write-Host "- ViaCEP esta falhando (investigar depois)"
Write-Host "- Backend tenta real Uber API mas cai no MOCK por geocoding"
Write-Host ""

Write-Host "OPCOES:" -ForegroundColor Cyan
Write-Host "1. [RAPIDO]  - Teste com GPS direto (bypass geocoding) - 5 MIN"
Write-Host "2. [CHAVE]   - Adicione Google Maps API - 10 MIN"  
Write-Host "3. [DEBUG]   - Investigue ViaCEP + Nominatim - 15 MIN"
Write-Host "4. [SAIR]    - Sair"
Write-Host ""

$choice = Read-Host "Escolha opcao (1-4)"

function Test-UberComGPS {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "TESTE: Uber com GPS Direto" -ForegroundColor Green
    Write-Host "=========================================`n" -ForegroundColor Green
    
    Write-Host "Testando com coordenadas reais de Sao Paulo..." -ForegroundColor Cyan
    Write-Host "Origem: Av Paulista, Sao Paulo (-23.5615, -46.6560)" -ForegroundColor Green
    Write-Host "Destino: Zona Leste, Sao Paulo (-23.5725, -46.6440)" -ForegroundColor Green
    Write-Host ""
    
    $body = @{
        lojistaId = "550e8400-e29b-41d4-a716-446655440000"
        cepOrigem = "01310-100"
        cepDestino = "04567-000"
        pesoTotalKg = 5.0
        
        # OBRIGATORIO: Endereco completo
        enderecoOrigemCompleto = "Avenida Paulista 1000, Sao Paulo, SP"
        enderecoDestinoCompleto = "Rua Maria Prestes 500, Sao Paulo, SP"
        
        # Opcional: Dados de contato
        nomeLojista = "Loja Teste"
        telefoneLojista = "1133334444"
        nomeCliente = "Cliente Teste"
        telefoneCliente = "1122223333"
        
        # Opcional: GPS DIRETO - PULA GEOCODIFICACAO
        origemLatitude = -23.5615
        origemLongitude = -46.6560
        destinoLatitude = -23.5725
        destinoLongitude = -46.6440
    } | ConvertTo-Json
    
    Write-Host "Request Body:" -ForegroundColor Cyan
    Write-Host $body
    Write-Host ""
    
    try {
        Write-Host "POST -> http://localhost:8080/api/v1/entregas/simular-frete" -ForegroundColor Magenta
        $response = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
            -Method Post `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body
        
        Write-Host ""
        Write-Host "[OK] SUCESSO!" -ForegroundColor Green
        Write-Host ""
        
        if ($response.mockado -eq $false) {
            Write-Host "[REAL] RESULTADO REAL (nao MOCK):" -ForegroundColor Green
            Write-Host "   Quote ID: $($response.quoteId)" 
            Write-Host "   Provider: $($response.provider)" 
            Write-Host "   Status: $($response.status)" 
            Write-Host "   Valor: R$ $($response.valor)" 
        } else {
            Write-Host "[MOCK] RESULTADO MOCK:" -ForegroundColor Yellow
            Write-Host "   Ainda em MOCK - geocoding falhou" 
            Write-Host "   Proxima etapa: Use opcao 2 (Google Maps)" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Response Completo:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10
        
    } catch {
        Write-Host "[ERRO] FALHA:" -ForegroundColor Red
        Write-Host $_.Exception.Message
        Write-Host ""
    }
}

function Add-GoogleMapsKey {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Blue
    Write-Host "PASSO 1: Obter Chave Google Maps API" -ForegroundColor Blue
    Write-Host "=========================================`n" -ForegroundColor Blue
    
    Write-Host "INSTRUCOES:" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://cloud.google.com/maps-platform"
    Write-Host "2. Clique em 'Get Started'"
    Write-Host "3. Selecione 'Maps' e 'Geocoding API'"
    Write-Host "4. Crie um projeto ou selecione existente"
    Write-Host "5. Ative a API"
    Write-Host "6. Va em Credenciais -> Crie Credencial -> Chave API"
    Write-Host "7. Copie a chave (formato: AIzaSyXXXXXXXXXXXXXXXX)"
    
    Write-Host ""
    Write-Host "Abrindo browser..." -ForegroundColor Cyan
    Start-Process "https://cloud.google.com/maps-platform" -ErrorAction SilentlyContinue
    
    Write-Host ""
    $apiKey = Read-Host "Cole sua Google Maps API Key aqui"
    
    if (![string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host ""
        Write-Host "Atualizando .env..." -ForegroundColor Cyan
        
        $envPath = "c:\Users\user\OneDrive\Documentos\win\.env"
        $envContent = Get-Content $envPath -Raw
        
        # Substitui Maps_API_KEY
        $envContent = $envContent -replace 'Maps_API_KEY=.*', "Maps_API_KEY=$apiKey"
        
        Set-Content $envPath -Value $envContent
        
        Write-Host "[OK] .env atualizado!" -ForegroundColor Green
        Write-Host "   Maps_API_KEY=$apiKey"
        
        # Reinicia backend  
        Write-Host ""
        Write-Host "Reiniciando backend..." -ForegroundColor Cyan
        docker restart win-marketplace-backend
        
        Write-Host "[OK] Backend reiniciado!" -ForegroundColor Green
        Write-Host "Aguarde 15 segundos para inicializar..." -ForegroundColor Yellow
        
        for ($i = 0; $i -lt 15; $i++) {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 1
        }
        Write-Host ""
        
        # Testa
        Write-Host ""
        Test-UberComGPS
        
    } else {
        Write-Host "Chave nao fornecida." -ForegroundColor Yellow
    }
}

function Debug-Geocoding {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Magenta
    Write-Host "DEBUG: Testando Servico de Geocodificacao" -ForegroundColor Magenta
    Write-Host "=========================================`n" -ForegroundColor Magenta
    
    # 1. ViaCEP
    Write-Host "1. Testando ViaCEP..." -ForegroundColor Cyan
    try {
        $viaCepResult = Invoke-RestMethod -Uri "https://viacep.com.br/ws/01310100/json/"
        Write-Host "   [OK] ViaCEP esta acessivel" -ForegroundColor Green
        Write-Host "   CEP 01310-100: $($viaCepResult.logradouro), $($viaCepResult.localidade)"
    } catch {
        Write-Host "   [ERRO] ViaCEP nao esta acessivel" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" 
    }
    
    # 2. Nominatim
    Write-Host ""
    Write-Host "2. Testando Nominatim/OpenStreetMap..." -ForegroundColor Cyan
    try {
        $nominatimResult = Invoke-RestMethod `
            -Uri "https://nominatim.openstreetmap.org/search?q=Avenida%20Paulista%20Sao%20Paulo&format=json&limit=1" `
            -Headers @{"User-Agent"="WinMarketplace"}
        
        if ($nominatimResult) {
            Write-Host "   [OK] Nominatim esta acessivel" -ForegroundColor Green
            Write-Host "   Resultado: $($nominatimResult[0].display_name)"
        } else {
            Write-Host "   [VAZIO] Nominatim sem resultado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   [ERRO] Nominatim nao esta acessivel" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)"
    }
    
    # 3. Backend
    Write-Host ""
    Write-Host "3. Testando GeocodingService Backend..." -ForegroundColor Cyan
    try {
        $geocodingBody = @{ cep = "01310-100" } | ConvertTo-Json
        
        $geocodingResult = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/geocoding/by-cep" `
            -Method Post `
            -Headers @{"Content-Type"="application/json"} `
            -Body $geocodingBody
        
        Write-Host "   [OK] Backend Geocoding funciona" -ForegroundColor Green
        Write-Host "   Latitude: $($geocodingResult.latitude)"
        Write-Host "   Longitude: $($geocodingResult.longitude)"
        
    } catch {
        Write-Host "   [ERRO] Backend Geocoding falha" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)"
    }
    
    # Resumo
    Write-Host ""
    Write-Host "ANALISE:" -ForegroundColor Cyan
    Write-Host "- Se ViaCEP OK + Backend KO -> problema na integracao backend"
    Write-Host "- Se ViaCEP KO -> use Nominatim ou Google Maps"
    Write-Host "- Se ambas KO -> use GPS direto ou Google Maps API"
}

switch($choice) {
    "1" {
        Test-UberComGPS
    }
    "2" {
        Add-GoogleMapsKey
    }
    "3" {
        Debug-Geocoding
    }
    "4" {
        Write-Host "Ate logo!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "Opcao invalida!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "CONCLUSAO" -ForegroundColor Green  
Write-Host "=========================================`n" -ForegroundColor Green

Write-Host "Proximos passos:"
Write-Host "1. Se teste passou REAL (nao MOCK) -> integracao Uber OK"
Write-Host "2. Agora testar fluxo completo com pedidos reais"
Write-Host "3. Validar PIN_VALIDACOES com entregas"
Write-Host ""
