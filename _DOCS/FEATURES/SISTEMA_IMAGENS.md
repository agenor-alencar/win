# 📸 Sistema de Imagens - WIN Marketplace

## 📋 Como Funciona

### 1. Upload de Imagens (Backend)

**Caminho:** `/api/v1/imagens-produto/produto/{produtoId}`  
**Método:** `POST` (multipart/form-data)

```java
// FileStorageService.java
- Salva em: /app/uploads/produtos/
- Formato: {produtoId}_{UUID}.{extensão}
- Retorna: /uploads/produtos/{nomeArquivo}
- Validações: Tipo (image/*), Tamanho (5MB max)
```

**Fluxo:**
1. Lojista faz upload via formulário
2. Backend valida arquivo (tipo, tamanho)
3. Salva em `/app/uploads/produtos/`
4. Gera nome único: `{produtoId}_{UUID}.jpeg`
5. Salva no banco: URL relativa `/uploads/produtos/...`
6. Retorna `ImagemProdutoResponseDTO`

---

### 2. Persistência (Docker Volume)

**docker-compose.yml:**
```yaml
backend:
  volumes:
    - ./uploads:/app/uploads  # ✅ Volume montado
```

**O que isso faz:**
- Mapeia pasta local `./uploads` → Container `/app/uploads`
- Imagens **persistem** mesmo após restart do container
- Compartilhado entre host e container

---

### 3. Servir Imagens (Nginx + Backend)

#### Nginx (Porta 80)
```nginx
# nginx.conf
location /uploads/ {
    proxy_pass http://win-marketplace-backend:8080;
    proxy_cache_valid 200 7d;
    expires 7d;
}
```

#### Backend (Porta 8080)
```java
// FileUploadConfig.java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/uploads/produtos/**")
            .addResourceLocations(uploadPath.toUri().toString());
}
```

**Fluxo de Requisição:**
```
Cliente → https://winmarketplace.com.br/uploads/produtos/xxx.jpg
       ↓
     Nginx (porta 80)
       ↓
   Backend (porta 8080) → Arquivo físico em /app/uploads/produtos/
```

---

### 4. Exibir Imagens (Frontend)

**Construção da URL:**
```typescript
// Api.ts
export const getImageUrl = (url: string): string => {
  if (!url) return '';
  
  // URL completa? Retorna direto
  if (url.startsWith('http')) return url;
  
  // URL relativa: adiciona baseURL
  const baseURL = getBaseURL(); // http://localhost:8080 ou https://winmarketplace.com.br
  return `${baseURL}/${url}`;
};

// Exemplo:
// Input:  "/uploads/produtos/abc123.jpg"
// Output: "https://winmarketplace.com.br/uploads/produtos/abc123.jpg"
```

**Uso no Componente:**
```tsx
<img 
  src={getImageUrl(produto.imagens[0]?.url)} 
  alt={produto.nome}
  onError={(e) => e.currentTarget.src = '/placeholder.jpg'}
/>
```

---

## 🚀 Deploy no VPS

### Passo 1: Atualizar Código
```bash
cd ~/win
git pull origin main
```

### Passo 2: Criar Pasta de Uploads (se não existir)
```bash
mkdir -p uploads/produtos
chmod -R 755 uploads
```

### Passo 3: Rebuild Containers
```bash
docker-compose down
docker-compose up -d --build
```

### Passo 4: Verificar Logs
```bash
# Backend
docker-compose logs -f backend | grep -i "upload\|imagem"

# Nginx
docker-compose logs -f
```

---

## 🧪 Testar Sistema

### 1. Upload de Imagem (Lojista)
```bash
# Via cURL
curl -X POST \
  https://winmarketplace.com.br/api/v1/imagens-produto/produto/{produtoId} \
  -H "Authorization: Bearer {token}" \
  -F "arquivo=@imagem.jpg" \
  -F "ordemExibicao=1"
```

### 2. Verificar Arquivo no Container
```bash
docker exec -it win-marketplace-backend ls -lh /app/uploads/produtos/
```

### 3. Acessar Imagem Diretamente
```
https://winmarketplace.com.br/uploads/produtos/{nomeArquivo}
```

