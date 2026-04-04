# 🔗 Como Usar a Integração ERP - Guia Completo

## 📋 Visão Geral

Este guia explica como **criar produtos no Win Marketplace** usando dados de produtos já cadastrados no seu ERP (NavSoft, Tiny ou outro).

### ✅ O que o sistema faz automaticamente:

1. **Busca dados do produto no ERP** pelo SKU
2. **Preenche automaticamente**:
   - ✓ Nome do produto
   - ✓ Descrição
   - ✓ Preço
   - ✓ Estoque
   - ✓ Código de barras (GTIN/EAN)
   - ✓ Peso
   - ✓ **Imagem principal** (se disponível no ERP)
   - ✓ Marca
   - ✓ Categoria
3. **Sincroniza estoque periodicamente** (a cada 5 minutos por padrão)
4. **Desativa produtos automaticamente** se ficarem inativos no ERP

---

## 🚀 Passo a Passo

### 1️⃣ Configurar o ERP (Primeira vez)

#### **Obter Chave/Token do ERP**

Antes de configurar, você precisa da chave de API do seu ERP:

📖 **Guias Disponíveis:**
- **NavSoft:** Veja [COMO_OBTER_CHAVE_API_NAVSOFT.md](COMO_OBTER_CHAVE_API_NAVSOFT.md)
- **Tiny:** Veja [COMO_OBTER_TOKEN_API_TINY.md](COMO_OBTER_TOKEN_API_TINY.md)

#### **Configurar no Win Marketplace**

1. Acesse **Menu > Integração ERP**
2. Selecione o tipo de ERP:
   - **NavSoft** - ERP completo para gestão empresarial
   - **Tiny** - ERP online popular para PMEs
   - **API Customizada** - Se seu ERP tem API REST própria
   - **Manual** - Sem sincronização automática
3. Preencha:
   - **URL da API** (opcional se usar URL padrão)
     - NavSoft: `https://api.navsoft.com.br` (padrão)
     - Tiny: `https://api.tiny.com.br/api2` (padrão)
   - **Chave de API** ou Token (cole o que você obteve)
   - **Frequência de sincronização** (padrão: 5 minutos)
4. Clique em **Salvar e Testar Conexão**

✅ O sistema testa a conexão antes de salvar!

---

### 2️⃣ Criar Produto Usando o ERP

#### **Opção A: Importar do ERP** (Recomendado)

1. Acesse **Produtos > Adicionar Produto**
2. Selecione o toggle **"Importar do ERP"**
3. Digite o **SKU do produto no ERP**
4. Clique em **"Buscar"**
5. **Revise os dados** encontrados:
   - Nome, preço, estoque, descrição
   - Imagem (se disponível)
6. Clique em **"Importar Dados do ERP"**
7. Os campos serão preenchidos automaticamente
8. Ajuste o que for necessário (categoria, imagens adicionais)
9. Clique em **"Salvar Produto"**

✅ O produto é criado no Win e **vinculado ao ERP** automaticamente!

#### **Opção B: Manual + Vincular depois**

1. Crie o produto normalmente (modo manual)
2. Depois, edite o produto
3. Busque o SKU do ERP e importe os dados

---

### 3️⃣ Sincronização Automática

Após vincular um produto ao ERP:

- ✅ **Estoque sincroniza automaticamente** a cada 5 minutos (configurável)
- ✅ Se o produto ficar **inativo no ERP**, ele é desativado no Win também
- ✅ Preço, nome e outros dados **NÃO são sobrescritos** automaticamente (apenas o estoque)
- ✅ Para atualizar outros dados, use o botão **"Sincronizar Manualmente"** na edição do produto

---

## 📊 Campos Importados do ERP

| Campo | Descrição | Sincronização |
|-------|-----------|---------------|
| **Nome** | Nome do produto | ❌ Apenas na importação inicial |
| **Descrição** | Descrição completa | ❌ Apenas na importação inicial |
| **Preço** | Preço de venda | ❌ Apenas na importação inicial |
| **Estoque** | Saldo disponível | ✅ **Automática** (a cada 5 min) |
| **Código de Barras** | GTIN/EAN | ❌ Apenas na importação inicial |
| **Peso** | Peso em kg | ❌ Apenas na importação inicial |
| **Imagem** | URL da imagem principal | ❌ Apenas na importação inicial |
| **Marca** | Fabricante | ❌ Apenas na importação inicial |
| **Categoria** | Categoria no ERP | ❌ Apenas na importação inicial |
| **Status Ativo** | Se está ativo | ✅ **Automática** |

---

## 🖼️ Como Funcionam as Imagens?

### Durante a Importação:

1. O sistema busca a **URL da imagem** no ERP
2. Se o ERP retornar uma imagem válida:
   - ✅ A imagem é **importada automaticamente**
   - ✅ Fica como **primeira imagem** do produto
   - ✅ Texto alternativo: "Imagem importada do ERP (SKU123)"

