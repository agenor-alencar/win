# Script para popular categorias, subcategorias e produtos
# Uso: .\populate-data.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  POPULAR DADOS - WIN MARKETPLACE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o backend está rodando
$containers = docker ps --format "{{.Names}}"
if ($containers -notcontains "win-marketplace-backend") {
    Write-Host "❌ Erro: Backend não está rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Aguardando backend estar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Função para fazer requisição
function Invoke-ApiRequest {
    param (
        [string]$Url,
        [string]$Method = "POST",
        [object]$Body
    )
    
    try {
        $bodyJson = $Body | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri $Url `
            -Method $Method `
            -ContentType "application/json; charset=utf-8" `
            -Body $bodyJson
        return $response
    } catch {
        Write-Host "❌ Erro na requisição: $Url" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        return $null
    }
}

$baseUrl = "http://localhost:8080/api/v1"

# ========================================
# CRIAR CATEGORIAS
# ========================================
Write-Host ""
Write-Host "Criando Categorias..." -ForegroundColor Cyan

$categorias = @(
    @{ nome = "Eletronicos"; descricao = "Produtos eletronicos e tecnologia"; icone = "smartphone" },
    @{ nome = "Moda"; descricao = "Roupas, calcados e acessorios"; icone = "tshirt" },
    @{ nome = "Casa e Decoracao"; descricao = "Moveis e artigos para o lar"; icone = "home" },
    @{ nome = "Esportes"; descricao = "Artigos esportivos e fitness"; icone = "sports" },
    @{ nome = "Livros"; descricao = "Livros, e-books e material didatico"; icone = "book" },
    @{ nome = "Beleza"; descricao = "Cosmeticos e produtos de beleza"; icone = "beauty" },
    @{ nome = "Alimentos"; descricao = "Alimentos e bebidas"; icone = "food" },
    @{ nome = "Brinquedos"; descricao = "Brinquedos e jogos"; icone = "toys" }
)

$categoriasIds = @{}
foreach ($cat in $categorias) {
    Write-Host "  → Criando: $($cat.nome)..." -NoNewline
    $response = Invoke-ApiRequest -Url "$baseUrl/categorias" -Body $cat
    if ($response) {
        $categoriasIds[$cat.nome] = $response.id
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

# ========================================
# CRIAR SUBCATEGORIAS
# ========================================
Write-Host ""
Write-Host "📂 Criando Subcategorias..." -ForegroundColor Cyan

$subcategorias = @(
    # Eletrônicos
    @{ nome = "Smartphones"; categoriaId = "Eletrônicos" },
    @{ nome = "Notebooks"; categoriaId = "Eletrônicos" },
    @{ nome = "TVs"; categoriaId = "Eletrônicos" },
    @{ nome = "Fones de Ouvido"; categoriaId = "Eletrônicos" },
    
    # Moda
    @{ nome = "Roupas Femininas"; categoriaId = "Moda" },
    @{ nome = "Roupas Masculinas"; categoriaId = "Moda" },
    @{ nome = "Calçados"; categoriaId = "Moda" },
    @{ nome = "Acessórios"; categoriaId = "Moda" },
    
    # Casa e Decoração
    @{ nome = "Móveis"; categoriaId = "Casa e Decoração" },
    @{ nome = "Decoração"; categoriaId = "Casa e Decoração" },
    @{ nome = "Cama e Banho"; categoriaId = "Casa e Decoração" },
    
    # Esportes
    @{ nome = "Fitness"; categoriaId = "Esportes" },
    @{ nome = "Futebol"; categoriaId = "Esportes" },
    @{ nome = "Natação"; categoriaId = "Esportes" },
    
    # Livros
    @{ nome = "Ficção"; categoriaId = "Livros" },
    @{ nome = "Técnicos"; categoriaId = "Livros" },
    @{ nome = "Infantis"; categoriaId = "Livros" },
    
    # Beleza
    @{ nome = "Maquiagem"; categoriaId = "Beleza" },
    @{ nome = "Perfumes"; categoriaId = "Beleza" },
    @{ nome = "Cuidados com a Pele"; categoriaId = "Beleza" },
    
    # Alimentos
    @{ nome = "Bebidas"; categoriaId = "Alimentos" },
    @{ nome = "Snacks"; categoriaId = "Alimentos" },
    @{ nome = "Orgânicos"; categoriaId = "Alimentos" },
    
    # Brinquedos
    @{ nome = "Jogos de Tabuleiro"; categoriaId = "Brinquedos" },
    @{ nome = "Bonecas"; categoriaId = "Brinquedos" },
    @{ nome = "Carrinhos"; categoriaId = "Brinquedos" }
)

$subcategoriasIds = @{}
foreach ($sub in $subcategorias) {
    $catId = $categoriasIds[$sub.categoriaId]
    if ($catId) {
        Write-Host "  → Criando: $($sub.nome) em $($sub.categoriaId)..." -NoNewline
        $body = @{
            nome = $sub.nome
            categoriaId = $catId
        }
        $response = Invoke-ApiRequest -Url "$baseUrl/subcategorias" -Body $body
        if ($response) {
            $subcategoriasIds[$sub.nome] = $response.id
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ DADOS POPULADOS COM SUCESSO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  • Categorias: $($categoriasIds.Count)" -ForegroundColor White
Write-Host "  • Subcategorias: $($subcategoriasIds.Count)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Nota: Os produtos devem ser criados pelos lojistas através da interface." -ForegroundColor Yellow
Write-Host ""
