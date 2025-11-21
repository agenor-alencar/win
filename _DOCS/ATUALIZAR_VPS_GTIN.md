# 🔄 Atualizar VPS com Funcionalidade GTIN

## 📋 O que foi implementado

✅ **Backend (7 passos completos)**
- Configuração da API GTIN no `application.yml`
- Campo `gtinEan` na entidade `Produto`
- Service `GtinApiService` com WebClient
- Endpoint `/api/v1/produtos/gtin/{gtinEan}`
- DTOs e validações completas

✅ **Frontend**
- UI de busca GTIN no formulário de produtos
- Auto-preenchimento de peso e dimensões
- Feedback visual (loading, toasts)

---

## 🚀 Passos para Atualizar a VPS

### 1️⃣ Conectar na VPS

```bash
ssh winuser@137.184.87.106
```

### 2️⃣ Ir para o diretório do projeto

```bash
cd ~/win
```

### 3️⃣ Parar os containers

```bash
docker-compose down
```

### 4️⃣ Atualizar o código do GitHub

```bash
git pull origin main
```

**Você deve ver:**
```
Updating c5d3098..a249400
Fast-forward
 backend/src/main/java/com/win/marketplace/dto/request/ProdutoCreateRequestDTO.java | ...
 backend/src/main/java/com/win/marketplace/dto/response/GtinDataResponseDTO.java     | ...
 backend/src/main/java/com/win/marketplace/service/GtinApiService.java               | ...
 ...
 8 files changed, 299 insertions(+)
```

### 5️⃣ Configurar Token da API GTIN (Opcional)

Edite o arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Adicione no final do arquivo:

```bash
# ====================================
# API GTIN/EAN - Cosmos Bluesoft
# ====================================
GTIN_API_URL=https://api.cosmos.bluesoft.com.br/gtins
GTIN_API_TOKEN=
```

**Nota:** 
- Se não tiver token, deixe vazio. A API funcionará com limites.
- Para obter token gratuito: https://cosmos.bluesoft.com.br

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 6️⃣ Rebuild dos containers (Importante!)

```bash
docker-compose build --no-cache
```

⏱️ **Isso vai demorar 5-10 minutos** - aguarde até terminar!

### 7️⃣ Iniciar os containers

```bash
docker-compose up -d
```

### 8️⃣ Verificar se tudo subiu corretamente

```bash
# Ver status dos containers
docker-compose ps

# Ver logs do backend (verificar se carregou sem erros)
docker logs win-marketplace-backend --tail 50

# Ver logs do frontend (verificar se compilou)
docker logs win-marketplace-frontend --tail 50
```

### 9️⃣ Testar o endpoint GTIN (Opcional)

Primeiro, faça login como lojista e copie o token JWT.

Depois teste o endpoint:

```bash
curl -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  http://localhost:8080/api/v1/produtos/gtin/7891234567890
```

---

## 🎯 Como Testar no Navegador

1. Acesse: `http://137.184.87.106/merchant/products/new`
2. Role até a seção de **"Envio"** 
3. Você verá uma nova seção azul: **"🔍 Buscar Medidas por GTIN/EAN"**
4. Insira um código GTIN (ex: `7891234567890`)
5. Clique em **"Buscar Medidas"**
6. Os campos de peso e dimensões serão preenchidos automaticamente

---

## ⚠️ Troubleshooting

### Problema: Containers não sobem após rebuild

**Solução:**
```bash
# Verificar logs de erro
docker-compose logs

# Limpar tudo e tentar novamente
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problema: Frontend não mostra a nova UI

**Causa:** Cache do navegador

**Solução:**
1. Pressione `Ctrl+Shift+R` (hard refresh)
2. Ou abra em modo anônimo
3. Ou limpe cache do navegador

### Problema: Erro 500 ao buscar GTIN

**Possíveis causas:**

1. **API GTIN offline** - teste manualmente:
```bash
curl https://api.cosmos.bluesoft.com.br/gtins/7891234567890.json
```

2. **Firewall bloqueando** - verifique se a VPS consegue acessar APIs externas:
```bash
curl -I https://api.cosmos.bluesoft.com.br
```

3. **Backend não atualizou** - verifique se o código novo está lá:
```bash
docker exec -it win-marketplace-backend bash
cat /app/src/main/java/com/win/marketplace/service/GtinApiService.java
```

### Problema: Endpoint retorna 404

**Causa:** Token JWT inválido ou usuário não é LOJISTA

**Solução:**
- Faça login como lojista (não como admin ou usuário comum)
- Copie um token JWT válido e recente
- Verifique se o token tem a autoridade `LOJISTA`

---

## 📝 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Reiniciar apenas o frontend
docker-compose restart frontend

# Reiniciar apenas o backend
docker-compose restart backend

# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Verificar saúde do backend
curl http://localhost:8080/actuator/health

# Listar endpoints disponíveis
curl http://localhost:8080/actuator/mappings | grep gtin
```

---

## ✅ Checklist de Verificação

Após atualizar, verifique:

- [ ] `git pull` trouxe os novos arquivos
- [ ] `.env` tem configuração GTIN_API_URL e GTIN_API_TOKEN
- [ ] `docker-compose build --no-cache` executou sem erros
- [ ] Todos os 3 containers estão UP
- [ ] Logs do backend não mostram erros de compilação
- [ ] Logs do frontend não mostram erros de build
- [ ] Página `/merchant/products/new` carrega
- [ ] Seção GTIN/EAN aparece na UI (fundo azul)
- [ ] Botão "Buscar Medidas" está presente
- [ ] Hard refresh no navegador (Ctrl+Shift+R)

---

## 🎉 Pronto!

Agora o formulário de cadastro de produtos tem a funcionalidade de busca automática de medidas por GTIN/EAN!

**Data:** 20/11/2025  
**Versão:** 1.0 com GTIN
