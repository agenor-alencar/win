#!/bin/bash
# Script de Recuperação Rápida do Banco de Dados
# Execute no VPS: bash recuperar-ambiente.sh

set -e

echo "=========================================="
echo "  RECUPERAÇÃO DO AMBIENTE - WIN MARKETPLACE"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
    echo "Navegue até o diretório do projeto: cd /root/win"
    exit 1
fi

echo -e "${YELLOW}📋 Passo 1: Parando containers...${NC}"
docker-compose down
echo -e "${GREEN}✅ Containers parados${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 2: Subindo containers novamente...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Containers iniciados${NC}"
echo ""

echo -e "${YELLOW}⏳ Aguardando serviços iniciarem (30 segundos)...${NC}"
sleep 30

echo -e "${YELLOW}📋 Passo 3: Verificando status dos containers...${NC}"
docker-compose ps
echo ""

echo -e "${YELLOW}📋 Passo 4: Verificando se o banco de dados foi criado...${NC}"
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\dt" || {
    echo -e "${RED}❌ Banco não criado ainda. Aguarde mais 30 segundos...${NC}"
    sleep 30
    docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\dt"
}
echo -e "${GREEN}✅ Banco de dados operacional${NC}"
echo ""

echo -e "${YELLOW}📋 Passo 5: Criando primeiro usuário ADMIN...${NC}"
echo ""
echo -e "${YELLOW}Digite os dados do administrador:${NC}"

read -p "Nome completo: " ADMIN_NAME
read -p "Email: " ADMIN_EMAIL
read -sp "Senha: " ADMIN_PASSWORD
echo ""
read -sp "Confirme a senha: " ADMIN_PASSWORD2
echo ""

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ]; then
    echo -e "${RED}❌ Erro: Senhas não coincidem!${NC}"
    exit 1
fi

if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    echo -e "${RED}❌ Erro: Senha deve ter no mínimo 8 caracteres!${NC}"
    exit 1
fi

# Gerar hash da senha
echo -e "${YELLOW}Gerando hash da senha...${NC}"
HASH_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/dev/hash-password \
    -H "Content-Type: application/json" \
    -d "{\"senha\":\"$ADMIN_PASSWORD\",\"email\":\"$ADMIN_EMAIL\",\"nome\":\"$ADMIN_NAME\"}")

PASSWORD_HASH=$(echo $HASH_RESPONSE | grep -o '"hash":"[^"]*' | cut -d'"' -f4)

if [ -z "$PASSWORD_HASH" ]; then
    echo -e "${RED}❌ Erro ao gerar hash da senha!${NC}"
    echo "Resposta: $HASH_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Hash gerado com sucesso${NC}"

# Criar usuário no banco
echo -e "${YELLOW}Inserindo admin no banco de dados...${NC}"

docker exec win-marketplace-db psql -U postgres -d win_marketplace <<EOF
DO \$\$
DECLARE
    v_usuario_id UUID;
    v_perfil_admin_id UUID;
BEGIN
    -- 1. Inserir usuário
    INSERT INTO usuarios (id, email, senha_hash, nome, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), '$ADMIN_EMAIL', '$PASSWORD_HASH', '$ADMIN_NAME', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET senha_hash = EXCLUDED.senha_hash, 
        nome = EXCLUDED.nome, 
        atualizado_em = NOW()
    RETURNING id INTO v_usuario_id;

    -- Se foi UPDATE, capturar o ID existente
    IF v_usuario_id IS NULL THEN
        SELECT id INTO v_usuario_id FROM usuarios WHERE email = '$ADMIN_EMAIL';
    END IF;

    -- 2. Buscar perfil ADMIN
    SELECT id INTO v_perfil_admin_id FROM perfis WHERE nome = 'ADMIN';

    -- 3. Associar perfil
    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_admin_id, NOW(), NOW())
    ON CONFLICT (usuario_id, perfil_id) DO NOTHING;

    RAISE NOTICE '✅ Usuário admin criado/atualizado com sucesso!';
END \$\$;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin criado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao criar admin${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  ✅ RECUPERAÇÃO CONCLUÍDA COM SUCESSO!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Dados do Admin:${NC}"
echo "   Email: $ADMIN_EMAIL"
echo "   Nome: $ADMIN_NAME"
echo ""
echo -e "${YELLOW}🌐 Acesse o sistema:${NC}"
echo "   Frontend: http://137.184.87.106:3000"
echo "   Backend:  http://137.184.87.106:8080"
echo ""
echo -e "${YELLOW}📊 Verificar logs:${NC}"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
