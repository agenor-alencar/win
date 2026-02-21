# Correção: QR Code PIX Não Exibido na Página de Pagamento

## Data
21/02/2026

## Problema Identificado

Após finalizar o pedido, o usuário era direcionado para a página de pagamento PIX, mas:
- ❌ QR Code não era exibido (mostrava placeholder cinza)
- ❌ Código "copia e cola" não aparecia

### Sintomas
- Página de pagamento carrega corretamente ✅
- Timer de expiração funciona ✅
- Layout e instruções aparecem ✅
- **Mas QR Code e código PIX não são exibidos** ❌

## Causas Raiz Identificadas

### 1. Frontend: API Incorreta
**Arquivo**: `win-frontend/src/pages/shared/PaymentPix.tsx` (linha 5)

**Problema**: Importando API do caminho errado
```tsx
import { api } from "../../../shared/api";  // ❌ ERRADO
```

O arquivo `shared/api.ts` procura token em `localStorage.user.token`, mas o sistema usa `localStorage.win-token`.

**Correção**: Usar a API correta
```tsx
import { api } from "@/lib/Api";  // ✅ CORRETO
```

### 2. Backend: Estrutura de Resposta do Pagar.me
**Arquivo**: `backend/src/main/java/com/win/marketplace/service/PagamentoService.java` (linha 440)

**Problema**: Código tentava acessar `charges.data`, mas a resposta do Pagar.me retorna `charges` como array direto.

**Estrutura Esperada vs Real**:
```java
// ❌ Código tentava:
Map<String, Object> charges = (Map<String, Object>) ordem.get("charges");
List<Map<String, Object>> chargeList = charges.get("data");

// ✅ Estrutura real do Pagar.me:
{
  "charges": [
    {
      "last_transaction": {
        "qr_code": "...",
        "qr_code_url": "..."
      }
    }
  ]
}
```

## Correções Aplicadas

### 1. PaymentPix.tsx (Frontend)

**Mudança**:
```diff
- import { api } from "../../../shared/api";
+ import { api } from "@/lib/Api";
```

**Impacto**: 
- Token JWT é enviado corretamente
- Autenticação funciona
- API responde com dados corretos

### 2. PagamentoService.java (Backend)

**Antes**:
```java
Map<String, Object> charges = (Map<String, Object>) ordem.get("charges");
if (charges != null) {
    List<Map<String, Object>> chargeList = (List<Map<String, Object>>) charges.get("data");
    if (chargeList != null && !chargeList.isEmpty()) {
        // ...
    }
}
```

**Depois**:
```java
// A resposta tem charges como array direto, não charges.data
Object chargesObj = ordem.get("charges");
if (chargesObj instanceof List) {
    List<Map<String, Object>> chargeList = (List<Map<String, Object>>) chargesObj;
    if (!chargeList.isEmpty()) {
        Map<String, Object> charge = chargeList.get(0);
        Map<String, Object> lastTransaction = (Map<String, Object>) charge.get("last_transaction");
        
        if (lastTransaction != null) {
            billing.put("qrCode", lastTransaction.get("qr_code"));
            billing.put("qrCodeUrl", lastTransaction.get("qr_code_url"));
            billing.put("billingId", pagamento.getTransacaoId());
            billing.put("amount", pagamento.getValor().multiply(new java.math.BigDecimal(100)).intValue());
            billing.put("status", pagamento.getStatus().toString().toLowerCase());
            
            log.info("📋 Dados PIX carregados - qrCode: {}, qrCodeUrl: {}", 
                lastTransaction.get("qr_code") != null ? "presente" : "ausente",
                lastTransaction.get("qr_code_url") != null ? "presente" : "ausente");
        }
    }
}
```

**Melhorias**:
- ✅ Trata `charges` como `List` direto
- ✅ Validação com `instanceof List`
- ✅ Log detalhado para debug
- ✅ Extrai `qr_code` e `qr_code_url` corretamente

## Como Aplicar na VPS

### 1. Backup dos arquivos
```bash
cd ~/win
mkdir -p backups/correcao-qrcode-$(date +%Y%m%d_%H%M%S)

# Backend
cp backend/src/main/java/com/win/marketplace/service/PagamentoService.java \
   backups/correcao-qrcode-$(date +%Y%m%d_%H%M%S)/

# Frontend será reconstruído pelo Docker
```

### 2. Atualizar código do repositório
```bash
cd ~/win
git pull origin main
# Ou fazer upload manual dos arquivos alterados
```

### 3. Recompilar backend
```bash
cd ~/win/backend
./mvnw clean package -DskipTests
```

### 4. Rebuild completo (Backend + Frontend)
```bash
cd ~/win
docker compose build
```

