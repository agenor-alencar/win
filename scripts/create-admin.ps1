# Script para criar admin via gerador de hash (Windows)
# Uso: .\create-admin.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  CRIAR ADMIN - WIN MARKETPLACE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$BackendUrl = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "http://localhost:8080" }
$FrontendUrl = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { "http://localhost:3000" }

# Verificar se o backend está rodando
$containers = docker ps --format "{{.Names}}"
if ($containers -notcontains "win-marketplace-backend") {
    Write-Host "❌ Erro: Backend não está rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d backend" -ForegroundColor Yellow
    exit 1
}

# Solicitar dados
$Email = Read-Host "Email do admin"
$Nome = Read-Host "Nome do admin"
$Senha = Read-Host "Senha" -AsSecureString
$Senha2 = Read-Host "Confirme a senha" -AsSecureString

# Converter SecureString para texto
$SenhaTexto = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Senha))
$Senha2Texto = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Senha2))

# Validar senhas
if ($SenhaTexto -ne $Senha2Texto) {
    Write-Host "❌ Erro: Senhas não coincidem!" -ForegroundColor Red
    exit 1
}

if ($SenhaTexto.Length -lt 8) {
    Write-Host "❌ Erro: Senha deve ter no mínimo 8 caracteres!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Gerando hash..." -ForegroundColor Yellow

# Preparar JSON
$body = @{
    senha = $SenhaTexto
    email = $Email
    nome = $Nome
} | ConvertTo-Json

# Gerar hash via API
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/v1/dev/hash-password" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    $hash = $response.hash
    
    if ([string]::IsNullOrEmpty($hash)) {
        Write-Host "❌ Erro ao gerar hash!" -ForegroundColor Red
        Write-Host "Resposta da API: $($response | ConvertTo-Json)" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Hash gerado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao conectar com a API!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Inserindo admin no banco de dados..." -ForegroundColor Yellow

# Preparar SQL com transação para inserir usuário E associar perfil ADMIN
$sql = @"
DO `$`$
DECLARE
    v_usuario_id UUID;
    v_perfil_admin_id UUID;
BEGIN
    -- 1. Inserir ou atualizar o usuário (SEM a coluna 'role')
    INSERT INTO usuarios (id, email, senha_hash, nome, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), '$Email', '$hash', '$Nome', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET senha_hash = EXCLUDED.senha_hash, 
        nome = EXCLUDED.nome, 
        atualizado_em = NOW()
    RETURNING id INTO v_usuario_id;

    -- Se foi UPDATE (não INSERT), capturar o ID existente
    IF v_usuario_id IS NULL THEN
        SELECT id INTO v_usuario_id FROM usuarios WHERE email = '$Email';
    END IF;

    -- 2. Buscar o ID do perfil 'ADMIN'
    SELECT id INTO v_perfil_admin_id FROM perfis WHERE nome = 'ADMIN';

    -- 3. Associar o usuário ao perfil ADMIN (incluindo data_atribuicao)
    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_admin_id, NOW(), NOW())
    ON CONFLICT (usuario_id, perfil_id) DO NOTHING;

    RAISE NOTICE 'Admin criado/atualizado com sucesso! Usuario ID: %', v_usuario_id;
END `$`$;
"@

# Inserir no banco
try {
    $result = docker exec -i win-marketplace-db psql -U postgres -d win_marketplace -c $sql 2>&1
    
    # Verificar se houve erro
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Erro ao inserir no banco de dados!" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Admin criado/atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Credenciais:" -ForegroundColor Cyan
    Write-Host "  Email: $Email" -ForegroundColor White
    Write-Host "  Senha: [a que você digitou]" -ForegroundColor White
    Write-Host ""
    Write-Host "Acesse: $FrontendUrl/login" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao inserir no banco de dados!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}
