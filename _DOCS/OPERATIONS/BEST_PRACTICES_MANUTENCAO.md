# 📋 BEST PRACTICES - MANUTENÇÃO DA ORGANIZAÇÃO

**Última atualização:** 24 de Março de 2026  
**Versão:** 1.0

---

## 🎯 COMO MANTER A ORGANIZAÇÃO

### 1. NOMENCLATURA DE DOCUMENTOS

#### ✅ Padrão CORRETO:
```
TEMA_DESCRICAO_ESPECIFICO.md
```

**Exemplos corretos:**
```
INTEGRACAO_UBER_DIRECT_API.md
CORRECAO_BUG_ACESSO_LOJISTAS.md
GUIA_DEPLOY_VPS_SEGURO.md
SISTEMA_GEOLOCALIZACAO_COMPLETO.md
OTIMIZACAO_CPU_JANEIRO_2026.md
```

#### ❌ Padrão INCORRETO (Evitar):
```
UberDirect.md               ← Não usar camelCase
uber-integration.md         ← Não usar hífens
Deploy_Guide.pdf            ← Não usar formatos diferentes
doc1.md                     ← Não usar nomes genéricos
v2.0-setup.md               ← Versão no meio do nome
```

---

### 2. ESTRUTURA DO DOCUMENTO

Cada novo documento deve começar com:

```markdown
# TITULO_DO_DOCUMENTO

**Tema:** [Categoria do documento]  
**Objetivo:** [O que o documento resolve/ensina]  
**Data:** [Data de criação]  
**Último update:** [Data da última atualização]  
**Autor:** [Seu nome]  
**Tags:** [tag1, tag2, tag3]

---

## 📋 TABELA DE CONTEÚDO
1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Passos](#passos)
4. [Troubleshooting](#troubleshooting)

---

## 📝 Introdução
[Conteúdo...]

---

## ✅ Pré-requisitos
[Conteúdo...]

---

## 🔧 Passos
[Conteúdo...]

---

## 🐛 Troubleshooting
[Conteúdo...]
```

---

### 3. QUAL PASTA USAR?

#### 🚗 UBER/
```
Quando: Integração Uber Direct, Sistema de Entregas, Frete
Exemplos:
  ✓ INTEGRACAO_UBER_DIRECT_API.md
  ✓ GUIA_CONFIGURACAO_UBER_SANDBOX.md
  ✓ STATUS_SISTEMA_ENTREGAS_PROFISSIONAL.md
  ✗ (Não colocar: DEPLOY_PAGARME.md - deveria ir em PAGAMENTO)
```

#### 🗄️ DB/
```
Quando: Banco de dados, alterações estruturais, recovery
Exemplos:
  ✓ ANALISE_ESTRUTURA_BD.md
  ✓ HOTFIX_CONEXOES_DB.md
  ✓ PROCEDIMENTO_BACKUP_COMPLETO.md
  ✗ (Não colocar: ERRO_CONEXAO_UBER.md - deveria ir em BUGS)
```

#### 💳 PAGAMENTO/
```
Quando: Pagarme, PIX, Split, transações, gateway
Exemplos:
  ✓ CONFIGURACAO_PAGARME_SANDBOX_PRODUCAO.md
  ✓ SPLIT_PAGAMENTOS_GUIA_COMPLETO.md
  ✓ INTEGRACAO_PIX_COMPLETA.md
  ✗ (Não colocar: CORRECAO_ERRO_PAGARME.md - se é correção, deveria ir em BUGS)
```

#### 🚀 DEPLOY/
```
Quando: VPS, Infraestrutura, Deploy, SSL/HTTPS
Exemplos:
  ✓ SETUP_VPS_COMPLETO.md
  ✓ GUIA_DEPLOY_SEGURO.md
  ✓ CONFIGURACAO_SSL_HTTPS.md
  ✗ (Não colocar: INTEGRACAO_GITHUB.md - deveria ir em DOCS_GERAL)
```

