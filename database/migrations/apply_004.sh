#!/bin/bash
# ============================================
# Script para aplicar Migration 004
# ============================================
# Adiciona suporte ao DigitalOcean Spaces
# Bash (Linux/Mac)

echo "============================================"
echo "Migration 004: DigitalOcean Spaces Support"
echo "============================================"
echo ""

# Verificar se está na raiz do projeto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Execute este script na raiz do projeto!"
    exit 1
fi

# Opções de ambiente
echo "Escolha o ambiente:"
echo "1. Desenvolvimento (localhost)"
echo "2. Produção (Docker)"
echo ""
read -p "Digite 1 ou 2: " env

if [ "$env" = "1" ]; then
    # Desenvolvimento Local
    echo ""
    echo "📋 Conectando ao PostgreSQL local..."
    
    PGPASSWORD=postgres123 psql -U postgres -d winmarketplace -f "database/migrations/004_add_spaces_support.sql"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration aplicada com sucesso!"
    else
        echo ""
        echo "❌ Erro ao aplicar migration!"
        exit 1
    fi
    
elif [ "$env" = "2" ]; then
    # Produção Docker
    echo ""
    echo "📋 Conectando ao container PostgreSQL..."
    
    docker exec -i win-marketplace-db psql -U postgres -d winmarketplace < "database/migrations/004_add_spaces_support.sql"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration aplicada com sucesso!"
    else
        echo ""
        echo "❌ Erro ao aplicar migration!"
        exit 1
    fi
    
else
    echo "❌ Opção inválida!"
    exit 1
fi

echo ""
echo "============================================"
echo "🚀 Banco pronto para DigitalOcean Spaces!"
echo "============================================"
