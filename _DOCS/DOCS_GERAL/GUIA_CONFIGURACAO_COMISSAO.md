# Guia de Configuração de Comissão - Win Marketplace

## 📊 Visão Geral

O Win Marketplace possui um sistema completo de configuração de comissão que permite aos administradores ajustar dinamicamente as taxas de split de pagamento sem necessidade de alteração de código ou deploy.

## 🎯 Funcionalidades

### 1. Configuração via Interface Admin

**Localização:** Painel Admin → Configurações → Modelo Financeiro

A página de configurações permite ajustar:

- ✅ **Taxa de Comissão WIN (%)**: Percentual que o marketplace retém sobre produtos
- ✅ **Taxa de Repasse ao Lojista (%)**: Calculado automaticamente (100% - comissão)
- ✅ **Valor Entrega Motorista (R$)**: Valor fixo pago por entrega Uber Flash
- ✅ **Taxa Processamento Pagamento (%)**: Taxa dos gateways de pagamento
- ✅ **Prazo de Repasse (dias)**: Dias úteis para repasse ao lojista (D+N)

### 2. Split de Pagamento Automático

O sistema integra com **Pagar.me** para processamento automático do split:

#### Fluxo de Pagamento:

```
Cliente paga R$ 100,00 (produtos) + R$ 15,00 (frete) = R$ 115,00
│
├─ Comissão configurada: 12%
│
├─ LOJISTA RECEBE:
│  └─ R$ 100,00 × 0.88 = R$ 88,00 (88% dos produtos)
│
└─ MARKETPLACE RECEBE:
   ├─ R$ 100,00 × 0.12 = R$ 12,00 (12% comissão)
   └─ R$ 15,00 (100% do frete)
   └─ TOTAL: R$ 27,00
```

## 🔧 Como Configurar

### Passo 1: Acessar Configurações

1. Faça login como **Administrador**
2. Navegue até: **Dashboard Admin** → **⚙️ Configurações**
3. Selecione a aba: **💰 Modelo Financeiro**

### Passo 2: Ajustar Comissão

1. Localize o campo **"Taxa de Comissão WIN (%)"**
2. Insira o percentual desejado (exemplo: `12.00` para 12%)
3. Observe que o campo **"Taxa de Repasse ao Lojista"** atualiza automaticamente
4. Verifique o **Simulador de Split** na parte inferior

### Passo 3: Salvar Alterações

1. Clique no botão **"Salvar Alterações"** (canto superior direito)
2. Aguarde a confirmação: ✅ "Configurações salvas com sucesso!"
3. As novas taxas serão aplicadas **imediatamente** aos próximos pedidos

## 💡 Regras de Negócio

### Validações Automáticas

- ⚠️ **Comissão + Repasse = 100%**: A soma deve ser sempre exatamente 100%
- ⚠️ **Comissão entre 0% e 100%**: Valores fora desse intervalo são rejeitados
- ⚠️ **Repasse Automático**: O sistema calcula automaticamente para garantir consistência

### Impacto das Alterações

| Campo Alterado | Efeito Imediato | Pedidos Afetados |
|----------------|----------------|------------------|
| Taxa Comissão WIN | Altera split de pagamento | Apenas novos pedidos |
| Valor Entrega | Altera custo de frete Uber | Apenas novas entregas |
| Prazo Repasse | Altera D+N dos lojistas | Apenas novos repasses |

## 🎨 Simulador de Split (Interface)

A interface do Admin exibe um **simulador em tempo real** que mostra:

### Exemplo Visual:

```
💰 Valor Total do Pedido: R$ 100,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPLIT DE PAGAMENTO

🏢 Comissão WIN Marketplace
   Receita da plataforma sobre produtos
   R$ 12,00 (12.00%)

🏪 Repasse ao Lojista
   Valor líquido para o vendedor
   R$ 88,00 (88.00%)

🚚 Pagamento ao Motorista
   Valor fixo por entrega (Uber Flash)
   R$ 15,00 (por entrega)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Prazo de Repasse: D+2 dias úteis
💳 Taxa de Processamento: 2.50%
```

## 🔌 Integração Técnica

### Backend (PagamentoService.java)

O serviço de pagamento busca automaticamente as configurações ativas:

