# 🔧 Alterações para Deploy na VPS

## ✅ Alterações Realizadas

### 1. **SecurityConfig.java** - CORS 100% Dinâmico
- ❌ **Removido:** IPs hardcoded (146.190.136.183)
- ✅ **Agora:** Usa apenas variável de ambiente `ALLOWED_ORIGINS`
- 📝 **Comportamento:** 
  - Desenvolvimento: Aceita `localhost:3000` automaticamente
  - Produção: Lê origens da variável `ALLOWED_ORIGINS` do `.env`

### 2. **FileUploadConfig.java** - Upload CORS Dinâmico
- ❌ **Removido:** IPs hardcoded para uploads
- ✅ **Agora:** Lê `ALLOWED_ORIGINS` do ambiente (mesma variável)
- 📝 **Comportamento:** Upload de imagens funciona para qualquer IP/domínio configurado

### 3. **docker-compose.yml** - Variável ALLOWED_ORIGINS
- ✅ **Adicionado:** Passagem da variável `ALLOWED_ORIGINS` para o container backend
- 📝 **Comportamento:** Container recebe configuração do arquivo `.env`

### 4. **.env.example** - Documentação CORS
- ✅ **Adicionado:** Seção explicativa sobre `ALLOWED_ORIGINS`
- 📝 **Exemplos:** Localhost, VPS, domínio, múltiplas origens

---

## 🚀 Como Configurar para VPS

### Passo 1: Criar arquivo `.env`
```bash
cp .env.example .env
```

### Passo 2: Editar `.env` com o IP da sua VPS
```bash
# Substitua SEU_IP pelo IP real da VPS
ALLOWED_ORIGINS=http://SEU_IP,http://SEU_IP:3000,https://SEU_IP
```

**Exemplo real:**
```bash
ALLOWED_ORIGINS=http://146.190.136.183,http://146.190.136.183:3000,https://146.190.136.183
```

**Com domínio (futuro):**
```bash
ALLOWED_ORIGINS=https://meusite.com,https://www.meusite.com
```

### Passo 3: Deploy
```bash
docker-compose up -d --build
```

---

## 📋 Checklist de Configuração

Antes de fazer deploy, confirme:

- [ ] Arquivo `.env` criado a partir do `.env.example`
- [ ] `ALLOWED_ORIGINS` configurado com o IP/domínio da VPS
- [ ] `POSTGRES_PASSWORD` alterado (segurança)
- [ ] `MERCADOPAGO_ACCESS_TOKEN` configurado (se usar pagamentos)
- [ ] `MAIL_*` configurado (SendGrid ou Gmail para envio de emails)

---

## 🔍 Teste Local Antes do Deploy

Para testar se a configuração está correta:

```bash
# 1. Crie o .env
cp .env.example .env

# 2. Configure ALLOWED_ORIGINS para localhost
# .env:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# 3. Suba os containers
docker-compose up -d --build

# 4. Teste a API
curl http://localhost:8080/api/health
```

---

## 🌐 Diferença Entre Ambientes

| Ambiente | ALLOWED_ORIGINS | VITE_API_BASE_URL |
|----------|-----------------|-------------------|
| **Desenvolvimento** | `http://localhost:3000` | `http://localhost:8080` |
| **VPS (IP)** | `http://SEU_IP,http://SEU_IP:3000` | `http://SEU_IP:8080` |
| **Produção (Domínio)** | `https://meusite.com` | `https://meusite.com/api` |

---

## ❓ FAQ

### 1. Preciso recompilar o código ao mudar de IP?
**Não!** Agora basta editar o arquivo `.env` e reiniciar os containers:
```bash
docker-compose restart backend
```

### 2. Como adicionar múltiplas origens?
Separe por vírgula:
```bash
ALLOWED_ORIGINS=http://ip1,http://ip2,https://dominio.com
```

### 3. E se eu usar Nginx?
Configure o Nginx e depois:
```bash
ALLOWED_ORIGINS=https://meu-dominio.com
```

### 4. Funciona com HTTP e HTTPS?
Sim! Adicione ambos:
```bash
ALLOWED_ORIGINS=http://meusite.com,https://meusite.com
```

---

## 🎯 Resultado

✅ **Código 100% portável** - Funciona em qualquer VPS/domínio  
✅ **Sem hardcoding** - Nenhum IP fixo no código  
✅ **Fácil manutenção** - Altere apenas o `.env`  
✅ **Pronto para produção** - Segue melhores práticas

---

## 📚 Próximos Passos

Siga o guia completo de deploy: `SETUP_VPS_COMPLETO.md`