#### ⭐ FEATURES/
```
Quando: Novos sistemas, features implementadas
Exemplos:
  ✓ SISTEMA_GEOLOCALIZACAO_COMPLETO.md
  ✓ IMPLEMENTACAO_WEBSOCKET.md
  ✓ SISTEMA_BANNERS_PROFISSIONAL.md
  ✗ (Não colocar: BUG_WEBSOCKET.md - se é bug, deveria ir em BUGS)
```

#### 🐛 BUGS/
```
Quando: Correções, fixes, troubleshooting
Exemplos:
  ✓ CORRECAO_ACESSO_LOJISTAS.md
  ✓ HOTFIX_IMAGENS_NAO_EXIBEM.md
  ✓ RESUMO_CORRECOES_PAGAMENTO.md
  ✗ (Não colocar: GUIA_USAR_API_UBER.md - deveria ir em UBER)
```

#### ⚡ PERFORMANCE/
```
Quando: Otimizações, benchmarks, escalabilidade
Exemplos:
  ✓ OTIMIZACOES_PERFORMANCE.md
  ✓ OTIMIZACAO_CPU_JANEIRO_2026.md
  ✓ GUIA_APLICAR_OTIMIZACOES.md
  ✗ (Não colocar: LENTIDAO_VPS.md - se é problema, deveria ir em BUGS)
```

#### 📖 DOCS_GERAL/
```
Quando: Documentação geral, guias, sumários, compliance
Exemplos:
  ✓ START_HERE.md
  ✓ QUICK_START_E2E.md
  ✓ SECURITY.md
  ✓ CODE_OF_CONDUCT.md
  ✓ GITHUB_ORGANIZATION_GUIDE.md
  ✗ (Não colocar: GUIA_UBER_API.md - deveria ir em UBER)
```

---

### 4. REGRAS IMPORTANTES

#### 🚫 Não faça isso:

```markdown
❌ Colocar 2 temas em 1 arquivo
   Ruim: DEPLOY_E_PAGAMENTO_SETUP.md
   Bom: Deploy em DEPLOY/SETUP_COMPLETO.md
        Pagamento em PAGAMENTO/SETUP_PAGARME.md

❌ Nomes genéricos
   Ruim: GUIA.md, INFO.md, README.md (sem contexto)
   Bom: GUIA_DEPLOY_VPS_SEGURO.md

❌ Espacos em branco
   Ruim: "Guia Deploy VPS.md"
   Bom: "GUIA_DEPLOY_VPS.md"

❌ Caracteres especiais
   Ruim: "guia@deploy.md", "setup/vps.md"
   Bom: "GUIA_DEPLOY_VPS.md"

❌ Versões no nome
   Ruim: "v2.0_Setup.md", "v1_Config.md"
   Bom: "SETUP_COMPLETO.md"
   (Use git para versionamento)

❌ Duplicação
   Ruim: GUIA_SETUP_VPS.md, SETUP_VPS_GUIA.md (mesma coi)
   Bom: Manter apenas GUIA_SETUP_VPS_COMPLETO.md
```

---

### 5. PROCESSO AO CRIAR NOVO DOCUMENTO

#### Step 1️⃣ - Classifique o tema
```
Pergunta: "Qual é o tema principal?"
  → Uber? → UBER/
  → Banco de dados? → DB/
  → Pagamento? → PAGAMENTO/
  → Deploy/VPS? → DEPLOY/
  → Nova feature? → FEATURES/
  → Correção de bug? → BUGS/
  → Otimização? → PERFORMANCE/
  → Documentação solta? → DOCS_GERAL/
```

#### Step 2️⃣ - Nomeie o arquivo
```
Formato: TEMA_DESCRICAO_DETALHE.md

Exemplos:
  ✓ INTEGRACAO_UBER_DIRECT_API.md
  ✓ GUIA_DEPLOY_VPS_SEGURO.md
  ✓ CORRECAO_BUG_ACESSO_LOJISTAS.md
  ✓ OTIMIZACAO_CPU_JANEIRO_2026.md
```

#### Step 3️⃣ - Estruture o documento
```markdown
# Título do Documento

**Tema:** [Categoria]
**Objetivo:** [O que resolve]
**Tags:** [tag1, tag2]

---

[Conteúdo estruturado...]
```

