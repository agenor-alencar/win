#!/bin/bash

# Script para testar criação de categoria via API
# Substitua TOKEN_AQUI pelo token JWT real do admin

# Obter token do admin (você precisa fazer login primeiro)
echo "=== Fazendo login como admin ==="
LOGIN_RESPONSE=$(curl -s -X POST https://winmarketplace.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agenoralencaar@gmail.com",
    "password": "Gatinha@123"
  }')

echo "Resposta do login:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extrair token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Erro: Não foi possível obter o token. Verifique as credenciais."
  exit 1
fi

echo ""
echo "✅ Token obtido: ${TOKEN:0:50}..."
echo ""

# Tentar criar categoria
echo "=== Criando categoria de teste ==="
CREATE_RESPONSE=$(curl -s -X POST https://winmarketplace.com.br/api/v1/categoria/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Ferragens Teste",
    "descricao": "Categoria de teste criada via curl",
    "icone": "Wrench"
  }')

echo "Resposta da criação:"
echo "$CREATE_RESPONSE" | jq '.'

# Status code
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://winmarketplace.com.br/api/v1/categoria/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Ferragens Teste 2",
    "descricao": "Categoria de teste 2",
    "icone": "Wrench"
  }')

echo ""
echo "Status Code: $STATUS"