```java
// Buscar configuração ativa do sistema
Configuracao config = configuracaoRepository.findConfigAtiva()
    .orElseGet(() -> new Configuracao()); // Usa valores padrão se não existir

// Obter taxa de comissão configurada
BigDecimal percentualComissao = config.getTaxaComissaoWin();

// Criar split no Pagar.me
pagarMeService.criarCobrancaPix(
    pedidoId,
    valorCentavos,
    // ... outros parâmetros
    valorFreteCentavos,
    percentualComissao // ← Taxa vinda do Admin
);
```

### Frontend (AdminSettings.tsx)

```typescript
// Atualização em tempo real do repasse
const comissao = parseFloat(e.target.value);
updateSetting("taxaComissaoWin", comissao);
updateSetting("taxaRepasseLojista", 100 - comissao); // Automático

// Simulador atualiza instantaneamente
<div>R$ {(100 * settings.taxaComissaoWin / 100).toFixed(2)}</div>
```

## 📊 Exemplos Práticos

### Cenário 1: Marketplace Conservador (5% comissão)

**Configuração:**
- Taxa Comissão WIN: `5.00%`
- Taxa Repasse Lojista: `95.00%`

**Pedido R$ 200,00 (produtos) + R$ 20,00 (frete):**
- Lojista: R$ 190,00 (95% × R$ 200,00)
- Marketplace: R$ 10,00 (5% comissão) + R$ 20,00 (frete) = **R$ 30,00**

---

### Cenário 2: Marketplace Padrão (12% comissão)

**Configuração:**
- Taxa Comissão WIN: `12.00%`
- Taxa Repasse Lojista: `88.00%`

**Pedido R$ 200,00 (produtos) + R$ 20,00 (frete):**
- Lojista: R$ 176,00 (88% × R$ 200,00)
- Marketplace: R$ 24,00 (12% comissão) + R$ 20,00 (frete) = **R$ 44,00**

---

### Cenário 3: Marketplace Agressivo (20% comissão)

**Configuração:**
- Taxa Comissão WIN: `20.00%`
- Taxa Repasse Lojista: `80.00%`

**Pedido R$ 200,00 (produtos) + R$ 20,00 (frete):**
- Lojista: R$ 160,00 (80% × R$ 200,00)
- Marketplace: R$ 40,00 (20% comissão) + R$ 20,00 (frete) = **R$ 60,00**

## 🛡️ Segurança e Auditoria

### Controle de Acesso

- ✅ Apenas usuários com role **ADMIN** podem acessar
- ✅ Endpoint protegido: `@PreAuthorize("hasRole('ADMIN')")`
- ✅ Autenticação via JWT obrigatória

### Auditoria Automática

Toda alteração registra:
- **Quem** alterou (email do admin)
- **Quando** alterou (timestamp)
- **Configuração anterior** (histórico na tabela)

```sql
SELECT 
    taxa_comissao_win,
    atualizado_por,
    atualizado_em
FROM configuracoes
WHERE ativo = true
ORDER BY criado_em DESC;
```

## 🚀 API REST (Opcional)

### GET /api/v1/admin/configuracoes
Retorna configuração ativa do sistema

**Resposta:**
```json
{
  "id": "uuid",
  "taxaComissaoWin": 12.00,
  "taxaRepasseLojista": 88.00,
  "valorEntregaMotorista": 15.00,
  "diasRepasse": 2,
  // ... outros campos
}
```

### PUT /api/v1/admin/configuracoes
Atualiza configurações do sistema

**Request Body:**
```json
{
  "taxaComissaoWin": 15.00,
  "taxaRepasseLojista": 85.00,
  "valorEntregaMotorista": 18.00,
  // ... outros campos obrigatórios
}
```

### POST /api/v1/admin/configuracoes/restaurar-padrao
Restaura valores padrão do sistema

## ⚠️ Cuidados e Boas Práticas

### ❌ Evite:
- Alterar comissão frequentemente (confunde lojistas)
- Definir comissão muito alta (desmotiva vendedores)
- Esquecer de configurar recipient ID do marketplace no Pagar.me

### ✅ Recomendado:
- Revisar comissão trimestralmente
- Comunicar mudanças aos lojistas com antecedência
- Testar no ambiente de sandbox antes de produção
- Manter histórico de mudanças documentado

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@winmarketplace.com
- 📚 Docs: `/api/v1/docs` (Swagger)
- 🐛 Issues: GitHub Repository

---

**Última Atualização:** 03/03/2026  
**Versão:** 1.0.0  
**Autor:** Win Marketplace Development Team
