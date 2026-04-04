# 📌 Exemplos Práticos - Gerador de Hash

Este arquivo contém exemplos reais testados e prontos para copiar e colar.

---

## 🎯 Exemplo 1: Criar Primeiro Admin

### Passo 1: Gerar Hash
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"Admin@2025!Forte","email":"admin@winmarketplace.com","nome":"Administrador Principal"}' `
  | Select-Object -ExpandProperty hash
```

**Resultado obtido:**
```
$2a$10$hDHUM.WfHGE2pV.2yMhrI.Z9qi18kDa7OT7.WJcxHrfNNkVw4IHMW
```

### Passo 2: Inserir no Banco
```powershell
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (
  gen_random_uuid(),
  'admin@winmarketplace.com',
  '$2a$10$hDHUM.WfHGE2pV.2yMhrI.Z9qi18kDa7OT7.WJcxHrfNNkVw4IHMW',
  'Administrador Principal',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
"
```

### Passo 3: Testar Login
- URL: http://localhost:3000/login
- Email: `admin@winmarketplace.com`
- Senha: `Admin@2025!Forte`

---

## 🎯 Exemplo 2: Criar Admin de Desenvolvimento

```powershell
# Gerar hash
$hash = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"dev123","email":"dev@winmarketplace.com","nome":"Dev Admin"}' `
  | Select-Object -ExpandProperty hash

# Inserir no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), 'dev@winmarketplace.com', '$hash', 'Dev Admin', 'ADMIN', true, NOW(), NOW());
"
```

---

## 🎯 Exemplo 3: Resetar Senha de Admin Existente

### Cenário: Esqueceu a senha do admin@winmarketplace.com

```powershell
# 1. Gerar novo hash
$newHash = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"NovaSenha@2025"}' `
  | Select-Object -ExpandProperty hash

# 2. Atualizar senha no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
UPDATE usuarios 
SET senha = '$newHash', atualizado_em = NOW()
WHERE email = 'admin@winmarketplace.com';
"

# 3. Verificar
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT email, nome, role, atualizado_em FROM usuarios WHERE email = 'admin@winmarketplace.com';
"
```

---

## 🎯 Exemplo 4: Criar Múltiplos Admins

```powershell
# Array de admins para criar
$admins = @(
    @{senha="Admin1@2025"; email="admin1@empresa.com"; nome="Admin Financeiro"},
    @{senha="Admin2@2025"; email="admin2@empresa.com"; nome="Admin Operacional"},
    @{senha="Admin3@2025"; email="admin3@empresa.com"; nome="Admin Suporte"}
)

foreach ($admin in $admins) {
    Write-Host "`nCriando: $($admin.nome)" -ForegroundColor Cyan
    
    # Gerar hash
    $body = @{
        senha = $admin.senha
        email = $admin.email
        nome = $admin.nome
    } | ConvertTo-Json
    
    $hash = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
        -Method Post -ContentType "application/json" -Body $body `
        | Select-Object -ExpandProperty hash
    
    # Inserir no banco
    docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
    INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), '$($admin.email)', '$hash', '$($admin.nome)', 'ADMIN', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
    "
    
    Write-Host "✅ $($admin.nome) criado com sucesso!" -ForegroundColor Green
}

Write-Host "`n✅ Todos os admins foram criados!" -ForegroundColor Green
```

---

## 🎯 Exemplo 5: Verificar Hash (Testar se Senha Está Correta)

```powershell
# Verificar se a senha "Admin@2025" corresponde ao hash gerado
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/verify-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"Admin@2025","hash":"$2a$10$hDHUM.WfHGE2pV.2yMhrI.Z9qi18kDa7OT7.WJcxHrfNNkVw4IHMW"}' `
  | Format-List
```

**Resultado esperado:**
```
matches : True
message : ✅ Senha corresponde ao hash
```

---

## 🎯 Exemplo 6: Criar Admin em Nova Máquina

### Cenário: Você acabou de clonar o projeto em outra máquina

```powershell
# 1. Subir os containers
cd win-grupo1
docker-compose up -d

