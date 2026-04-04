# 🔑 Como Obter a Chave API do NavSoft

## 📋 Visão Geral

Este guia explica **passo a passo** como obter a chave de API (Token) do NavSoft ERP para usar na integração com o Win Marketplace.

---

## 🚀 Passo a Passo

### 1️⃣ Acessar o Painel do NavSoft

1. Acesse o sistema NavSoft em: **https://app.navsoft.com.br**
2. Faça login com suas credenciais
3. Você será direcionado ao painel principal

---

### 2️⃣ Acessar a Documentação da API

1. No menu lateral ou superior, procure por:
   - **"API de Integração"**
   - **"Configurações"** → **"API"**
   - **"Integrações"**
   - Ou acesse diretamente: `https://app.navsoft.com.br/api/swagger/index.html`

2. Você verá a página de documentação com várias seções:
   - Boletos
   - Categoria
   - CEP
   - **Configurações** ⭐
   - Contratos
   - Depósitos
   - Empresas
   - Equipamentos
   - **Estoque** ⭐
   - Expedição
   - etc.

---

### 3️⃣ Gerar ou Obter o Token de API

#### **Opção A: Token nas Configurações** (Mais Comum)

1. Clique em **"Configurações"** na documentação ou no menu
2. Procure por:
   - **"Token de Acesso"**
   - **"API Key"**
   - **"Chave de Integração"**
   - **"Token de Autenticação"**

3. Se já existir um token:
   - ✅ **Copie** o token exibido
   - ℹ️ Geralmente tem formato: `abc123xyz456...` (string longa)

4. Se não existir token:
   - Clique em **"Gerar Token"** ou **"Criar Nova Chave"**
   - ✅ **Copie e guarde** o token em local seguro
   - ⚠️ **IMPORTANTE:** Alguns sistemas só mostram o token **uma vez**

---

#### **Opção B: Token no Perfil do Usuário**

1. Acesse seu **perfil** ou **configurações de conta**
2. Procure por uma aba/seção chamada:
   - **"API"**
   - **"Integrações"**
   - **"Tokens de Acesso"**
   - **"Segurança"**

3. Clique em **"Gerar Token de API"** ou **"Ver Tokens"**
4. ✅ Copie o token gerado

---

#### **Opção C: Contatar Suporte do NavSoft**

Se não encontrar onde gerar o token:

1. **Abra um chamado** no suporte do NavSoft
2. Solicite: *"Token de API para integração externa"*
3. Informe que precisa para integração com marketplace
4. Eles fornecerão o token ou ensinarão onde gerar

📞 **Suporte NavSoft:**
- Site: https://navsoft.com.br
- Email: suporte@navsoft.com.br (verificar no sistema)
- Chat: Disponível dentro do sistema

---

### 4️⃣ Testar o Token

Antes de configurar no Win Marketplace, **teste o token**:

#### Usando Postman ou Navegador:

```http
GET https://api.navsoft.com.br/api/v1/produtos/CODIGO_TESTE_SKU
Headers:
  X-API-Key: SEU_TOKEN_AQUI
  Content-Type: application/json
```

#### Resposta Esperada:

- ✅ **200 OK** → Token válido!
- ❌ **401 Unauthorized** → Token inválido ou expirado
- ❌ **403 Forbidden** → Token sem permissões

---

### 5️⃣ Configurar no Win Marketplace

Agora que você tem o token:

1. Acesse **Win Marketplace** → **Menu** → **Integração ERP**
2. Selecione **"NavSoft"** como tipo de ERP
3. **URL da API**: `https://api.navsoft.com.br` (ou deixe padrão)
4. **Chave de API**: Cole o token que você copiou
5. Clique em **"Salvar e Testar Conexão"**

✅ Se aparecer "Conexão bem-sucedida", está funcionando!

---

## 📝 Informações Importantes

### Formato do Token

