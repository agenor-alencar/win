# 🔐 Guia de Segurança - WIN Marketplace

## ✅ Melhorias de Segurança Implementadas

### 1. 🔒 **Docker Compose - Variáveis de Ambiente**

#### ❌ Antes (INSEGURO):
```yaml
environment:
  POSTGRES_PASSWORD: postgres123  # Senha exposta no arquivo versionado
```

#### ✅ Depois (SEGURO):
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}
```

**Como funciona:**
- `${POSTGRES_PASSWORD}` - Lê do arquivo `.env`
- `:-postgres123` - Fallback apenas se variável não existir
- Senhas não ficam expostas no repositório
- Cada ambiente (dev/staging/prod) usa sua própria senha

---

### 2. 📁 **Organização de Arquivos Sensíveis**

#### Estrutura Nova:
```
win-grupo1/
├── .env                          # 🔒 Git ignorado (senhas reais)
├── .env.example                  # ✅ Template (sem senhas)
├── .gitignore                    # 🛡️ Proteção robusta
│
├── database/
│   ├── seeds/                    # Scripts de seed
│   │   └── seed-categorias.sql
│   └── init.sql
│
├── docs/                         # 📚 Documentação organizada
│   ├── configuration/
│   │   └── env-sendgrid-template.txt
│   └── development/              # Docs de dev
│
└── scripts/                      # 🔧 Scripts auxiliares
    ├── create-admin.ps1
    └── seed-categorias.ps1
```

---

### 3. 🛡️ **.gitignore Robusto**

Protege contra commit acidental de:
- ✅ Arquivos `.env` (todas as variantes)
- ✅ Chaves privadas (*.key, *.pem)
- ✅ Logs e dumps de banco
- ✅ Builds e node_modules
- ✅ Arquivos temporários

---

## 📋 Checklist de Segurança

### Antes de Commitar:
- [ ] Verificou se `.env` está no `.gitignore`
- [ ] Não há senhas em `docker-compose.yml`
- [ ] Não há senhas em `application.yml`
- [ ] Executou `git status` para ver o que será commitado
- [ ] Revisou o diff: `git diff`

### Em Produção:
- [ ] Alterou TODAS as senhas padrão
- [ ] Definiu `DEV_TOOLS_ENABLED=false`
- [ ] Usou senhas fortes (12+ caracteres)
- [ ] Configurou variáveis de ambiente do servidor
- [ ] Não usou valores com `:-fallback`

### Boas Práticas:
- [ ] `.env` nunca vai pro git
- [ ] `.env.example` sempre atualizado
- [ ] Senhas geradas aleatoriamente
- [ ] JWT secret único por ambiente
- [ ] Backup de `.env` em local seguro

---

## 🔑 Como Usar Variáveis de Ambiente

### 1. Desenvolvimento Local:

```bash
# 1. Copiar template
cp .env.example .env

# 2. Editar .env com suas credenciais
# (use seu editor favorito)

# 3. Subir containers
docker-compose up -d

# As variáveis do .env são carregadas automaticamente
```

### 2. Servidor de Produção:

```bash
# NÃO use arquivo .env em produção!
# Configure variáveis no sistema:

# Linux/Mac
export POSTGRES_PASSWORD="SenhaSuperForte123!"
export SENDGRID_API_KEY="SG.xxx..."

# Windows
setx POSTGRES_PASSWORD "SenhaSuperForte123!"
setx SENDGRID_API_KEY "SG.xxx..."

# Ou use sistema de secrets do provedor:
# - AWS Secrets Manager
# - Azure Key Vault
# - Google Secret Manager
# - Docker Secrets
```

### 3. Docker Compose com .env:

```bash
# docker-compose.yml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-default}
  #                  ↑ lê do .env  ↑ fallback
```

---

## 🚨 O Que NUNCA Fazer

### ❌ Senhas no Código:
```yaml
# ERRADO - Senha exposta
POSTGRES_PASSWORD: postgres123
```

### ❌ Commitar .env:
```bash
# ERRADO - .env no git
git add .env
git commit -m "Added config"
```

### ❌ Usar Fallback em Produção:
```yaml
# ERRADO - Usando valor padrão
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}
# Em produção, a variável DEVE estar definida!
```

### ❌ Compartilhar Credenciais:
```bash
# ERRADO - Enviar .env no Slack/Email
# Use sistema de secrets ou gestor de senhas
```

---

## ✅ O Que Fazer

### ✅ Usar Variáveis:
```yaml
# CORRETO
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

### ✅ .env Local Apenas:
```bash
# .env fica apenas na sua máquina
# Cada dev tem seu próprio .env
```

### ✅ .env.example Sempre Atualizado:
```bash
# Quando adicionar nova variável:
echo "NEW_VAR=" >> .env.example
git add .env.example
git commit -m "Added NEW_VAR to example"
```

### ✅ Senhas Fortes:
```bash
# Gere senhas aleatórias
openssl rand -base64 32

# Ou use: https://passwordsgenerator.net/
```

---

## 🔄 Migrando Projeto Existente

Se você já tem o projeto rodando:

```bash
# 1. Backup do .env atual
cp .env .env.backup

# 2. Copiar novo template
cp .env.example .env

# 3. Preencher com suas credenciais antigas

# 4. Testar
docker-compose down
docker-compose up -d

# 5. Verificar logs
docker-compose logs -f
```

---

## 📚 Variáveis Disponíveis

### Banco de Dados:
```env
POSTGRES_DB=win_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua-senha-aqui
```

### Backend:
```env
SPRING_PROFILES_ACTIVE=docker
HIBERNATE_DDL_AUTO=update
TZ=America/Sao_Paulo
```

### Email:
```env
SENDGRID_API_KEY=SG.xxx
MAIL_FROM=seu-email@gmail.com
```

### Dev Tools:
```env
DEV_TOOLS_ENABLED=true  # false em produção
```

### Frontend:
```env
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8080
NODE_ENV=development
```

---

## 🧪 Testando Segurança

### Verificar se .env está protegido:
```bash
# Deve retornar vazio
git ls-files | grep "\.env$"

# Se aparecer .env, adicione ao .gitignore imediatamente!
```

### Verificar o que será commitado:
```bash
git status
git diff

# Procure por:
# - Senhas
# - API Keys
# - Tokens
# - Chaves privadas
```

### Simular commit:
```bash
# Ver o que seria adicionado
git add --dry-run .

# Se aparecer .env, PARE!
```

---

## 📞 Em Caso de Vazamento

Se você commitou credenciais por engano:

### 1. **Imediatamente:**
```bash
# Mudar TODAS as senhas comprometidas
# - Banco de dados
# - SendGrid API Key
# - Qualquer outro secret
```

### 2. **Limpar Histórico:**
```bash
# Remover do histórico do git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (CUIDADO!)
git push origin --force --all
```

### 3. **Prevenir Futuro:**
```bash
# Adicionar .env ao .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Added .env to gitignore"
```

---

## 🎯 Checklist Final

- [x] `.env` no `.gitignore`
- [x] `.env.example` atualizado
- [x] Senhas removidas do `docker-compose.yml`
- [x] Variáveis com `${VAR:-fallback}`
- [x] `.gitignore` robusto
- [x] Documentação de segurança criada
- [x] Estrutura de arquivos organizada

---

**✅ Projeto agora está seguro e profissional!**

Para mais informações:
- [Documentação Completa](../README.md)
- [Criar Admin](getting-started/first-admin.md)
- [Configurar Email](configuration/email-sendgrid.md)
