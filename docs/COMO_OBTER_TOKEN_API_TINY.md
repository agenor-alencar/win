# 🔑 Como Obter o Token de API do Tiny ERP

## 📋 Visão Geral

Este guia explica **passo a passo** como obter o Token de API do Tiny ERP para usar na integração com o Win Marketplace.

---

## 🚀 Passo a Passo

### 1️⃣ Acessar o Painel do Tiny ERP

1. Acesse o sistema Tiny em: **https://erp.tiny.com.br**
2. Faça login com suas credenciais
3. Você será direcionado ao painel principal

---

### 2️⃣ Acessar as Configurações de API

1. No menu superior, clique em **"Configurações"** (ícone de engrenagem ⚙️)
2. Procure por:
   - **"API"**
   - **"Integrações"**
   - **"Aplicativos"**
3. Ou acesse diretamente: `https://erp.tiny.com.br/Configuracoes.API`

---

### 3️⃣ Gerar o Token de API

#### No Tiny ERP:

1. Na página de **Configurações de API**, você verá:
   - **Status da API:** Ativa/Inativa
   - **Token de Acesso**

2. Se a API estiver **inativa**:
   - Clique em **"Ativar API"**
   - Aceite os termos de uso

3. Se a API já estiver ativa:
   - Você verá seu **Token de Acesso** exibido
   - Formato: `abc123def456...` (string alfanumérica longa)

4. Para **gerar novo token**:
   - Clique em **"Gerar Novo Token"** ou **"Recriar Token"**
   - ⚠️ **IMPORTANTE:** O token antigo será invalidado!

5. ✅ **Copie o token** exibido
   - Clique no ícone de copiar ou selecione e copie manualmente
   - **Guarde em local seguro** - não é possível recuperá-lo depois

---

### 4️⃣ Verificar Permissões

No Tiny, verifique se o token tem permissões para:

- ✓ **Consultar Produtos** (obter.produto)
- ✓ **Consultar Estoque** (obter.estoque)
- ✓ **Consultar Pedidos** (se necessário)

Geralmente o token tem **todas as permissões** por padrão, mas você pode verificar em:
**Configurações → API → Permissões**

---

### 5️⃣ Testar o Token

Antes de configurar no Win Marketplace, **teste o token**:

#### Usando Postman ou Navegador:

```http
GET https://api.tiny.com.br/api2/produto.obter.php?token=SEU_TOKEN&id=1&formato=json
```

#### Resposta Esperada:

- ✅ **200 OK** com JSON → Token válido!
- ❌ **401/403** → Token inválido
- ❌ **Erro "Token inválido"** → Regerar token

---

### 6️⃣ Configurar no Win Marketplace

Agora que você tem o token:

1. Acesse **Win Marketplace** → **Menu** → **Integração ERP**
2. Selecione **"Tiny"** como tipo de ERP
3. **URL da API**: `https://api.tiny.com.br/api2` (ou deixe padrão)
4. **Token de API**: Cole o token que você copiou
5. Clique em **"Salvar e Testar Conexão"**

✅ Se aparecer "Conexão bem-sucedida", está funcionando!

---

## 📝 Informações Importantes

### Formato do Token Tiny

O token do Tiny ERP geralmente tem formato:
```
1234567890abcdef1234567890abcdef12345678
```
- **Tamanho:** 40 caracteres
- **Tipo:** String alfanumérica
- **Sensível a maiúsculas:** Não (Tiny é case-insensitive)

### URLs da API Tiny

| Ambiente | URL |
|----------|-----|
| **Produção** | `https://api.tiny.com.br/api2` |
| **Outros endpoints** | Mesma base, muda apenas o path |

---

## 🔒 Segurança do Token

### ✅ Boas Práticas:

- ✓ **Nunca compartilhe** o token publicamente
- ✓ **Não commite** no Git/repositório
- ✓ **Guarde com segurança** (gerenciador de senhas)
- ✓ **Use HTTPS** sempre nas requisições
- ✓ **Rote periodicamente** se houver suspeita de exposição

### ❌ Evite:

- ✗ Enviar token por email/WhatsApp sem proteger
- ✗ Expor em código frontend
- ✗ Compartilhar com terceiros não autorizados

---

## 🐛 Problemas Comuns

### "Não encontro onde está o token"

