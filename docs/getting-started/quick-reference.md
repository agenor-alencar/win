# ⚡ Referência Rápida - WIN Marketplace

> Comandos mais usados para consulta rápida

---

## 🚀 Início Rápido (5 minutos)

```bash
# 1. Clonar e subir
git clone https://github.com/ArthurJsph/win-grupo1.git
cd win-grupo1
docker-compose up -d

# 2. Aguardar inicialização (30s)
# 3. Criar admin - ver seção abaixo
# 4. Acessar: http://localhost:3000/login
```

---

## 🔑 Criar Admin

### One-liner (PowerShell):
```powershell
$hash = (Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/hash-password" -Method Post -ContentType "application/json" -Body '{"senha":"Admin@2025"}').hash; docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -c "INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em) VALUES (gen_random_uuid(), 'admin@win.com', '$hash', 'Admin', 'ADMIN', true, NOW(), NOW());"
```

### Ou use o script:
```powershell
.\scripts\create-admin.ps1
```

---

## 🐳 Docker - Comandos Essenciais

```bash
# Subir todos os serviços
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend

# Parar tudo
docker-compose down

# Reiniciar serviço específico
docker-compose restart backend

# Rebuild após mudanças no código
docker-compose build backend
docker-compose up -d backend
```

---

## 🗄️ Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Queries úteis dentro do psql:
\dt                    # Listar tabelas
\d usuarios           # Descrever tabela
SELECT * FROM usuarios WHERE role = 'ADMIN';
\q                    # Sair
```

---

## 📧 Email - SendGrid

```bash
# 1. Obter API Key em: https://app.sendgrid.com/settings/api_keys
# 2. Configurar no .env:
SENDGRID_API_KEY=SG.xxx
MAIL_FROM=seu-email@gmail.com

# 3. Reiniciar backend
docker-compose restart backend
```

---

## 🔍 Troubleshooting Rápido

### Backend não responde
```bash
docker logs win-marketplace-backend --tail 50
docker-compose restart backend
```

### Porta em uso (8080)
```powershell
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Limpar tudo e começar do zero
```bash
docker-compose down -v
docker system prune -a -f
docker-compose up -d
```

---

## 🌐 URLs Importantes

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Admin Panel:** http://localhost:3000/admin
- **Swagger:** http://localhost:8080/swagger-ui.html

---

## 📝 Variáveis de Ambiente Principais

```env
# .env
SENDGRID_API_KEY=SG.xxx
MAIL_FROM=email@exemplo.com
DEV_TOOLS_ENABLED=true
FRONTEND_URL=http://localhost:3000
```

---

## 🔐 Senhas Padrão

**Banco de Dados:**
- User: `postgres`
- Password: `postgres123`
- Database: `win_marketplace`

**Admin (você cria):**
- Email: definido por você
- Senha: definida por você

---

## 📂 Estrutura Rápida

```
win-grupo1/
├── backend/          # Spring Boot API
├── win-frontend/     # React App
├── docs/            # 📚 Documentação completa
├── scripts/         # 🔧 Scripts auxiliares
└── docker-compose.yml
```

---

## ⚡ Scripts Prontos

```bash
# Windows
.\scripts\create-admin.ps1

# Linux/Mac
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **[Índice Completo](../README.md)** - Tudo sobre a documentação
- **[Criar Admin](first-admin.md)** - Guia detalhado
- **[Email SendGrid](../configuration/email-sendgrid.md)** - Setup completo
- **[Docker](../deployment/docker.md)** - Guia Docker avançado

---

## ✅ Checklist de Setup

- [ ] Clonou o repositório
- [ ] Executou `docker-compose up -d`
- [ ] Aguardou 30 segundos
- [ ] Criou conta admin
- [ ] Testou login em http://localhost:3000/login
- [ ] Configurou email SendGrid (opcional)
- [ ] Explorou painel admin

---

**💡 Dica:** Adicione esta página aos favoritos para consulta rápida!
