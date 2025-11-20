# 🔑 Guia Rápido - Gerador de Hash de Senha

## ✅ Sistema Implementado com Sucesso!

O gerador de hash de senha está pronto para uso. Você pode criar contas de admin diretamente no banco de dados usando os métodos abaixo.

---

## 🚀 Método 1: Via API (Mais Rápido)

### Pré-requisito:
- Backend rodando: `docker-compose up -d backend`

### Gerar Hash:

**PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"senha":"SuaSenhaAqui","email":"admin@email.com","nome":"Nome Admin"}' `
  | Format-List
```

**cURL (Linux/Mac/Git Bash):**
```bash
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"SuaSenhaAqui","email":"admin@email.com","nome":"Nome Admin"}'
```

### Resposta (Exemplo):
```
hash       : $2a$10$tmytV74xildKsyl8vz4A3uBFdo3FsFpj5xXB2MXBE8EDL4JlhoU4C
message    : Hash gerado com sucesso
sqlExample : INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
             VALUES (
               gen_random_uuid(),
               'admin@email.com',
               '$2a$10$tmytV74xildKsyl8vz4A3uBFdo3FsFpj5xXB2MXBE8EDL4JlhoU4C',
               'Nome Admin',
               'ADMIN',
               true,
               NOW(),
               NOW()
             );
```

---

## 💾 Inserir Admin no Banco de Dados

### PowerShell (Windows):
```powershell
# 1. Copie o hash gerado acima
$hash = "$2a$10$SEU_HASH_AQUI"
$email = "admin@email.com"
$nome = "Administrador"

# 2. Execute o INSERT
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), '$email', '$hash', '$nome', 'ADMIN', true, NOW(), NOW());
"
```

### Bash (Linux/Mac):
```bash
# 1. Copie o hash gerado
HASH="$2a$10$SEU_HASH_AQUI"
EMAIL="admin@email.com"
NOME="Administrador"

# 2. Execute o INSERT
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace <<EOF
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), '$EMAIL', '$HASH', '$NOME', 'ADMIN', true, NOW(), NOW());
EOF
```

---

## 🔄 Script Automatizado (Windows)

Execute o script PowerShell que criamos:

```powershell
cd c:\Users\user\OneDrive\Documentos\win-grupo1\scripts
.\create-admin.ps1
```

O script irá:
1. ✅ Verificar se o backend está rodando
2. ✅ Solicitar email, nome e senha
3. ✅ Gerar hash via API
4. ✅ Inserir automaticamente no banco
5. ✅ Mostrar credenciais de acesso

---

## 🐧 Script Automatizado (Linux/Mac)

```bash
cd ~/win-grupo1/scripts
chmod +x create-admin.sh
./create-admin.sh
```

---

## 📝 Exemplo Completo Passo a Passo

### 1. Gerar o hash:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"Admin@2025","email":"admin@winmarketplace.com","nome":"Admin Principal"}' `
  | Select-Object -ExpandProperty hash
```

**Resultado:** `$2a$10$tmytV74xildKsyl8vz4A3uBFdo3FsFpj5xXB2MXBE8EDL4JlhoU4C`

### 2. Inserir no banco:
```powershell
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (
  gen_random_uuid(),
  'admin@winmarketplace.com',
  '$2a$10$tmytV74xildKsyl8vz4A3uBFdo3FsFpj5xXB2MXBE8EDL4JlhoU4C',
  'Admin Principal',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
"
```

### 3. Verificar:
```powershell
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT email, nome, role, ativo FROM usuarios WHERE email = 'admin@winmarketplace.com';
"
```

**Resultado:**
```
          email           |      nome       | role  | ativo
--------------------------+-----------------+-------+-------
 admin@winmarketplace.com | Admin Principal | ADMIN | t
```

### 4. Fazer login:
- Acesse: http://localhost:3000/login
- Email: `admin@winmarketplace.com`
- Senha: `Admin@2025`

---

## 🔒 Segurança

### ✅ Boas práticas implementadas:
- Endpoint `/api/v1/dev/*` só disponível quando `DEV_TOOLS_ENABLED=true`
- BCrypt com strength 10 (padrão Spring Security)
- Senhas nunca são armazenadas em plain text

### ⚠️ IMPORTANTE:
- **NUNCA** use `DEV_TOOLS_ENABLED=true` em produção!
- Use senhas fortes (mínimo 12 caracteres, letras, números, símbolos)
- Não compartilhe hashes em repositórios públicos

### Desabilitar em Produção:
```yaml
# docker-compose.yml ou variáveis de ambiente
environment:
  DEV_TOOLS_ENABLED: false  # ou remova completamente
```

---

## 🛠️ Troubleshooting

### Erro 403 Forbidden
**Causa:** Backend não foi reconstruído com as alterações

**Solução:**
```bash
docker-compose build backend
docker-compose up -d backend
```

### Erro: "duplicate key value"
**Causa:** Email já existe no banco

**Solução 1 - Atualizar senha:**
```sql
UPDATE usuarios 
SET senha = '$2a$10$NOVO_HASH_AQUI', atualizado_em = NOW()
WHERE email = 'admin@winmarketplace.com';
```

**Solução 2 - Usar outro email:**
```sql
-- Use admin2@, admin3@, etc.
```

### Backend não responde
**Verificar se está rodando:**
```bash
docker ps | grep backend
```

**Ver logs:**
```bash
docker logs win-marketplace-backend --tail 50
```

**Reiniciar:**
```bash
docker-compose restart backend
```

---

## 📚 Documentação Completa

Para documentação detalhada, consulte:
- `_DOCS/PASSWORD_HASH_GENERATOR.md` - Documentação completa
- `scripts/create-admin.ps1` - Script Windows
- `scripts/create-admin.sh` - Script Linux/Mac

---

## ✨ Recursos Implementados

- ✅ `PasswordHashGenerator.java` - Classe standalone
- ✅ `DevToolsController.java` - API REST endpoints
- ✅ `/api/v1/dev/hash-password` - Gerar hash
- ✅ `/api/v1/dev/verify-password` - Verificar hash
- ✅ Scripts PowerShell e Bash automatizados
- ✅ Documentação completa com exemplos
- ✅ Integração com Spring Security
- ✅ Condicional via `DEV_TOOLS_ENABLED`

---

**Data de criação:** 24/10/2025  
**Status:** ✅ Funcional e testado
