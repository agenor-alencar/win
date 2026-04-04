param()

Write-Host "ANALISE - Componentes Uber Delivery" -ForegroundColor Cyan

$components = @(
    @{ Name = "UberQuoteController"; Path = "backend\src\main\java\com\win\marketplace\controller\UberQuoteController.java" },
    @{ Name = "UberDeliveryController"; Path = "backend\src\main\java\com\win\marketplace\controller\UberDeliveryController.java" },
    @{ Name = "GeocodingController"; Path = "backend\src\main\java\com\win\marketplace\controller\GeocodingController.java" },
    @{ Name = "UberWebhookController"; Path = "backend\src\main\java\com\win\marketplace\controller\UberWebhookController.java" },
    @{ Name = "UberQuoteService"; Path = "backend\src\main\java\com\win\marketplace\service\UberQuoteService.java" },
    @{ Name = "UberDeliveryService"; Path = "backend\src\main\java\com\win\marketplace\service\UberDeliveryService.java" },
    @{ Name = "UberAuthService"; Path = "backend\src\main\java\com\win\marketplace\service\UberAuthService.java" },
    @{ Name = "UberWebhookService"; Path = "backend\src\main\java\com\win\marketplace\service\UberWebhookService.java" },
    @{ Name = "GeocodingService"; Path = "backend\src\main\java\com\win\marketplace\service\GeocodingService.java" },
    @{ Name = "Entrega Entity"; Path = "backend\src\main\java\com\win\marketplace\model\Entrega.java" },
    @{ Name = "EntregaRepository"; Path = "backend\src\main\java\com\win\marketplace\repository\EntregaRepository.java" },
    @{ Name = "FreteCalculador Component"; Path = "win-frontend\src\components\checkout\FreteCalculador.tsx" },
    @{ Name = "ConfirmarEntrega Component"; Path = "win-frontend\src\components\merchant\ConfirmarEntrega.tsx" },
    @{ Name = "RastreamentoEntrega Component"; Path = "win-frontend\src\components\orders\RastreamentoEntrega.tsx" },
    @{ Name = "useUberDelivery Hook"; Path = "win-frontend\src\hooks\useUberDelivery.ts" }
)

$ok = 0; $fail = 0

foreach ($comp in $components) {
    if (Test-Path $comp.Path) {
        Write-Host "OK  - $($comp.Name)" -ForegroundColor Green
        $ok++ 
    } else {
        Write-Host "FALTA - $($comp.Name)" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "RESUMO: $ok OK, $fail FALTANDO" -ForegroundColor Cyan
