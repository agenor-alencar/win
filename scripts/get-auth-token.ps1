# =================================================================
# 🔐 SCRIPT DE AUTENTICAÇÃO - Obter Token JWT
# =================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:8080",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = "admin@winmarketplace.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Senha = "admin123"
)

Write-Host "🔐 Tentando obter Token JWT..." -ForegroundColor Cyan

try {
    # Preparar dados de login
    $body = @{
        email = $Email
        senha = $Senha
    } | ConvertTo-Json
    
    # Tentar endpoints comuns de login
    $endpoints = @(
        "/api/v1/auth/login",
        "/api/auth/login",
        "/api/v1/login",
        "/login"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            Write-Host "Tentando: $BaseUrl$endpoint..." -ForegroundColor Yellow
            
            $response = Invoke-RestMethod `
                -Uri "$BaseUrl$endpoint" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body `
                -TimeoutSec 5
            
            if ($response.token) {
                Write-Host "✅ Token obtido com sucesso!" -ForegroundColor Green
                Write-Host "Token: $($response.token)" -ForegroundColor Cyan
                
                # Guardar em variável de ambiente
                $env:JWT_TOKEN = $response.token
                
                # Salvar em arquivo
                $response.token | Out-File "jwt-token.txt" -Encoding ASCII
                Write-Host "Token salvo em: jwt-token.txt" -ForegroundColor Green
                
                exit 0
            }
        }
        catch {
            # Continuar tentando outros endpoints
        }
    }
    
    Write-Host "❌ Nenhum endpoint de login respondeu" -ForegroundColor Red
    Write-Host "Verifique se o servidor está rodando em $BaseUrl" -ForegroundColor Yellow
    
}
catch {
    Write-Host "❌ Erro ao tentar autenticação: $($_.Exception.Message)" -ForegroundColor Red
}