O token do NavSoft geralmente tem formato:
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234
```
- **Tamanho:** 40-64 caracteres
- **Tipo:** String alfanumérica
- **Sensível a maiúsculas:** Sim

### URL da API

Dependendo da sua instalação do NavSoft:

| Tipo | URL |
|------|-----|
| **Cloud/SaaS** | `https://api.navsoft.com.br` |
| **On-Premise (próprio servidor)** | `https://seu-servidor.com.br/api` |
| **Homologação/Teste** | `https://api-sandbox.navsoft.com.br` |

⚠️ Confirme com o suporte qual URL usar!

---

## 🔒 Segurança do Token

### ✅ Boas Práticas:

- ✓ **Nunca compartilhe** o token publicamente
- ✓ **Não commite** no Git/repositório
- ✓ **Guarde com segurança** (gerenciador de senhas)
- ✓ **Rote periodicamente** (trocar a cada 3-6 meses)
- ✓ **Use HTTPS** sempre nas requisições

### ❌ Evite:

- ✗ Enviar token por email/WhatsApp sem proteger
- ✗ Expor em código frontend
- ✗ Usar o mesmo token em múltiplos sistemas (se possível gerar tokens separados)
- ✗ Compartilhar com terceiros não autorizados

---

## 🐛 Problemas Comuns

### "Não encontro onde gerar o token"

**Soluções:**
1. Procure em **Configurações** → **Integrações/API**
2. Verifique seu **perfil de usuário**
3. Pergunte ao **administrador do sistema** (pode precisar de permissões)
4. Entre em contato com o **suporte NavSoft**

---

### "Token não funciona no Win"

**Verificações:**
1. ✓ Copiou o token **completo** (sem espaços extras)?
2. ✓ URL da API está correta?
3. ✓ Token não está **expirado**?
4. ✓ Usuário tem **permissões de API** habilitadas?
5. ✓ Sistema NavSoft está **online**?

**Teste direto:**
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "https://api.navsoft.com.br/api/v1/health" -Headers @{"X-API-Key"="SEU_TOKEN"}

# Linux/Mac
curl -H "X-API-Key: SEU_TOKEN" https://api.navsoft.com.br/api/v1/health
```

---

### "Token expira frequentemente"

**Soluções:**
1. Verifique nas configurações do NavSoft se há **prazo de validade**
2. Configure **renovação automática** (se disponível)
3. Solicite ao suporte token **sem expiração** para integrações
4. Configure **alertas** de expiração no Win Marketplace

---

## 📞 Precisa de Ajuda?

### Contatos NavSoft:

- **Site:** https://navsoft.com.br
- **Suporte:** Dentro do sistema, procure por "Suporte" ou "Ajuda"
- **Documentação:** https://app.navsoft.com.br/api/swagger/index.html
- **Chat:** Geralmente disponível no canto inferior direito do sistema

### Informações a Fornecer ao Suporte:

1. **Empresa/CNPJ:** Seu cadastro no NavSoft
2. **Objetivo:** "Integração com marketplace externo"
3. **Necessidade:** "Token de API para consulta de produtos e estoque"
4. **Endpoints necessários:**
   - `GET /api/v1/produtos/{sku}` - Buscar produto
   - `GET /api/v1/estoque/{sku}` - Consultar estoque
   - `GET /api/v1/health` - Testar conexão

---

## ✅ Checklist Final

Antes de usar no Win Marketplace:

- [ ] Token copiado e guardado com segurança
- [ ] URL da API confirmada (cloud ou on-premise)
- [ ] Token testado com requisição de exemplo
- [ ] Permissões de API verificadas no NavSoft
- [ ] Documentação da API consultada (endpoints necessários)
- [ ] Suporte contactado se houver dúvidas

---

## 🎯 Próximos Passos

Após obter e testar o token:

1. ✅ Configure no Win Marketplace
2. ✅ Teste com 1-2 produtos primeiro
3. ✅ Importe produtos em lote
4. ✅ Configure sincronização automática
5. ✅ Monitore os logs de sincronização

---

**Última atualização:** 13 de fevereiro de 2026  
**Versão:** 1.0