#### Step 4️⃣ - Salve na pasta correta
```
_DOCS/
├── UBER/
│   └── SEU_ARQUIVO.md ← Aqui!
├── DB/
├── PAGAMENTO/
... etc
```

#### Step 5️⃣ - (Opcional) Atualize INDEX_ESTRUTURA.md
```
Se criar categoria nova ou documento importante,
adicione referência ao INDEX_ESTRUTURA.md
```

---

### 6. CHECKLISTA ANTES DE SALVAR

```markdown
☐ Arquivo está em UPPERCASE_COM_UNDERSCORES.md?
☐ Pasta selecionada é a correta?
☐ Conteúdo está bem estruturado?
☐ Há tabela de conteúdo?
☐ Há exemplos ou exemploes práticos?
☐ Há seção de troubleshooting (se aplicável)?
☐ Não há duplicação com outros arquivos?
☐ Links internos funcionam?
☐ Formatação markdown está correta?
☐ Timestamps estão preenchidos?
```

---

### 7. SINAIS DE ALERTA 🚨

```
⚠️  Se encontrar isso, algo está errado:

1. Arquivo em pasta errada
   Solução: Mova para pasta correta
   
2. Nome inconsistente
   Solução: Renomeie para padrão UPPERCASE_COM_UNDERSCORES.md
   
3. Duplicação de conteúdo
   Solução: Mantenha 1, delete outro, link para referência
   
4. Arquivo muito longo (>50KB)
   Solução: Divida em múltiplos arquivos menores
   
5. Documento sem contexto
   Solução: Adicione título, objetivo, tags descritivas
   
6. Links quebrados
   Solução: Corrija caminhos ou links
```

---

### 8. REVISÃO PERIÓDICA

#### Mensal:
```
□ Arquivos ainda relevantes?
□ Algum arquivo obsoleto? (marcar com [DEPRECATED])
□ Há novos documentos sem organização?
□ Alguma pasta ficou muito grande? (considere subdividir)
```

#### Trimestral:
```
□ Atualizar INDEX_ESTRUTURA.md se houver mudanças
□ Consolidar documentos redundantes
□ Arquivar documentos antigos em pasta ARCHIVED/ (se necessário)
□ Revisar nomenclatura
```

---

### 9. EXEMPLO COMPLETO - NOVO DOCUMENTO

```markdown
# GUIA_INTEGRACAO_NOVA_API_EXTERNA

**Tema:** FEATURES  
**Objetivo:** Implementar integração com API externa XYZ  
**Data:** 24/03/2026  
**Autor:** Seu Nome  
**Tags:** integração, api-externa, feature

---

## 📋 Tabela de Conteúdo
1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Autenticação](#autenticação)
4. [Implementação](#implementação)
5. [Testes](#testes)
6. [Troubleshooting](#troubleshooting)

---

## 📝 Introdução

Descrever por que integrar...

---

## ✅ Pré-requisitos

- Java 17+
- Spring Boot 3.2
- Docker
- Conta na API XYZ

---

## 🔐 Autenticação

Explicar como autenticar...

---

## 🛠️ Implementação

Passo a passo com exemplos...

---

## ✨ Testes

Como testar a integração...

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro 401 | Verifique credenciais... |
| Timeout | Aumentar timeout em... |

---

**Referências:**
- Link para API docs: [aqui](url)
- Documento relacionado: `FEATURES/OUTRO_SISTEMA.md`
```

---

## ✨ RESUMO

**Mantenha a organização:**
1. ✅ Use nomenclatura padrão UPPERCASE_COM_UNDERSCORES.md
2. ✅ Escolha a pasta temática correta
3. ✅ Estruture bem o documento
4. ✅ Não duplique conteúdo
5. ✅ Revise periodicamente

**Resultado:**
- 📂 Organização mantida e profissional
- 🎯 Documentos fáceis de encontrar
- ⚡ Onboarding rápido para novos devs
- 🚀 Escalabilidade garantida

---

**Status:** ✅ DOCUMENTO ATIVO  
**Próxima revisão:** Julho 2026
