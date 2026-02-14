# 🎨 Sistema de Banners - Guia Rápido

Sistema completo de carrossel de banners dinâmicos para o WIN Marketplace.

## ✨ Recursos

- ✅ Carrossel automático com Swiper.js + Framer Motion
- ✅ Painel administrativo completo (CRUD)
- ✅ Upload de imagens para DigitalOcean Spaces
- ✅ Lazy loading e otimização de performance
- ✅ 100% responsivo
- ✅ Segurança com Spring Security (Role ADMIN)

## 🚀 Deploy Rápido

### 1. Aplicar Migration

**Windows (PowerShell):**
```powershell
cd c:\Users\user\OneDrive\Documentos\win
.\database\migrations\apply_005.ps1
```

**Linux/Mac:**
```bash
cd /root/win-marketplace
bash database/migrations/apply_005.sh
```

### 2. Instalar Dependências do Frontend

```bash
cd win-frontend
npm install
```

### 3. Rebuild Backend e Frontend

```bash
# Backend (na VPS)
docker compose down
docker compose build backend --no-cache
docker compose up -d

# Frontend
cd win-frontend
npm run build
```

### 4. Criar Pasta no Spaces

Via painel: https://cloud.digitalocean.com/spaces/win-marketplace-storage
- Criar pasta: `banners/`

## 📍 Acessos

- **Home Page**: `/` (carrossel visível para todos)
- **Admin Panel**: `/admin/banners` (somente ADMIN)

## 📖 Uso

### Como Admin

1. Login com conta ADMIN
2. Acessar `/admin/banners`
3. Clicar em "Novo Banner"
4. Preencher:
   - Título
   - Subtítulo (opcional)
   - Link de destino (opcional)
   - Ordem de exibição
   - Selecionar imagem (max 10MB)
   - Marcar como ativo
5. Salvar

### Recomendações de Imagem

- **Dimensões**: 1920x500px
- **Formato**: JPG (menor) ou PNG (melhor qualidade)
- **Peso**: Máximo 2MB
- **Design**: Deixar 40% à esquerda livre para o texto

## 🎯 Exemplos de Banners

### Banner 1 - Ferragens
```
Título: Ferragens e Ferramentas de Qualidade
Subtítulo: JC Ferragens - Marca líder em ferragens
Link: /categoria/ferragens
Ordem: 1
```

### Banner 2 - Marcas
```
Título: As Melhores Marcas Estão Aqui
Subtítulo: Ingco • Bosch • Makita • Dewalt • Stanley
Link: /produtos
Ordem: 2
```

### Banner 3 - Promoção
```
Título: Promoções Imperdíveis
Subtítulo: Ferramentas com até 30% OFF + Frete Grátis
Link: /promocoes
Ordem: 3
```

## 🔧 Troubleshooting

### Banners não aparecem na home
```bash
# Verificar se existem banners ativos
docker exec win-marketplace-db psql -U postgres -d win_marketplace -c "SELECT * FROM banners WHERE ativo = true;"
```

### Erro 403 no upload
- Verificar SPACES_ACCESS_KEY e SPACES_SECRET_KEY no `.env`
- Verificar se bucket existe: `win-marketplace-storage`

### Carrossel não funciona
```bash
cd win-frontend
npm install swiper@^11.1.15
npm run build
```

## 📚 Documentação Completa

Para mais detalhes, consulte: [SISTEMA_BANNERS.md](./_DOCS/SISTEMA_BANNERS.md)

## ✅ Checklist

- [ ] Migration aplicada
- [ ] Pasta `banners/` criada no Spaces
- [ ] Backend rebuilt
- [ ] Frontend built
- [ ] Teste de upload realizado
- [ ] Banner aparece na home

---

**Data**: 03/01/2026  
**Versão**: 1.0.0
