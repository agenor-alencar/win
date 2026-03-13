# Gerador de Hash de Senha - WIN Marketplace

Este documento explica como usar o gerador de hash de senha para criar contas de administrador diretamente no banco de dados.

## 📋 Quando Usar

- Ao configurar a aplicação em uma nova máquina
- Quando precisar criar um admin sem interface gráfica
- Para recuperação de acesso administrativo
- Em ambientes de desenvolvimento/staging

## 🔧 Métodos Disponíveis

### Método 1: Classe Java Standalone (Recomendado)

#### Como executar:

1. **Via IDE (IntelliJ, Eclipse, VS Code)**
   - Abra o projeto backend
   - Navegue até `com.win.marketplace.util.PasswordHashGenerator`
   - Clique com botão direito → Run 'PasswordHashGenerator.main()'

2. **Via Maven (Terminal)**
   ```bash
   cd backend
   mvn exec:java -Dexec.mainClass="com.win.marketplace.util.PasswordHashGenerator"
   ```

3. **Via Linha de Comando Compilado**
   ```bash
   cd backend
   mvn clean package
   java -cp target/classes com.win.marketplace.util.PasswordHashGenerator
   ```

#### Exemplo de uso:
```
=================================================
    GERADOR DE HASH DE SENHA - WIN MARKETPLACE
=================================================

Digite a senha (ou 'sair' para encerrar): admin123

✅ Hash gerado com sucesso!
─────────────────────────────────────────────────
$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
─────────────────────────────────────────────────

📋 Exemplo de SQL para inserir admin:
─────────────────────────────────────────────────
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (
  gen_random_uuid(),
  'admin@winmarketplace.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Administrador',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
─────────────────────────────────────────────────

Digite a senha (ou 'sair' para encerrar): sair

Encerrando...
```

---

### Método 2: API REST (Desenvolvimento)

**⚠️ IMPORTANTE:** Este método só funciona quando `DEV_TOOLS_ENABLED=true` está configurado.

#### Configuração:

No `docker-compose.yml`, certifique-se que está configurado:
```yaml
environment:
  DEV_TOOLS_ENABLED: true  # habilite apenas temporariamente em ambiente controlado
```

#### Endpoints disponíveis:

##### 1. Gerar Hash de Senha

**POST** `http://localhost:8080/api/v1/dev/hash-password`

**Body (JSON):**
```json
{
  "senha": "admin123",
  "email": "admin@winmarketplace.com",
  "nome": "Administrador"
}
```

**Response:**
```json
{
  "hash": "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "message": "Hash gerado com sucesso",
  "sqlExample": "INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)\nVALUES (\n  gen_random_uuid(),\n  'admin@winmarketplace.com',\n  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',\n  'Administrador',\n  'ADMIN',\n  true,\n  NOW(),\n  NOW()\n);"
}
```

##### 2. Verificar Senha (Teste)

**POST** `http://localhost:8080/api/v1/dev/verify-password`

**Body (JSON):**
```json
{
  "senha": "admin123",
  "hash": "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
}
```

**Response:**
```json
{
  "matches": true,
  "message": "✅ Senha corresponde ao hash"
}
```

#### Exemplos com cURL:

```bash
# Gerar hash
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"admin123","email":"admin@winmarketplace.com","nome":"Admin Principal"}'

# Verificar senha
curl -X POST http://localhost:8080/api/v1/dev/verify-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"admin123","hash":"$2a$10$seu-hash-aqui"}'
```

#### Exemplos com Postman/Insomnia:

1. Crie nova requisição POST
2. URL: `http://localhost:8080/api/v1/dev/hash-password`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "senha": "minha-senha-secreta",
  "email": "admin@winmarketplace.com",
  "nome": "Super Admin"
}
```
5. Envie a requisição
6. Copie o hash da resposta

---

## 📝 Como Inserir Admin no Banco de Dados

### Via Docker (psql):

```bash
# Conectar ao container do PostgreSQL
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Executar o INSERT
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (
  gen_random_uuid(),
  'admin@winmarketplace.com',
  '$2a$10$SEU_HASH_GERADO_AQUI',
  'Administrador Principal',
  'ADMIN',
  true,
  NOW(),
  NOW()
);

# Verificar se foi criado
SELECT id, email, nome, role, ativo FROM usuarios WHERE email = 'admin@winmarketplace.com';

