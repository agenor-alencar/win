# 🚨 RECUPERAÇÃO RÁPIDA - Comandos para o VPS

## O que aconteceu?
Você executou `docker compose down --volumes` que **apagou todo o banco de dados PostgreSQL**.

## ✅ Solução Rápida (2 minutos)

### No VPS, execute:

```bash
# 1. Entrar no diretório do projeto
cd /root/win

# 2. Parar containers (se estiverem rodando)
docker-compose down

# 3. Subir containers novamente
docker-compose up -d

# 4. Aguardar 30 segundos para serviços iniciarem
sleep 30

# 5. Verificar logs (Ctrl+C para sair)
docker-compose logs -f
```

Aguarde até ver:
- ✅ `PostgreSQL init process complete`
- ✅ `Started WinMarketplaceApplication`

### Criar Primeiro Admin

```bash
# OPÇÃO A: Script Automatizado (RECOMENDADO)
bash scripts/recuperar-ambiente.sh
```

**OU**

```bash
# OPÇÃO B: Manual (passo a passo)

# 1. Gerar hash da senha
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"Admin@123","email":"admin@winmarketplace.com","nome":"Administrador"}'

# Copie o hash retornado (algo como: $2a$10$abcd...)

# 2. Criar admin no banco (cole o hash no lugar de COLE_O_HASH_AQUI)
docker exec win-marketplace-db psql -U postgres -d win_marketplace <<EOF
DO \$\$
DECLARE
    v_usuario_id UUID;
    v_perfil_admin_id UUID;
BEGIN
    INSERT INTO usuarios (id, email, senha_hash, nome, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'admin@winmarketplace.com', 'COLE_O_HASH_AQUI', 'Administrador', true, NOW(), NOW())
    RETURNING id INTO v_usuario_id;

    SELECT id INTO v_perfil_admin_id FROM perfis WHERE nome = 'ADMIN';

    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_admin_id, NOW(), NOW());
END \$\$;
EOF
```

### Criar Lojista (Exemplo: Diogo)

```bash
# 1. Gerar hash da senha do lojista
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"SuaSenha@123","email":"jcferagensbb@gmail.com","nome":"Diogo Cerqueira"}'

# 2. Criar lojista no banco (substitua o hash)
docker exec win-marketplace-db psql -U postgres -d win_marketplace <<'EOF'
DO $$
DECLARE
    v_usuario_id UUID;
    v_perfil_lojista_id UUID;
    v_lojista_id UUID;
BEGIN
    -- Criar usuário
    INSERT INTO usuarios (id, email, senha_hash, nome, cpf, telefone, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'jcferagensbb@gmail.com', 'COLE_O_HASH_AQUI', 'Diogo Cerqueira', '068.089.751-83', '(00) 90000-0000', true, NOW(), NOW())
    RETURNING id INTO v_usuario_id;

    -- Associar perfil LOJISTA
    SELECT id INTO v_perfil_lojista_id FROM perfis WHERE nome = 'LOJISTA';
    INSERT INTO usuario_perfis (usuario_id, perfil_id, criado_em, data_atribuicao)
    VALUES (v_usuario_id, v_perfil_lojista_id, NOW(), NOW());

    -- Criar perfil de lojista
    INSERT INTO lojistas (id, usuario_id, nome_fantasia, razao_social, cnpj, descricao, ativo, criado_em, atualizado_em)
    VALUES (
        gen_random_uuid(),
        v_usuario_id,
        'Ferragens Premium',
        'JC Ferragens LTDA',
        '12.345.678/0001-90',
        'Loja de ferragens e materiais de construção',
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_lojista_id;

    RAISE NOTICE 'Lojista criado com sucesso! ID: %', v_lojista_id;
END $$;
EOF
```

## 🔍 Verificação

```bash
# Verificar se admin foi criado
docker exec win-marketplace-db psql -U postgres -d win_marketplace \
  -c "SELECT u.nome, u.email, p.nome as perfil FROM usuarios u JOIN usuario_perfis up ON u.id = up.usuario_id JOIN perfis p ON up.perfil_id = p.id WHERE u.email = 'admin@winmarketplace.com';"

# Verificar se lojista foi criado
docker exec win-marketplace-db psql -U postgres -d win_marketplace \
  -c "SELECT l.nome_fantasia, u.nome, u.email FROM lojistas l JOIN usuarios u ON l.usuario_id = u.id;"

# Ver todos os usuários
docker exec win-marketplace-db psql -U postgres -d win_marketplace \
  -c "SELECT u.nome, u.email, array_agg(p.nome) as perfis FROM usuarios u JOIN usuario_perfis up ON u.id = up.usuario_id JOIN perfis p ON up.perfil_id = p.id GROUP BY u.id, u.nome, u.email;"
```

## 🧪 Teste de Login

```bash
# Testar login do admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@winmarketplace.com","password":"Admin@123"}'

# Deve retornar um token JWT
```

## 🌐 Acessar Sistema

- **Frontend**: http://137.184.87.106
- **Backend**: http://137.184.87.106:8080
- **API Docs**: http://137.184.87.106:8080/swagger-ui.html

## ⚠️ Comandos Perigosos - NUNCA Mais Use

```bash
# ❌ NUNCA EXECUTE EM PRODUÇÃO
docker compose down --volumes --remove-orphans  # Apaga TODOS os dados
docker system prune -a --volumes -f             # Remove TUDO do Docker
```

## ✅ Comandos Seguros

```bash
# Parar containers mantendo dados
docker-compose down

# Reiniciar tudo
docker-compose restart

# Ver logs
docker-compose logs -f [backend|frontend|postgres]

# Rebuild apenas um serviço
docker-compose up -d --force-recreate backend
```

## 💾 Fazer Backup (IMPORTANTE!)

```bash
# Backup do banco
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i win-marketplace-db psql -U postgres win_marketplace < backup_20251127_203000.sql
```

## 📞 Problemas?

1. **Backend não sobe**: `docker-compose logs backend`
2. **Erro de conexão**: `docker-compose restart postgres backend`
3. **Tabelas não criadas**: Aguarde 1-2 minutos após `docker-compose up -d`
4. **Port already in use**: `docker-compose down` e depois `docker-compose up -d`

## 🎯 Resumo do Fluxo

1. ✅ `docker-compose down` (sem --volumes!)
2. ✅ `docker-compose up -d`
3. ✅ Aguardar 30s
4. ✅ Executar `bash scripts/recuperar-ambiente.sh`
5. ✅ Testar login no frontend

Pronto! Sistema recuperado. 🎉
