# 🎠 Deploy Sistema de Banners na VPS

Guia específico para fazer deploy do sistema de carrossel de banners.

---

## ✅ Pré-requisitos

- [x] Código commitado no GitHub
- [x] Acesso SSH à VPS
- [x] Backend Java funcionando
- [x] DigitalOcean Spaces configurado (para upload de imagens)

---

## 🚀 Deploy Rápido

Execute estes comandos na VPS:

```bash
# 1. Atualizar código
cd ~/win
git pull origin main

# 2. Aplicar migration 005 (criar tabela banners)
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql

# 3. Verificar se foi aplicada
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT COUNT(*) FROM banners;"
# Deve retornar: count = 3

# 4. Rebuild do backend (incluir novas classes Java)
docker compose down
docker compose build backend --no-cache

# 5. Rebuild do frontend (incluir swiper.js)
docker compose build frontend --no-cache

# 6. Subir containers
docker compose up -d

# 7. Aguardar backend iniciar (30-60 segundos)
docker compose logs -f backend | grep -i "started"
# Ctrl+C quando ver "Started WinMarketApplication"

# 8. Testar endpoint público
curl http://localhost:8080/api/v1/banners
# Deve retornar JSON com 3 banners
```

---

## 🔍 Verificação de Problemas

### Problema 1: Backend não inicia

**Sintoma:** `docker compose ps` mostra backend com status "Exit" ou "Restarting"

**Solução:**
```bash
# Ver logs de erro
docker compose logs backend --tail=100

# Verificar se há erros de compilação Maven
docker compose logs backend | grep -i "error\|exception"
```

### Problema 2: Erro 403 Forbidden ao acessar /api/v1/banners

**Sintoma:** `curl http://localhost:8080/api/v1/banners` retorna erro 403

**Causa:** Backend não iniciou corretamente ou erro de compilação

**Solução:**
```bash
# 1. Verificar se backend está rodando
docker compose ps backend

# 2. Ver logs completos
docker compose logs backend --tail=100

# 3. Se houver erro de compilação, fazer rebuild
docker compose down
docker compose build backend --no-cache
docker compose up -d
```

### Problema 3: Tabela banners não existe

**Sintoma:** Logs mostram "relation 'banners' does not exist"

**Solução:**
```bash
# Aplicar migration
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql

# Verificar
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "\d banners"
```

### Problema 4: Erro ao criar banner (upload de imagem)

**Sintoma:** Erro interno ao tentar criar banner via admin panel

**Causa:** Pasta `banners/` não existe no DigitalOcean Spaces

**Solução:**
```bash
# Criar pasta banners/ no Space
aws s3api put-object --bucket win-marketplace-storage --key banners/ \
  --endpoint-url https://sfo3.digitaloceanspaces.com
```

---

## 🧪 Testes

### 1. Testar API pública:
```bash
curl http://localhost:8080/api/v1/banners
```

**Resposta esperada:**
```json
[
  {
    "id": "...",
    "titulo": "Ferragens e Ferramentas",
    "subtitulo": "As Melhores marcas: Makita, Bosch e Dewalt",
    "imagemUrl": "https://win-marketplace-storage.sfo3.digitaloceanspaces.com/banners/...",
    "linkUrl": "https://winmarketplace.com.br/category/ferragens",
    "ordem": 1,
    "ativo": true
  },
  ...
]
```

### 2. Testar carrossel na home:
```bash
# Abrir no navegador
https://winmarketplace.com.br/

# Você deve ver o carrossel de banners no topo da página
```

### 3. Testar painel admin:
```bash
# Fazer login como ADMIN
# Acessar: https://winmarketplace.com.br/admin/banners

# Tentar criar um novo banner
# Upload deve funcionar e banner aparecer na lista
```

---

## 📊 Estrutura de Arquivos Criados

### Backend:
```
backend/src/main/java/com/win/marketplace/
├── model/
│   └── Banner.java
├── repository/
│   └── BannerRepository.java
├── service/
│   └── BannerService.java
├── controller/
│   └── BannerController.java
└── dto/
    ├── request/
    │   ├── BannerCreateRequestDTO.java
    │   └── BannerUpdateRequestDTO.java
    ├── response/
    │   └── BannerResponseDTO.java
    └── mapper/
        └── BannerMapper.java
```

### Frontend:
```
win-frontend/src/
├── components/
│   └── MainCarousel.tsx
├── pages/admin/
│   └── AdminBanners.tsx
└── lib/
    └── bannerApi.ts
```

### Database:
```
database/migrations/
├── 005_create_banners_table.sql
├── apply_005.sh
└── apply_005.ps1
```

---

## 🎯 Endpoints da API

### Públicos (sem autenticação):
- `GET /api/v1/banners` - Listar banners ativos

### Admin (requer role ADMIN):
- `GET /api/v1/admin/banners` - Listar todos os banners
- `POST /api/v1/admin/banners` - Criar banner (com upload de imagem)
- `PUT /api/v1/admin/banners/{id}` - Atualizar banner
- `PATCH /api/v1/admin/banners/{id}/imagem` - Atualizar imagem do banner
- `PATCH /api/v1/admin/banners/{id}/toggle-ativo` - Ativar/desativar banner
- `DELETE /api/v1/admin/banners/{id}` - Deletar banner

---

## 📦 Dependências Adicionadas

### Frontend (package.json):
```json
{
  "dependencies": {
    "swiper": "^11.1.15",
    "framer-motion": "^12.6.2"
  }
}
```

---

## ✅ Checklist Final

- [ ] `git pull` executado
- [ ] Migration 005 aplicada (3 banners criados)
- [ ] Backend reconstruído (classes Banner compiladas)
- [ ] Frontend reconstruído (swiper instalado)
- [ ] Containers reiniciados
- [ ] Backend iniciado com sucesso
- [ ] Endpoint público funcionando (`curl /api/v1/banners`)
- [ ] Carrossel visível na home
- [ ] Painel admin acessível em `/admin/banners`
- [ ] Upload de banner funcionando
- [ ] Pasta `banners/` criada no Spaces

---

## 🆘 Comandos de Emergência

### Resetar tudo e fazer deploy limpo:
```bash
cd ~/win
git pull origin main
docker compose down
docker volume prune -f
docker compose build --no-cache
docker compose up -d
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/005_create_banners_table.sql
```

### Ver logs em tempo real:
```bash
# Backend
docker compose logs -f backend

# Frontend
docker compose logs -f frontend

# Todos os containers
docker compose logs -f
```

### Verificar se containers estão rodando:
```bash
docker compose ps
```

### Entrar no container do backend:
```bash
docker exec -it win-marketplace-backend bash

# Dentro do container, verificar classes compiladas:
ls -la /app/target/classes/com/win/marketplace/model/ | grep Banner
ls -la /app/target/classes/com/win/marketplace/controller/ | grep Banner

exit
```

---

**Última atualização:** 03/01/2026