### 5. Reiniciar serviços
```bash
docker compose down
docker compose up -d
```

### 6. Verificar logs
```bash
docker compose logs -f backend | grep -i "pix\|qrcode"
```

Procure por:
```
📋 Dados PIX carregados - qrCode: presente, qrCodeUrl: presente
```

### 7. Testar fluxo completo
1. Acesse o site e adicione produtos ao carrinho
2. Finalize o pedido com pagamento PIX
3. **Deve exibir QR Code completo** ✅
4. **Código copia e cola deve aparecer** ✅
5. Timer de expiração funcionando ✅

## Arquivos Alterados

### Backend
- ✅ `backend/src/main/java/com/win/marketplace/service/PagamentoService.java`
  - Método: `buscarDadosPagamentoPix(UUID pedidoId)`
  - Linhas: ~440-465

### Frontend
- ✅ `win-frontend/src/pages/shared/PaymentPix.tsx`
  - Import da API
  - Linha: 5

## Resultado Esperado

### ✅ Antes (Com a Correção)
```
┌─────────────────────────┐
│                         │
│     [QR CODE IMAGE]     │  ← Exibido corretamente
│                         │
└─────────────────────────┘

Timer: 29:48 restantes

Código Copia e Cola:
┌─────────────────────────────────────┐
│ 00020101021226820014br.gov.bcb.p... │  ← Texto completo
└─────────────────────────────────────┘
[Copiar Código PIX] ← Botão funcional
```

### ❌ Antes (Sem a Correção)
```
┌─────────────────────────┐
│                         │
│   [PLACEHOLDER CINZA]   │  ← Falha ao carregar
│                         │
└─────────────────────────┘

Código Copia e Cola:
┌─────────────────────────────────────┐
│ (vazio)                             │  ← Sem conteúdo
└─────────────────────────────────────┘
```

## Logs de Verificação

### Backend - Sucesso
```
2026-02-21 17:10:23 [http-nio-8080-exec-4] INFO  PagamentoService - 💳 Criando cobrança PIX Pagar.me
2026-02-21 17:10:24 [http-nio-8080-exec-4] INFO  PagamentoService - ✅ Cobrança PIX Pagar.me criada - ID: or_xxxxx
2026-02-21 17:10:24 [http-nio-8080-exec-4] INFO  PagamentoService - ✅ Resposta montada: qrCode=presente, qrCodeUrl=presente
2026-02-21 17:10:25 [http-nio-8080-exec-3] INFO  PagamentoService - 📋 Dados PIX carregados - qrCode: presente, qrCodeUrl: presente
```

### Frontend - Console do Navegador
```javascript
// Resposta da API:
{
  success: true,
  billing: {
    qrCode: "00020101021226820014br.gov.bcb.pix...",
    qrCodeUrl: "https://api.pagar.me/core/v5/transactions/tran_xxx/qrcode...",
    billingId: "or_xxxxx",
    amount: 1891,
    status: "pending"
  },
  pedido: {
    id: "2277fab7-d329-4e51-b2cd-0e09d546c92c",
    total: 18.91,
    status: "AGUARDANDO_PAGAMENTO"
  }
}
```

## Validações de Segurança

✅ Rota `/api/v1/pagamentos/pedido/{id}/pix` é pública (permite compartilhar link)\
✅ Token JWT é validado nas rotas protegidas\
✅ Dados sensíveis não expostos\
✅ QR Code expira em 30 minutos

## Melhorias Futuras (Opcional)

### 1. Fallback de Dados
Se a busca no Pagar.me falhar, usar dados salvos no banco:
```java
if (billing.isEmpty()) {
    // Buscar qrCode e qrCodeUrl salvos no Pagamento
    if (pagamento.getQrCode() != null) {
        billing.put("qrCode", pagamento.getQrCode());
        billing.put("qrCodeUrl", pagamento.getQrCodeUrl());
    }
}
```

### 2. Cache de QR Code
Salvar QR Code no banco ao criar pagamento para evitar chamadas repetidas ao Pagar.me.

### 3. Tratamento de Erros no Frontend
Melhorar mensagens de erro quando QR Code não carregar:
```tsx
{!paymentData.billing.qrCodeUrl && (
  <div className="text-center text-red-600">
    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
    <p>Não foi possível carregar o QR Code.</p>
    <button onClick={reloadPayment}>Tentar Novamente</button>
  </div>
)}
```

---
**Status**: ✅ Correção aplicada e testada localmente\
**Compilação**: ✅ BUILD SUCCESS\
**Deploy VPS**: Pendente\
**Impacto**: 🔥 Crítico - Resolve exibição de QR Code PIX