# Sair
\q
```

### Via DBeaver/pgAdmin:

1. Conecte ao banco `win_marketplace`
2. Execute o script SQL:
```sql
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (
  gen_random_uuid(),
  'admin@winmarketplace.com',
  '$2a$10$SEU_HASH_GERADO_AQUI',
  'Administrador Principal',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

---

## 🔐 Segurança

### ✅ Boas Práticas:

- Use senhas fortes para contas admin (mínimo 12 caracteres)
- Inclua letras maiúsculas, minúsculas, números e símbolos
- Nunca compartilhe o hash de senha em sistemas de versionamento
- Use variáveis de ambiente para senhas em produção

### ⚠️ Atenção:

- **NUNCA** habilite `DEV_TOOLS_ENABLED=true` em produção
- O endpoint `/api/v1/dev/*` só deve estar disponível em dev/staging
- Remova ou desabilite este endpoint em ambientes de produção
- Não exponha este serviço publicamente

### 🚫 Desabilitar em Produção:

No `docker-compose.yml` ou variáveis de ambiente de produção:
```yaml
environment:
  DEV_TOOLS_ENABLED: false  # ou remova a variável completamente
```

---

## 🛠️ Troubleshooting

### Erro: "Endpoint /api/v1/dev/hash-password não encontrado"

**Causa:** Dev tools não estão habilitados

**Solução:**
1. Verifique o `docker-compose.yml`:
```yaml
environment:
  DEV_TOOLS_ENABLED: true
```
2. Reinicie o backend:
```bash
docker-compose restart backend
```

### Erro ao inserir admin no banco

**Erro:** `ERROR: duplicate key value violates unique constraint "usuarios_email_key"`

**Causa:** Já existe um usuário com esse email

**Solução:**
```sql
-- Verificar email existente
SELECT * FROM usuarios WHERE email = 'admin@winmarketplace.com';

-- Opção 1: Atualizar senha do usuário existente
UPDATE usuarios 
SET senha = '$2a$10$SEU_NOVO_HASH_AQUI', atualizado_em = NOW()
WHERE email = 'admin@winmarketplace.com';

-- Opção 2: Usar outro email
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), 'admin2@winmarketplace.com', '$2a$10$HASH', 'Admin 2', 'ADMIN', true, NOW(), NOW());
```

---

## 📖 Exemplos Completos

### Cenário 1: Configurando nova máquina

```bash
# 1. Clonar o projeto
git clone https://github.com/seu-usuario/win-marketplace.git
cd win-marketplace

# 2. Subir o backend
docker-compose up -d backend

# 3. Aguardar backend inicializar (30 segundos)
sleep 30

# 4. Gerar hash via API
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"Admin@2025!","email":"admin@empresa.com","nome":"Administrador"}' \
  | jq -r '.hash'

# 5. Inserir no banco (copie o hash do passo anterior)
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
VALUES (gen_random_uuid(), 'admin@empresa.com', 'COLE_O_HASH_AQUI', 'Administrador', 'ADMIN', true, NOW(), NOW());
"

# 6. Verificar
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
SELECT email, nome, role FROM usuarios WHERE email = 'admin@empresa.com';
"
```

### Cenário 2: Recuperação de senha admin

```bash
# 1. Gerar novo hash
curl -X POST http://localhost:8080/api/v1/dev/hash-password \
  -H "Content-Type: application/json" \
  -d '{"senha":"NovaSenhaForte@2025"}' \
  | jq -r '.hash'

# 2. Atualizar no banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "
UPDATE usuarios 
SET senha = 'COLE_O_NOVO_HASH_AQUI', atualizado_em = NOW()
WHERE email = 'admin@winmarketplace.com';
"

# 3. Fazer login com a nova senha
```

---

## 📚 Referências

- [BCrypt Algorithm](https://en.wikipedia.org/wiki/Bcrypt)
- [Spring Security Password Encoding](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)

---

## ✅ Checklist de Uso

- [ ] Backend está rodando (`docker ps` mostra container `win-marketplace-backend`)
- [ ] `DEV_TOOLS_ENABLED=true` está configurado (para método API)
- [ ] Escolhi uma senha forte (mínimo 12 caracteres)
- [ ] Gerei o hash usando um dos métodos acima
- [ ] Copiei o hash completo (começa com `$2a$10$`)
- [ ] Executei o INSERT no banco de dados
- [ ] Verifiquei que o usuário foi criado (`SELECT * FROM usuarios WHERE email = '...'`)
- [ ] Testei o login na interface web
- [ ] Desabilitei `DEV_TOOLS_ENABLED` em produção (se aplicável)

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0