**Soluções:**
1. Acesse: **Configurações** (⚙️) → **API**
2. Se não aparecer, sua conta pode não ter **permissões de administrador**
3. Entre em contato com o **administrador da conta**
4. Contate o suporte do Tiny se necessário

---

### "Token não funciona no Win"

**Verificações:**
1. ✓ Copiou o token **completo** (40 caracteres)?
2. ✓ Token foi **ativado** no Tiny?
3. ✓ API do Tiny está **habilitada** na sua conta?
4. ✓ Sua conta Tiny está **ativa** (não expirada)?
5. ✓ Testou o token diretamente na API?

**Teste direto:**
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "https://api.tiny.com.br/api2/info.php?token=SEU_TOKEN&formato=json"

# Linux/Mac
curl "https://api.tiny.com.br/api2/info.php?token=SEU_TOKEN&formato=json"
```

---

### "API está desabilitada"

**Soluções:**
1. Acesse **Configurações → API**
2. Clique em **"Ativar API"**
3. Aceite os **termos de uso**
4. Gere um novo token

---

### "Preciso de um novo token"

**Motivos comuns:**
- Token foi exposto/comprometido
- Token antigo não funciona mais
- Esqueceu o token original

**Solução:**
1. Acesse **Configurações → API**
2. Clique em **"Gerar Novo Token"**
3. ⚠️ **O token antigo será invalidado** (atualize em todas integrações)
4. Copie e guarde o novo token

---

## 📚 Documentação da API Tiny

### Links Úteis:

- **Documentação Oficial:** https://tiny.com.br/ajuda/api/api2
- **Exemplos de Uso:** https://tiny.com.br/ajuda/api/api2/exemplos
- **Lista de Endpoints:** https://tiny.com.br/ajuda/api/api2/metodos

### Endpoints Principais Usados pelo Win:

| Endpoint | Descrição |
|----------|-----------|
| `produto.obter.php` | Buscar produto por ID/código |
| `produto.obter.estoque.php` | Consultar estoque de produto |
| `produtos.pesquisa.php` | Pesquisar produtos |
| `info.php` | Testar conexão/obter info da conta |

---

## 📞 Precisa de Ajuda?

### Contatos Tiny ERP:

- **Site:** https://tiny.com.br
- **Central de Ajuda:** https://tiny.com.br/ajuda
- **Suporte:** https://tiny.com.br/suporte
- **Email:** contato@tiny.com.br
- **Telefone:** (11) 3522-2622
- **Chat:** Disponível dentro do sistema ERP

### Informações a Fornecer ao Suporte:

1. **Empresa/CNPJ:** Seu cadastro no Tiny
2. **Objetivo:** "Integração com marketplace externo"
3. **Necessidade:** "Token de API para consulta de produtos e estoque"
4. **Problema:** Descreva o erro específico se houver

---

## 🆚 Diferenças: Tiny vs NavSoft

| Característica | Tiny | NavSoft |
|----------------|------|---------|
| **Onde obter** | Configurações → API | Configurações → Integrações |
| **Nome** | Token | API Key |
| **Formato** | 40 caracteres | 40-64 caracteres |
| **Autenticação** | Token na URL (`?token=xxx`) | Header `X-API-Key` |
| **URL Base** | `https://api.tiny.com.br/api2` | `https://api.navsoft.com.br` |
| **Rate Limit** | ~500 req/min | ~200 req/min |

---

## ✅ Checklist Final

Antes de usar no Win Marketplace:

- [ ] Token copiado e guardado com segurança
- [ ] API ativada no Tiny ERP
- [ ] Token testado com requisição de exemplo
- [ ] Permissões verificadas (consultar produtos/estoque)
- [ ] Documentação da API consultada

---

## 🎯 Próximos Passos

Após obter e testar o token:

1. ✅ Configure no Win Marketplace
2. ✅ Teste com 1-2 produtos primeiro (use o código/ID do produto)
3. ✅ Importe produtos em lote
4. ✅ Configure sincronização automática (frequência)
5. ✅ Monitore os logs de sincronização

---

## 💡 Dica Extra: Como Encontrar o Código do Produto

No Tiny, o **código do produto** (usado como SKU) pode ser:
- O **ID numérico** do produto
- O **código personalizado** que você definiu
- Encontre em: **Cadastros → Produtos** → Clique no produto → Veja o campo "Código"

---

**Última atualização:** 13 de fevereiro de 2026  
**Versão:** 1.0
