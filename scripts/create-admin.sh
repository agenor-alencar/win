#!/bin/bash

# Script para criar admin via gerador de hash
# Uso: ./create-admin.sh

echo "=========================================="
echo "  CRIAR ADMIN - WIN MARKETPLACE"
echo "=========================================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

# Verificar se o backend está rodando
if ! docker ps | grep -q win-marketplace-backend; then
    echo "❌ Erro: Backend não está rodando!"
    echo "Execute: docker-compose up -d backend"
    exit 1
fi

# Solicitar dados
read -p "Email do admin: " EMAIL
read -p "Nome do admin: " NOME
read -sp "Senha: " SENHA
echo ""
read -sp "Confirme a senha: " SENHA2
echo ""

# Validar senhas
if [ "$SENHA" != "$SENHA2" ]; then
    echo "❌ Erro: Senhas não coincidem!"
    exit 1
fi

if [ ${#SENHA} -lt 8 ]; then
    echo "❌ Erro: Senha deve ter no mínimo 8 caracteres!"
    exit 1
fi

echo ""
echo "Gerando hash..."

# Gerar hash via API
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v1/dev/hash-password" \
  -H "Content-Type: application/json" \
  -d "{\"senha\":\"$SENHA\",\"email\":\"$EMAIL\",\"nome\":\"$NOME\"}")

# Extrair hash
HASH=$(echo $RESPONSE | jq -r '.hash')

if [ "$HASH" == "null" ] || [ -z "$HASH" ]; then
    echo "❌ Erro ao gerar hash!"
    echo "Resposta da API: $RESPONSE"
    exit 1
fi

echo "✅ Hash gerado com sucesso!"
echo ""
echo "Inserindo admin no banco de dados..."

# Inserir no banco com transação para inserir usuário E associar perfil ADMIN
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace <<EOF
DO \$\$
DECLARE
    v_usuario_id UUID;
    v_perfil_admin_id UUID;
BEGIN
    -- 1. Inserir ou atualizar o usuário (SEM a coluna 'role')
    INSERT INTO usuarios (id, email, senha_hash, nome, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), '$EMAIL', '$HASH', '$NOME', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET senha_hash = EXCLUDED.senha_hash, 
        nome = EXCLUDED.nome, 
        atualizado_em = NOW()
    RETURNING id INTO v_usuario_id;

    -- Se foi UPDATE (não INSERT), capturar o ID existente
    IF v_usuario_id IS NULL THEN
        SELECT id INTO v_usuario_id FROM usuarios WHERE email = '$EMAIL';
    END IF;

    -- 2. Buscar o ID do perfil 'ADMIN'
    SELECT id INTO v_perfil_admin_id FROM perfis WHERE nome = 'ADMIN';

    -- 3. Associar o usuário ao perfil ADMIN (incluindo data_atribuicao)
    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_admin_id, NOW(), NOW())
    ON CONFLICT (usuario_id, perfil_id) DO NOTHING;

    RAISE NOTICE 'Admin criado/atualizado com sucesso! Usuario ID: %', v_usuario_id;
END \$\$;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin criado/atualizado com sucesso!"
    echo ""
    echo "Credenciais:"
    echo "  Email: $EMAIL"
    echo "  Senha: [a que você digitou]"
    echo ""
    echo "Acesse: $FRONTEND_URL/login"
else
    echo ""
    echo "❌ Erro ao inserir no banco de dados!"
    exit 1
fi