### 4. Verificar no Frontend
```bash
# Abrir DevTools (F12) → Network
# Filtrar por "uploads"
# Verificar se status é 200
```

---

## 🐛 Troubleshooting

### Problema: Imagem não aparece (404)

**Causa 1: Arquivo não existe no container**
```bash
# Verificar
docker exec -it win-marketplace-backend ls /app/uploads/produtos/

# Se vazio, volume não está montado
# Verificar docker-compose.yml
```

**Causa 2: Nginx não está proxy_pass correto**
```bash
# Testar backend diretamente
curl -I http://137.184.87.106:8080/uploads/produtos/{arquivo}

# Se funciona, problema é no nginx
# Verificar nginx.conf
```

**Causa 3: Permissões no servidor**
```bash
# No VPS
cd ~/win
ls -la uploads/produtos/

# Deve ter permissões 755 ou 777
chmod -R 755 uploads
```

---

### Problema: Imagem some após restart

**Causa: Volume não está configurado**
```yaml
# docker-compose.yml
backend:
  volumes:
    - ./uploads:/app/uploads  # ✅ DEVE TER ISSO
```

---

### Problema: Upload falha (500)

**Causa 1: Pasta não tem permissão de escrita**
```bash
# Container
docker exec -it win-marketplace-backend bash
cd /app
ls -la uploads/
# Se não existir:
mkdir -p uploads/produtos
chmod -R 777 uploads
```

**Causa 2: Arquivo muito grande**
```properties
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
```

---

## 📁 Estrutura de Arquivos

```
win/
├── uploads/                        # ✅ Volume Docker
│   └── produtos/
│       └── {produtoId}_{UUID}.jpg  # Imagens salvas
│
├── backend/
│   └── src/main/java/.../
│       ├── controller/
│       │   └── ImagemProdutoController.java
│       ├── service/
│       │   ├── ImagemProdutoService.java
│       │   └── FileStorageService.java
│       └── config/
│           └── FileUploadConfig.java  # Mapeia /uploads/**
│
├── win-frontend/
│   └── src/
│       └── lib/
│           └── Api.ts  # getImageUrl()
│
├── nginx.conf  # ✅ Proxy /uploads/ → backend:8080
└── docker-compose.yml  # ✅ Volume montado
```

---

## ✅ Checklist de Verificação

- [ ] Volume montado em docker-compose.yml
- [ ] Pasta `uploads/produtos/` existe no host
- [ ] Permissões 755 ou 777 na pasta uploads
- [ ] Nginx configurado com `location /uploads/`
- [ ] Backend com `FileUploadConfig` ativo
- [ ] Frontend usando `getImageUrl()`
- [ ] Teste: upload funciona
- [ ] Teste: imagem acessível via URL direta
- [ ] Teste: imagem aparece na loja pública

---

## 🔐 Segurança

### Upload
- ✅ Validação de tipo (apenas imagens)
- ✅ Validação de tamanho (5MB max)
- ✅ Nome único (previne sobrescrita)
- ✅ Autenticação JWT obrigatória

### Servir Arquivos
- ✅ Apenas pasta `/uploads/**` exposta
- ✅ Cache de 7 dias (performance)
- ✅ CORS configurado
- ⚠️ TODO: Rate limiting (prevenir abuso)

---

## 📊 Performance

### Cache
```nginx
# nginx.conf
location /uploads/ {
    proxy_cache_valid 200 7d;  # Cache 7 dias
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### CDN (Futuro)
- Considerar AWS CloudFront ou Cloudflare
- Upload direto para S3
- Reduzir carga no backend

---

## 🚀 Próximos Passos

### Curto Prazo
1. ✅ Configurar Nginx para servir imagens
2. ✅ Testar upload no VPS
3. ⏳ Adicionar fallback para placeholder

### Médio Prazo
4. ⏳ Otimização de imagens (WebP, compressão)
5. ⏳ Thumbnails automáticos
6. ⏳ Lazy loading no frontend

### Longo Prazo
7. ⏳ Migrar para S3/CloudStorage
8. ⏳ CDN para distribuição global
9. ⏳ Image resizing on-the-fly

---

**Documentação gerada em:** 2025-12-13  
**Versão:** 1.0
