# 💰 Guia Completo: Split de Pagamentos e Aspectos Fiscais

## 📋 Índice
1. [Como Funciona o Split (Arquitetura Atual)](#como-funciona)
2. [Modelo de Negócio](#modelo-de-negocio)
3. [Aspectos Fiscais e Imposto de Renda](#aspectos-fiscais)
4. [Configuração Profissional](#configuracao)
5. [Fluxo Completo do Dinheiro](#fluxo-dinheiro)
6. [Relatórios e Contabilidade](#relatorios)

---

## 🏗️ Como Funciona o Split (Arquitetura Atual) {#como-funciona}

### Seu sistema já está implementado assim:

```java
// Em PagarMeService.java (linhas 150-183)

// MARKETPLACE RECEBE: Comissão + Frete
int comissaoCentavos = valorProdutos * 12% / 100;
int splitMarketplace = comissaoCentavos + valorFrete;

// LOJISTA RECEBE: Produtos - Comissão
int splitLojista = valorProdutos - comissaoCentavos;
```

### Exemplo Prático:

**Venda de R$ 100,00 + R$ 15,00 frete:**

```
┌─────────────────────────────────────────────┐
│ Cliente paga: R$ 115,00                     │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Pagar.me recebe     │
        │     R$ 115,00         │
        └───────────────────────┘
                    ↓
        ┌─────────────┬─────────────┐
        ↓             ↓             ↓
   Marketplace      Lojista      Pagar.me
   R$ 27,00         R$ 88,00     Taxa ~3%
   (12% + frete)    (88%)        ~R$ 3,45
```

**Breakdown:**
- Marketplace: R$ 12,00 (comissão) + R$ 15,00 (frete) = **R$ 27,00**
- Lojista: R$ 100,00 - R$ 12,00 = **R$ 88,00**
- Pagar.me: ~3% do total = **R$ 3,45** (taxa de processamento)

---

## 💼 Modelo de Negócio {#modelo-de-negocio}

### 1. Modelo Atual (✅ RECOMENDADO FISCALMENTE)

**Você é um INTERMEDIADOR, não um VENDEDOR:**

```
┌────────────────────────────────────────────────────────┐
│ MODELO: Marketplace como Prestador de Serviços        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ✅ Você NÃO compra e revende produtos                 │
│ ✅ Você cobra taxa/comissão pela intermediação        │
│ ✅ Cada lojista emite nota fiscal própria             │
│ ✅ Você emite nota fiscal de SERVIÇO (comissão)       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 2. Responsabilidades Legais

| Item | Responsável | Nota Fiscal |
|------|-------------|-------------|
| **Venda do Produto** | Lojista | NF-e (Mercadoria) ICMS |
| **Comissão de 12%** | Marketplace (você) | NFS-e (Serviço) ISS |
| **Frete** | Marketplace (você) | NFS-e (Serviço) |
| **Chargeback** | Marketplace (você) | Responsabilidade² |

² Seu código já configura `"liable": true` para o marketplace (correto!)

### 3. Configuração da Comissão

```java
// Em PagamentoService.java (linha 311)
BigDecimal percentualComissao = new BigDecimal("12.00"); // 12% padrão
```

**Como definir o percentual ideal:**

| Percentual | Serviços Inclusos | Cenário |
|-----------|-------------------|---------|
| **8-10%** | Apenas plataforma básica | Baixo valor agregado |
| **12-15%** | Plataforma + Marketing + Suporte | **RECOMENDADO** (seu caso) |
| **15-20%** | Full service + Logística gerenciada | Alto valor agregado |

---

## 🧾 Aspectos Fiscais e Imposto de Renda {#aspectos-fiscais}

### 1. O que você DECLARA no IR

#### 📊 Pessoa Jurídica (MEI/Simples Nacional - RECOMENDADO)

```
RECEITA BRUTA = Comissões + Frete recebidos

Exemplo mensal:
- 100 vendas de R$ 100,00 cada = R$ 10.000,00 em produtos
- Comissão 12% = R$ 1.200,00
- Frete médio R$ 15/venda = R$ 1.500,00
───────────────────────────────────────────
RECEITA BRUTA DO MARKETPLACE: R$ 2.700,00
```

**Impostos (Simples Nacional - Anexo III Serviços):**
- Até R$ 180k/ano: ~6% a 9,5%
- Exemplo: R$ 2.700,00 × 6% = **R$ 162,00/mês**

#### 🧑 Pessoa Física (❌ NÃO RECOMENDADO)

```
PROBLEMA: Você paga IR sobre TODO o valor que passa pela sua conta

Exemplo:
- Cliente paga R$ 115,00
- Dinheiro cai na sua conta: R$ 115,00
- Você repassa R$ 88,00 ao lojista
───────────────────────────────────────────
IR vê: RECEITA de R$ 115,00 (errado!)
Mas você só ficou com: R$ 27,00 (certo!)
```

⚠️ **ALERTA FISCAL:** Operar como PF em marketplace é PROBLEMÁTICO porque:
1. Você paga IR sobre o valor total (não apenas sua comissão)
2. Difícil comprovar que é "repasse" ao lojista
3. Alto risco de autuação pela Receita Federal

---

### 2. Documentos Fiscais Necessários

#### Para o Marketplace (você):

```xml
<NotaFiscalServico>
  <Tomador>Lojista XPTO</Tomador>
  <Servico>Comissão por venda no marketplace</Servico>
  <ValorServicos>12.00</ValorServicos>
  <Descricao>Comissão ref. venda #12345</Descricao>
  <Impostos>ISS 2,5%</Impostos>
</NotaFiscalServico>
```

**Quando emitir:**
- Mensal: NFS-e com total de comissões do lojista
- Por venda: Cada venda (mais trabalhoso, mas mais preciso)

#### Para o Lojista:

```xml
<NotaFiscalEletronica>
  <Destinatario>Cliente Final</Destinatario>
  <Produto>Produto XYZ</Produto>
  <ValorProduto>100.00</ValorProduto>
  <ICMS>18%</ICMS>
  <ChaveNFe>1234567890...</ChaveNFe>
</NotaFiscalEletronica>
```

---

### 3. Estrutura Contábil Correta

#### Seu Plano de Contas:

```
RECEITAS
├── Comissões sobre vendas (R$ 1.200,00)
└── Serviços de frete (R$ 1.500,00)

DESPESAS
├── Taxa Pagar.me (~3% sobre comissão)
├── Infraestrutura (servidor, etc)
├── Marketing
└── Pessoal

CONTAS A PAGAR/RECEBER
├── NÃO inclui valor dos produtos
└── APENAS sua comissão e frete
```

**❌ ERRO COMUM:**
```
RECEITA: R$ 10.000,00 (valor dos produtos)
DESPESA: R$ 8.800,00 (repasse aos lojistas)
LUCRO: R$ 1.200,00
```

**✅ CORRETO:**
```
RECEITA: R$ 2.700,00 (comissão + frete)
DESPESA: R$ 500,00 (custos operacionais)
LUCRO: R$ 2.200,00
```

---

## ⚙️ Configuração Profissional {#configuracao}

### 1. Habilitar Split no Pagar.me

**Contato com Pagar.me:**

```
Assunto: Habilitação de Split de Pagamentos

Olá, equipe Pagar.me,

Solicito a habilitação da funcionalidade de "divisão de recebíveis" 
(split payments) na minha conta:

- Account ID: [seu ID]
- CNPJ: [seu CNPJ]
- Tipo de negócio: Marketplace/Plataforma de e-commerce

Preciso da funcionalidade para dividir pagamentos automaticamente 
entre o marketplace e os lojistas parceiros.

Já tenho a integração via API implementada e testada.

Aguardo retorno.
```

### 2. Configurar Recipients

#### A. Criar Recipient do Marketplace:

```bash
# Via interface adminque você já tem
1. Acesse: winmarketplace.com.br/admin/recipients
2. Clique em "Criar Recipient"
3. Preencha dados da EMPRESA (marketplace)
4. Salve o Recipient ID: re_XXXXX
```

#### B. Configurar no Sistema:

```sql
-- No banco de dados
UPDATE configuracoes 
SET 
  pagarme_recipient_id_marketplace = 're_XXXXX',
  taxa_comissao_win = 12.00
WHERE id = 1;
```

#### C. Criar Recipients dos Lojistas:

```bash
# Para cada lojista
1. Acesse: /admin/recipients
2. Escolha o lojista no dropdown
3. Preencha dados bancários do LOJISTA
4. Sistema vincula automaticamente
```

### 3. Testar Split

```bash
# 1. Fazer um pedido de teste
# 2. Verificar logs:
docker compose logs backend | grep "Split configurado"

# Output esperado:
💰 Split configurado - Marketplace: R$ 27.00 (12% + frete), Lojista: R$ 88.00
```

### 4. Validar no Dashboard Pagar.me

```
1. Acesse: https://dash.pagar.me/
2. Busque a transação
3. Veja aba "Split"
4. Confirme:
   ✅ Marketplace recebeu comissão + frete
   ✅ Lojista recebeu produtos - comissão
```

---

## 💸 Fluxo Completo do Dinheiro {#fluxo-dinheiro}

### Timeline de Recebimento:

```
DIA 0 (Venda)
├─ Cliente paga R$ 115,00 via PIX
└─ Dinheiro fica na Pagar.me

DIA 1 (D+1) - PIX
├─ Pagar.me libera o split
├─ Marketplace recebe: R$ 27,00 - taxa Pagar.me
└─ Lojista recebe: R$ 88,00

DIA 30 (Cartão de Crédito)
├─ Prazo padrão: 30 dias
└─ Mesma divisão do PIX
```

### Taxas Pagar.me (estimadas):

| Método | Taxa | Quem Paga |
|--------|------|-----------|
| PIX | ~0,99% | Marketplace (`liable: true`) |
| Cartão Débito | ~1,99% | Marketplace |
| Cartão Crédito | ~3,99% | Marketplace |
| Boleto | R$ 3,49 | Marketplace |

**Seu código configura corretamente:**
```java
"charge_processing_fee", true  // Marketplace paga taxas
```

---

## 📊 Relatórios e Contabilidade {#relatorios}

### 1. Relatórios Mensais Necessários

```sql
-- Receita de Comissões (para seu contador)
SELECT 
  DATE_TRUNC('month', p.criado_em) AS mes,
  SUM(pp.total * 0.12) AS total_comissoes,
  COUNT(*) AS qtd_vendas,
  SUM(pp.valor_frete) AS total_fretes,
  SUM(pp.total * 0.12 + COALESCE(pp.valor_frete, 0)) AS receita_bruta_marketplace
FROM pedidos pp
JOIN pagamentos p ON p.pedido_id = pp.id
WHERE p.status = 'CONFIRMADO'
  AND pp.criado_em >= '2026-01-01'
GROUP BY mes
ORDER BY mes;
```

### 2. Extratos para Lojistas

```sql
-- Quanto cada lojista deve receber
SELECT 
  l.nome_fantasia,
  DATE_TRUNC('month', pp.criado_em) AS mes,
  SUM(pp.total - pp.valor_frete) AS valor_produtos,
  SUM((pp.total - pp.valor_frete) * 0.88) AS valor_a_receber_lojista,
  COUNT(*) AS qtd_vendas
FROM pedidos pp
JOIN itens_pedido ip ON ip.pedido_id = pp.id
JOIN produtos pr ON pr.id = ip.produto_id
JOIN lojistas l ON l.id = pr.lojista_id
WHERE pp.status = 'CONCLUIDO'
GROUP BY l.id, l.nome_fantasia, mes
ORDER BY mes, l.nome_fantasia;
```

### 3. Conciliação Bancária

```sql
-- Conferir se valores batem com extrato bancário
SELECT 
  DATE(p.criado_em) AS data,
  COUNT(*) AS qtd_transacoes,
  SUM(pp.total * 0.12 + COALESCE(pp.valor_frete, 0)) AS esperado_marketplace,
  SUM(pp.total * 0.88) AS esperado_lojistas
FROM pagamentos p
JOIN pedidos pp ON pp.id = p.pedido_id
WHERE p.status = 'CONFIRMADO'
  AND p.metodo = 'PIX_PAGARME'
GROUP BY DATE(p.criado_em)
ORDER BY data DESC;
```

---

## ✅ Checklist de Configuração

### Antes de Habilitar Split:

- [ ] Cadastrar CNPJ do marketplace
- [ ] Enviar documentos para Pagar.me (contrato social, etc)
- [ ] Aguardar aprovação (5-10 dias úteis)
- [ ] Receber confirmação de split habilitado

### Configuração Técnica:

- [ ] Criar recipient do marketplace no Pagar.me
- [ ] Atualizar `pagarme_recipient_id_marketplace` no banco
- [ ] Definir `taxa_comissao_win` (12%)
- [ ] Criar recipients dos lojistas ativos
- [ ] Testar com pedido real (valor baixo)
- [ ] Validar split no dashboard Pagar.me

### Configuração Fiscal:

- [ ] Definir CNAE correto (6311-9/00 - Tratamento de dados)
- [ ] Configurar emissão de NFS-e automática
- [ ] Integrar com sistema contábil
- [ ] Criar planilha de conciliação mensal
- [ ] Orientar lojistas sobre NF-e de produtos

---

## 🚨 Avisos Importantes

### 1. Chargeback é sua Responsabilidade

```java
// Seu código (correto):
"liable", true  // Marketplace responsável
```

**Isso significa:**
- Se cliente pedir estorno, desconta da SUA conta
- Lojista mantém o dinheiro dele
- Você assume o risco da operação

**Proteção:**
- Política clara de devolução
- Moderação de lojistas
- Análise antifraude
- Seguro contra chargebacks (opcional)

### 2. Frete é Receita de Serviço

```
Frete = Serviço de logística = ISS (2% a 5%)
NÃO confundir com ICMS (tributo sobre mercadoria)
```

### 3. Não Misture Contas

```
❌ ERRADO: Usar conta PF para receber
✅ CERTO: Conta PJ exclusiva do marketplace
```

---

## 💡 Dicas Profissionais

### 1. Automação Contábil

Crie um endpoint para seu contador:

```java
@GetMapping("/api/v1/admin/relatorios/fiscal-mensal")
public RelatórioFiscal gerarRelatorioMensal(
    @RequestParam int mes,
    @RequestParam int ano
) {
    // Retorna JSON com:
    // - Total de comissões
    // - Total de fretes
    // - Split por lojista
    // - Impostos estimados
}
```

### 2. Dashboard Financeiro

Mostre para lojistas quanto vão receber:

```jsx
// No painel do lojista
<Card>
  <h3>Previsão de Recebimento</h3>
  <p>Valor vendido: R$ 1.000,00</p>
  <p>Taxa marketplace (12%): - R$ 120,00</p>
  <p>Seu líquido: R$ 880,00</p>
  <small>Prazo: D+1 (PIX) ou D+30 (Cartão)</small>
</Card>
```

### 3. Transparência

No checkout, mostrar para o cliente:

```
Produto: R$ 100,00
Frete: R$ 15,00
Total: R$ 115,00

Vendido por: Loja ABC
Intermediado por: WIN Marketplace
```

---

## 📞 Próximos Passos

1. **Contatar Pagar.me**: Solicitar habilitação de split
2. **Aguardar aprovação**: 5-10 dias úteis
3. **Criar recipient do marketplace**: Via admin panel
4. **Atualizar configuração**: SQL no banco
5. **Criar recipients dos lojistas**: Um por um
6. **Testar em ambiente real**: Pedido de R$ 10,00
7. **Validar recebimento**: Conferir extratos
8. **Ir para produção**: Habilitar para todos

---

## 📚 Referências

- [Documentação Split Pagar.me](https://docs.pagar.me/docs/split-de-pagamento)
- [Simples Nacional - Anexo III](http://www8.receita.fazenda.gov.br/SimplesNacional/)
- [ISS sobre comissões](https://www.gov.br/receitafederal/pt-br)
- [Marketplace como intermediador](https://www.contabilizei.com.br/contabilidade-online/marketplace/)

---

**Dúvidas?** 
- Fale com seu contador sobre CNAE e regimes tributários
- Contate Pagar.me para habilitar split
- Revise contratos com lojistas (cláusula de comissão)

**Seu código já está profissional.** Agora é só habilitar no Pagar.me! 🚀