### Imagens Adicionais:

- Você pode adicionar **mais imagens** manualmente após criar o produto
- As imagens do Win **não são apagadas** durante sincronizações
- A imagem do ERP só é importada **uma vez** (na criação/vinculação)

### Se a Imagem Falhar:

- ❌ O produto é criado **normalmente sem a imagem**
- ⚠️ Um aviso aparece no log, mas **não falha a operação**
- ℹ️ Você pode adicionar imagens manualmente depois

---

## 🔄 Sincronização Manual

### Quando usar:

- Para **forçar atualização imediata** do estoque
- Quando o produto foi alterado no ERP e você quer atualizar no Win

### Como fazer:

1. Edite o produto vinculado ao ERP
2. Clique no botão **"Sincronizar com ERP Agora"**
3. O estoque é atualizado imediatamente

---

## ⚠️ Avisos Importantes

### ✅ O que FUNCIONA:

- ✓ Importar dados completos do ERP (incluindo imagem)
- ✓ Sincronização automática de estoque
- ✓ Desativação automática de produtos inativos
- ✓ Múltiplos produtos vinculados ao mesmo ERP
- ✓ Cada lojista tem seu próprio ERP configurado

### ❌ O que NÃO funciona (ainda):

- ✗ Sincronizar alterações de preço automaticamente
- ✗ Enviar dados do Win para o ERP (sincronização unidirecional: ERP → Win)
- ✗ Importar múltiplas imagens de um produto
- ✗ Criar categorias automaticamente no Win baseado no ERP

---

## 🐛 Solução de Problemas

### "Produto não encontrado no ERP"

**Causas:**
- SKU digitado incorretamente
- Produto não existe no ERP
- Produto está inativo no ERP

**Solução:**
- Verifique o SKU no ERP
- Tente buscar novamente
- Crie o produto manualmente se necessário

---

### "Erro de autenticação no ERP"

**Causas:**
- API Key/Token inválido ou expirado
- Credenciais incorretas

**Solução:**
1. Acesse **Integração ERP**
2. Atualize a **Chave de API**
3. Clique em **Salvar e Testar Conexão**

---

### "Imagem não foi importada"

**Causas:**
- ERP não retornou URL de imagem
- URL da imagem está inválida
- Erro ao baixar a imagem

**Solução:**
- ✅ O produto é criado normalmente
- Adicione imagens manualmente depois
- Verifique se o produto tem imagem cadastrada no ERP

---

### "Estoque não sincroniza"

**Verificações:**
1. Produto está **vinculado ao ERP**? (tem badge verde)
2. **Sincronização está ativa** na configuração do ERP?
3. **Última sincronização** foi bem-sucedida?

**Solução:**
- Force sincronização manual no produto
- Verifique logs de erro na configuração ERP
- Teste a conexão com o ERP novamente

---

## 📈 Boas Práticas

### ✅ Recomendações:

1. **Configure o ERP primeiro** antes de criar produtos
2. **Teste com 1-2 produtos** antes de importar em massa
3. **Use SKUs únicos** - não vincule o mesmo SKU a múltiplos produtos
4. **Monitore a sincronização** - veja status na configuração ERP
5. **Ajuste a frequência** de sincronização conforme necessidade
6. **Mantenha backup** dos produtos antes de grandes importações

### ⚠️ Evite:

- ❌ Alterar estoque manualmente no Win (será sobrescrito pelo ERP)
- ❌ Desvincular produto do ERP sem motivo (perde sincronização)
- ❌ Usar frequência muito baixa (< 1 minuto) - sobrecarrega o ERP
- ❌ Ter produtos com mesmo SKU no Win

---

## 🎯 Resumo Rápido

| Ação | Como Fazer |
|------|------------|
| Configurar ERP | Menu > Integração ERP |
| Criar produto do ERP | Produtos > Adicionar > Toggle "Importar do ERP" |
| Ver status sincronização | Configuração ERP > Status da última sincronização |
| Forçar atualização | Editar produto > Sincronizar com ERP Agora |
| Desvincular produto | Editar produto > Botão "Desvincular do ERP" |
| Alterar frequência | Configuração ERP > Frequência (slider) |

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs na configuração ERP
2. Teste a conexão com o ERP
3. Consulte a documentação da API do seu ERP
4. Entre em contato com o suporte técnico

---

## 🔗 Documentação Técnica

Para desenvolvedores, consulte:
- `INTEGRACAO_MULTI_ERP.md` - Arquitetura completa do sistema
- `INTEGRACAO_ERP_PRODUTO_FORM.md` - Detalhes da integração no frontend
- `INTEGRACAO_ERP_FRONTEND.md` - Guia de desenvolvimento frontend

---

**Última atualização:** 13 de fevereiro de 2026  
**Versão:** 1.1 (com suporte a imagens)
