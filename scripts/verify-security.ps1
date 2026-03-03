# Script de Verificacao de Seguranca
# Execute antes de fazer push para repositorio publico

Write-Host "`nVERIFICACAO DE SEGURANCA - WIN MARKETPLACE`n" -ForegroundColor Cyan

$issues = @()

# 1. Verificar arquivos .env no diretorio
Write-Host "1. Verificando arquivos .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    $issues += "[OK] Arquivo .env encontrado (esta no .gitignore)"
}
if (Test-Path .env.vps) {
    $issues += "[OK] Arquivo .env.vps encontrado (esta no .gitignore)"
}
if (Test-Path .env.production) {
    $issues += "[CRITICO] Arquivo .env.production encontrado (REMOVER!)"
}

# 2. Verificar se .env esta sendo rastreado
Write-Host "2. Verificando rastreamento Git..." -ForegroundColor Yellow
$tracked = git ls-files .env .env.vps .env.production 2>$null
if ($tracked) {
    $issues += "[CRITICO] Arquivos .env sendo rastreados pelo Git: $tracked"
}

# 3. Verificar historico do Git
Write-Host "3. Verificando historico..." -ForegroundColor Yellow
$historyCheck = git log --all --oneline -- .env .env.vps .env.production 2>$null | Select-Object -First 10
if ($historyCheck) {
    $count = ($historyCheck | Measure-Object).Count
    $issues += "[ALERTA] $count commits com arquivos .env no historico (considerar limpeza)"
}

# 4. Verificar .gitignore
Write-Host "4. Verificando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
$requiredPatterns = @('.env', '*.key', '*.pem', 'secrets/')
foreach ($item in $requiredPatterns) {
    if ($gitignoreContent -notmatch [regex]::Escape($item)) {
        $issues += "[ALERTA] Padrao '$item' nao encontrado no .gitignore"
    }
}

# Relatorio Final
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "           RELATORIO DE SEGURANCA" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "`n[OK] NENHUM PROBLEMA ENCONTRADO!" -ForegroundColor Green
    Write-Host "`nRepositorio esta pronto para ser publico.`n" -ForegroundColor Green
} else {
    Write-Host "`n$($issues.Count) PROBLEMA(S) ENCONTRADO(S):`n" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        if ($issue -like "*CRITICO*") {
            Write-Host $issue -ForegroundColor Red
        } elseif ($issue -like "*OK*") {
            Write-Host $issue -ForegroundColor Green
        } else {
            Write-Host $issue -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nACOES RECOMENDADAS:" -ForegroundColor Cyan
    Write-Host "1. Revise os problemas acima" -ForegroundColor White
    Write-Host "2. Arquivos .env no historico podem precisar de limpeza" -ForegroundColor White
    Write-Host "3. Execute novamente apos corrigir`n" -ForegroundColor White
}

Write-Host "===============================================`n" -ForegroundColor Cyan

# Retornar codigo de saida
if ($issues | Where-Object { $_ -like "*CRITICO*" }) {
    exit 1
} else {
    exit 0
}
