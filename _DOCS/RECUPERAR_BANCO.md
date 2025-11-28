# 🔧 Guia de Recuperação do Banco de Dados

## ⚠️ Problema
Após executar `docker compose down --volumes` e `docker system prune -a --volumes`, o banco de dados PostgreSQL foi completamente apagado, incluindo:
- Todas as tabelas
- Todos os dados de usuários
- Todas as configurações
- Primeiro admin criado

## ✅ Solução: Recriar o Ambiente Completo

### Passo 1: Verificar o Estado Atual

```bash
# Verificar containers rodando
docker ps -a

# Verificar volumes (deve estar vazio)
docker volume ls
```

### Passo 2: Recriar os Containers

```bash
# Subir os containers novamente
docker-compose up -d

# Aguardar todos os serviços iniciarem (pode levar 2-3 minutos)
docker-compose logs -f
```

**Aguarde até ver as mensagens:**
- ✅ `PostgreSQL init process complete; ready for start up.`
- ✅ `Started WinMarketplaceApplication`
- ✅ `Vite server running`

Pressione `Ctrl+C` para sair dos logs.

### Passo 3: Verificar se o Banco Foi Criado

```bash
# Conectar ao container do PostgreSQL
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Dentro do psql, listar as tabelas:
\dt

# Você deve ver as tabelas: usuarios, perfis, lojistas, produtos, etc.
# Para sair:
\q
```

### Passo 4: Criar o Primeiro Usuário Admin

O banco está vazio, então você precisa criar o primeiro admin manualmente.

**OPÇÃO A: Via Script PowerShell (Windows)**

```powershell
# No diretório do projeto (win/)
.\scripts\create-admin.ps1
```

**OPÇÃO B: Via Script Bash (Linux/Mac/Git Bash)**

```bash
# No diretório do projeto (win/)
./scripts/create-admin.sh
```

**OPÇÃO C: Via Endpoint da API (Recomendado)**

```bash
# Gerar hash da senha primeiro
curl -X POST http://localhost:8080/api/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin@123"}'

# Copie o hash retornado e execute:
curl -X POST http://localhost:8080/api/dev/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@winmarketplace.com",
    "senhaHash": "COLE_O_HASH_AQUI",
    "cpf": "000.000.000-00"
  }'
```

### Passo 5: Popular Dados de Exemplo (Opcional)

Se quiser popular com categorias e produtos de exemplo:

```bash
# Conectar ao banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Dentro do psql, executar os seeds:
\i /docker-entrypoint-initdb.d/seeds/02-subcategorias.sql
\i /docker-entrypoint-initdb.d/seeds/03-corrigir-hierarquia.sql

# Sair
\q
```

### Passo 6: Testar o Login

1. **Acessar o frontend**: http://localhost:3000 (ou seu domínio)
2. **Fazer login com o admin criado**:
   - Email: `admin@winmarketplace.com`
   - Senha: `Admin@123` (ou a que você definiu)
3. **Verificar se consegue acessar o painel admin**

### Passo 7: Criar Novo Lojista (Se Necessário)

Se você perdeu o lojista e quer criar um novo:

1. **Login como Admin**
2. **Ir para Painel Admin > Usuários**
3. **Criar novo usuário com perfil "LOJISTA"**
4. **Acessar /api/v1/lojistas** para criar o perfil de lojista

Ou via API:

```bash
# 1. Fazer login e pegar o token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@winmarketplace.com",
    "password": "Admin@123"
  }'

# 2. Criar usuário lojista
curl -X POST http://localhost:8080/api/v1/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Diogo Cerqueira",
    "email": "jcferagensbb@gmail.com",
    "senha": "SuaSenhaForte@123",
    "cpf": "068.089.751-83",
    "telefone": "(00) 90000-0000",
    "perfis": ["LOJISTA"]
  }'

# 3. Criar perfil de lojista
# Use o usuarioId retornado acima
curl -X POST http://localhost:8080/api/v1/lojistas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "usuarioId": "COLE_O_ID_DO_USUARIO",
    "nomeFantasia": "Ferragens Premium",
    "razaoSocial": "JC Ferragens LTDA",
    "cnpj": "12.345.678/0001-90",
    "descricao": "Loja de ferragens e materiais de construção"
  }'
```

## 🔍 Troubleshooting

### Problema: "Connection refused" ao acessar API

```bash
# Verificar logs do backend
docker-compose logs backend

# Reiniciar o backend
docker-compose restart backend
```

### Problema: "Database not found"

```bash
# Recriar o banco manualmente
docker exec -it win-marketplace-db psql -U postgres -c "CREATE DATABASE win_marketplace;"

# Reiniciar o backend para executar migrations
docker-compose restart backend
```

### Problema: Tabelas não foram criadas

```bash
# Verificar configuração do Hibernate
docker-compose logs backend | grep "hibernate"

# Forçar recriação das tabelas (CUIDADO: apaga dados!)
# Edite .env e adicione:
# HIBERNATE_DDL_AUTO=create

# Depois reinicie:
docker-compose down
docker-compose up -d

# Depois de criar as tabelas, volte para:
# HIBERNATE_DDL_AUTO=update
```

## 📝 Prevenção Futura

### ⚠️ NUNCA mais execute estes comandos em produção:

```bash
# ❌ PERIGOSO - Apaga TODOS os dados
docker compose down --volumes --remove-orphans
docker system prune -a --volumes -f
```

### ✅ Use estes comandos seguros:

```bash
# Parar containers mantendo dados
docker-compose down

# Reiniciar containers
docker-compose restart

# Recriar apenas um serviço específico
docker-compose up -d --force-recreate backend

# Ver logs
docker-compose logs -f [backend|frontend|postgres]
```

### 💾 Fazer Backup Regular

```bash
# Backup completo do banco
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i win-marketplace-db psql -U postgres win_marketplace < backup_20251127.sql
```

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Verifique se as portas estão livres: `netstat -ano | findstr ":8080"`
3. Verifique o .env tem as configurações corretas
4. Tente rebuild completo: `docker-compose build --no-cache`
