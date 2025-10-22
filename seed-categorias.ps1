# Script para cadastrar categorias padrão no sistema
# Execute este script para popular o banco de dados com categorias iniciais

Write-Host "=== Cadastrando Categorias Padrão ===" -ForegroundColor Cyan
Write-Host ""

# Token de admin (você precisa fazer login como admin primeiro)
Write-Host "ATENÇÃO: Você precisa estar logado como ADMIN para executar este script." -ForegroundColor Yellow
Write-Host "Pressione qualquer tecla para continuar ou Ctrl+C para cancelar..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Solicitar token
Write-Host ""
$token = Read-Host "Cole o token JWT do admin aqui"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Categorias principais
$categorias = @(
    @{
        nome = "Eletrônicos"
        descricao = "Produtos eletrônicos em geral"
    },
    @{
        nome = "Moda e Vestuário"
        descricao = "Roupas, calçados e acessórios"
    },
    @{
        nome = "Casa e Decoração"
        descricao = "Produtos para casa e decoração"
    },
    @{
        nome = "Esportes e Lazer"
        descricao = "Artigos esportivos e de lazer"
    },
    @{
        nome = "Livros e Papelaria"
        descricao = "Livros, revistas e artigos de papelaria"
    },
    @{
        nome = "Alimentos e Bebidas"
        descricao = "Produtos alimentícios e bebidas"
    },
    @{
        nome = "Beleza e Cuidados Pessoais"
        descricao = "Cosméticos e produtos de higiene"
    },
    @{
        nome = "Brinquedos e Jogos"
        descricao = "Brinquedos, jogos e entretenimento"
    },
    @{
        nome = "Automotivo"
        descricao = "Peças e acessórios automotivos"
    },
    @{
        nome = "Ferramentas e Construção"
        descricao = "Ferramentas e materiais de construção"
    }
)

$sucessos = 0
$falhas = 0

foreach ($categoria in $categorias) {
    try {
        $body = $categoria | ConvertTo-Json -Depth 10
        
        Write-Host "Cadastrando: $($categoria.nome)..." -NoNewline
        
        $response = Invoke-RestMethod `
            -Uri "http://localhost:8080/api/v1/categoria/create" `
            -Method POST `
            -Headers $headers `
            -Body $body
        
        Write-Host " ✓ Sucesso" -ForegroundColor Green
        $sucessos++
    }
    catch {
        Write-Host " ✗ Falhou" -ForegroundColor Red
        Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Red
        $falhas++
    }
}

Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Cyan
Write-Host "Sucessos: $sucessos" -ForegroundColor Green
Write-Host "Falhas: $falhas" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
