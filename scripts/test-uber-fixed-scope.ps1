$body = @{
    pickup_location = @{
        address = "Rua A, 123"
        latitude = -23.5505
        longitude = -46.6333
    }
    dropoff_location = @{
        address = "Rua B, 456"
        latitude = -23.5510
        longitude = -46.6340
    }
} | ConvertTo-Json

Write-Host "🧪 Testando novo endpoint com scopes corrigidos..."
Write-Host "📍 URL: http://localhost:8080/api/v1/uber/quotes/test"
Write-Host "⏱️  Timeout: 30 segundos`n"

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8080/api/v1/uber/quotes/test" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -TimeoutSec 30 `
        -ErrorAction Stop

    Write-Host "✅ Status HTTP: $($response.StatusCode)"
    Write-Host "📦 Resposta:`n"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro na requisição:"
    Write-Host "Mensagem: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        Write-Host "Conteúdo: $($_.Exception.Response.Content.ReadAsStringAsync().Result)"
    }
}