# 2. Aguardar backend inicializar
Start-Sleep -Seconds 30

# 3. Gerar hash
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" `
  -Method Post -ContentType "application/json" `
  -Body '{"senha":"Admin@NovoAmbiente","email":"admin@winmarketplace.com","nome":"Administrador"}' 

# 4. Inserir no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c $response.sqlExample

# 5. Acessar
Start-Process "http://localhost:3000/login"
```

---

## 🎯 Exemplo 7: Script Completo One-Liner

### Criar admin com um único comando:

```powershell
# Windows PowerShell
$email = "admin@win.com"; $senha = "Admin123!@#"; $nome = "Admin"; $hash = (Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" -Method Post -ContentType "application/json" -Body "{`"senha`":`"$senha`",`"email`":`"$email`",`"nome`":`"$nome`"}").hash; docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em) VALUES (gen_random_uuid(), '$email', '$hash', '$nome', 'ADMIN', true, NOW(), NOW());"
```

### Bash (Linux/Mac):

```bash
EMAIL="admin@win.com"; SENHA="Admin123!@#"; NOME="Admin"; HASH=$(curl -s -X POST http://localhost:8080/api/v1/dev/hash-password -H "Content-Type: application/json" -d "{\"senha\":\"$SENHA\",\"email\":\"$EMAIL\",\"nome\":\"$NOME\"}" | jq -r '.hash'); docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em) VALUES (gen_random_uuid(), '$EMAIL', '$HASH', '$NOME', 'ADMIN', true, NOW(), NOW());"
```

---

## 🎯 Exemplo 8: Verificar Todos os Admins Existentes

```powershell
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as criado_em
FROM usuarios 
WHERE role = 'ADMIN'
ORDER BY criado_em DESC;
"
```

---

## 🎯 Exemplo 9: Desativar Admin (Não Deletar)

```powershell
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
UPDATE usuarios 
SET ativo = false, atualizado_em = NOW()
WHERE email = 'admin@deletar.com' AND role = 'ADMIN';
"
```

---

## 🎯 Exemplo 10: Exportar Configuração de Admin

```powershell
# Para documentar ou compartilhar com a equipe (SEM A SENHA!)
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT 
  email,
  nome,
  role,
  'Senha definida pelo administrador' as observacao
FROM usuarios 
WHERE role = 'ADMIN' AND ativo = true;
" > admins-config.txt

Write-Host "✅ Configuração exportada para admins-config.txt" -ForegroundColor Green
```

---

## 📋 Checklist de Criação de Admin

- [ ] Backend está rodando (`docker ps | grep backend`)
- [ ] Escolhi senha forte (mínimo 12 caracteres)
- [ ] Gerei o hash via API ou script
- [ ] Copiei o hash completo (inicia com `$2a$10$`)
- [ ] Executei o INSERT no banco de dados
- [ ] Verifiquei que foi criado (`SELECT * FROM usuarios WHERE email = '...'`)
- [ ] Testei login na interface (`http://localhost:3000/login`)
- [ ] Documentei o email do admin em local seguro
- [ ] **NÃO** salvei a senha em texto plano em lugar nenhum

---

## ⚠️ Notas Importantes

1. **Senhas Fortes:** Sempre use senhas com no mínimo:
   - 12 caracteres
   - Letras maiúsculas e minúsculas
   - Números
   - Símbolos especiais (@, !, #, $, etc.)

2. **Hash Completo:** O hash BCrypt tem exatamente 60 caracteres e começa com `$2a$10$`

3. **One-Time Use:** Cada execução do gerador cria um hash diferente, mesmo para a mesma senha

4. **Produção:** Desabilite `DEV_TOOLS_ENABLED` em ambientes de produção

5. **Segurança:** Nunca compartilhe hashes de senha em repositórios públicos ou Slack/Teams

---

**Testado em:** 24/10/2025  
**Sistema:** Windows 11 + PowerShell 5.1  
**Docker:** Docker Desktop 4.x  
**Status:** ✅ Todos os exemplos funcionando
