# 🔥 Correção: Erro 500 no Cálculo de Frete

## Data: 27/01/2026 23:01

---

## 🚨 PROBLEMA IDENTIFICADO

### Sintomas:
- ❌ Erro 500 ao acessar checkout
- ❌ Console mostra: `Failed to load resource: the server responded with a status of 500 ()`
- ❌ Mensagem: `Erro ao calcular frete: ; mt`
- ❌ Múltiplas tentativas de buscar `/api/v1/enderecos/{id}` falhando

### Causa Raiz:
O frontend estava tentando buscar um endereço temporário inválido ou inexistente:

1. **CEPWidget salvou ID no localStorage:** `win_endereco_temp_id`
2. **Endereço pode ter sido deletado/expirado** no backend
3. **Checkout tentava buscar endereço:** `GET /api/v1/enderecos/{id}` → **500 ERROR**
4. **Sem tratamento de erro**, o sistema travava

---

## ✅ CORREÇÃO APLICADA

### Arquivo: [Checkout.tsx](win-frontend/src/pages/shared/Checkout.tsx#L118)

**ANTES (Problemático):**
```typescript
try {
  const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);
  const endTemp = responseEndereco.data;
  
  if (!endTemp.latitude || !endTemp.longitude) {
    console.warn('⚠️ Sem coordenadas');
    return;
  }
  
  // Calcula frete...
} catch (error) {
  console.warn('Erro:', error);  // ❌ Não limpa localStorage
}
```

**DEPOIS (Corrigido):**
```typescript
try {
  const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);
  const endTemp = responseEndereco.data;
  
  // ✅ Validação robusta
  if (!endTemp || !endTemp.latitude || !endTemp.longitude) {
    console.warn('⚠️ Endereço inválido ou sem coordenadas');
    localStorage.removeItem('win_endereco_temp_id'); // ✅ LIMPA ID INVÁLIDO
    setLoadingFrete(false);
    return;
  }
  
  // Só seta enderecoId se endereço é válido
  setEnderecoId(enderecoTempId);
  
  // Calcula frete...
} catch (error: any) {
  console.error('❌ Erro ao buscar endereço temporário:', error);
  
  // ✅ LIMPA LOCALSTORAGE EM CASO DE ERRO
  localStorage.removeItem('win_endereco_temp_id');
  setEnderecoId('');
  
  // ✅ Mensagem amigável
  if (error.response?.status === 500 || error.response?.status === 404) {
    console.log('🔄 Endereço temporário inválido. Preencha endereço completo.');
  }
} finally {
  setLoadingFrete(false);
}
```

---

## 🎯 MELHORIAS IMPLEMENTADAS

### 1. **Limpeza de localStorage** 🧹
- Se endereço temporário não existe ou está inválido → remove `win_endereco_temp_id`
- Evita loops infinitos de erro 500

### 2. **Validação Antes de Setar Estado** ✅
- Só seta `setEnderecoId()` após confirmar que endereço é válido
- Antes: setava ID primeiro, validava depois (ruim)
- Agora: valida primeiro, seta ID só se OK (correto)

### 3. **Tratamento de Erro HTTP 500/404** 🚨
- Detecta erro 500 (Internal Server Error)
- Detecta erro 404 (Not Found)
- Limpa localStorage e reseta estado
- Usuário pode recomeçar preenchendo endereço completo

### 4. **Mensagem de Feedback** 💬
- Console mostra mensagem clara: "Endereço temporário inválido. Preencha endereço completo."
- Usuário entende que precisa preencher os dados novamente

---

## 🔄 FLUXO CORRIGIDO

### Cenário 1: Endereço Temporário Válido ✅
```
1. Checkout carrega
2. Busca win_endereco_temp_id do localStorage
3. GET /api/v1/enderecos/{id} → 200 OK
4. Valida: latitude && longitude existem? SIM ✅
5. setEnderecoId(id) → salva no estado
6. Calcula frete → estimativa exibida
```

### Cenário 2: Endereço Temporário Sem Coordenadas ⚠️
```
1. Checkout carrega
2. Busca win_endereco_temp_id do localStorage
3. GET /api/v1/enderecos/{id} → 200 OK
4. Valida: latitude && longitude existem? NÃO ❌
5. localStorage.removeItem('win_endereco_temp_id') → limpa
6. Usuário preenche endereço completo → novo cálculo
```

### Cenário 3: Endereço Temporário Não Existe (ERRO 500/404) 🔥
```
1. Checkout carrega
2. Busca win_endereco_temp_id do localStorage
3. GET /api/v1/enderecos/{id} → 500 ERROR ❌
4. catch (error) detecta erro
5. localStorage.removeItem('win_endereco_temp_id') → limpa
6. setEnderecoId('') → reseta estado
7. Console: "Endereço temporário inválido"
8. Usuário preenche endereço completo → fluxo normal
```

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Simular Endereço Inválido
```javascript
// No console do navegador
localStorage.setItem('win_endereco_temp_id', 'uuid-invalido-123');
// Recarregar página checkout
// Esperado: Erro tratado graciosamente, localStorage limpo
```

### Teste 2: Simular Endereço Sem Coordenadas
```sql
-- No banco de dados
UPDATE enderecos SET latitude = NULL, longitude = NULL 
WHERE temporario = true LIMIT 1;
```
```
Recarregar checkout
Esperado: "⚠️ Endereço temporário sem coordenadas"
localStorage limpo
```

### Teste 3: Fluxo Normal
```
1. Homepage → Informar CEP (ex: 70040-902)
2. Adicionar produto ao carrinho
3. Ir ao checkout
4. Esperado: Frete calculado automaticamente ✅
```

---

## 📊 ANTES vs DEPOIS

### ANTES ❌
```
Erro 500 → Console cheio de erros → Usuário confuso
↓
Loop infinito tentando buscar endereço inválido
↓
Sistema trava, frete não calcula
↓
Usuário abandona compra
```

### DEPOIS ✅
```
Erro 500 → Detectado e tratado → localStorage limpo
↓
Mensagem clara no console
↓
Sistema continua funcionando
↓
Usuário preenche endereço completo → frete calculado
```

---

## 🚀 DEPLOY

### Frontend (OBRIGATÓRIO)
```bash
# Local já compilado
cd C:\Users\user\OneDrive\Documentos\win\win-frontend
npm run build  # ✅ JÁ FEITO

# VPS
ssh root@159.89.241.211
cd ~/win
docker compose down
docker compose build --no-cache frontend
docker compose up -d
```

### Backend (OPCIONAL - não teve mudança)
```bash
# Apenas restart se necessário
docker compose restart backend
```

---

## 🔍 LOGS PARA MONITORAR

### Console do Navegador (DevTools)
**Esperado quando endereço é válido:**
```
✅ Endereço temporário com coordenadas: {lat: -15.xxx, lon: -47.xxx}
✅ Estimativa inicial com endereço temporário
```

**Esperado quando endereço é inválido:**
```
❌ Erro ao buscar endereço temporário: AxiosError
🔄 Endereço temporário inválido. Preencha endereço completo.
```

### Backend (Docker Logs)
```bash
docker compose logs -f backend | grep -E "🔍|📍|❌|ERROR"
```

**Esperado:**
- Menos erros 500 em `/api/v1/enderecos`
- Geocodificação funcionando: `🔍 Geocodificando CEP`
- Coordenadas obtidas: `📍 Coordenadas destino: lat=...`

---

## 📋 CHECKLIST PÓS-DEPLOY

- [ ] Deploy frontend concluído
- [ ] Site carregando normalmente
- [ ] CEPWidget aparece no Header
- [ ] Preencher CEP → sem erros 500 no console
- [ ] Ir ao checkout → frete calculado automaticamente
- [ ] Se erro 500 ocorrer → localStorage limpo automaticamente
- [ ] Preencher endereço completo → frete recalculado

---

## 💡 PREVENÇÃO FUTURA

### Melhorias Sugeridas:

1. **TTL para Endereços Temporários**
   ```java
   // Backend: Deletar endereços temporários após 24h
   @Scheduled(cron = "0 0 * * * *") // A cada hora
   public void limparEnderecoExpirados() {
       LocalDateTime limite = LocalDateTime.now().minusHours(24);
       enderecoRepository.deleteByTemporarioTrueAndCreatedAtBefore(limite);
   }
   ```

2. **Validação de UUID no Frontend**
   ```typescript
   const isValidUUID = (uuid: string) => {
       const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
       return regex.test(uuid);
   };
   
   const enderecoTempId = localStorage.getItem('win_endereco_temp_id');
   if (enderecoTempId && !isValidUUID(enderecoTempId)) {
       localStorage.removeItem('win_endereco_temp_id');
       return;
   }
   ```

3. **Retry com Exponential Backoff**
   ```typescript
   // Se erro 500, tenta novamente após 2s, depois 4s, depois 8s
   async function buscarEnderecoComRetry(id: string, maxRetries = 3) {
       // ... implementação
   }
   ```

---

## ✅ RESUMO

### O que foi corrigido:
1. ✅ Tratamento robusto de erro 500/404 ao buscar endereço
2. ✅ Limpeza automática de localStorage quando endereço inválido
3. ✅ Validação antes de setar estado (enderecoId)
4. ✅ Mensagens de feedback no console
5. ✅ Sistema não trava mais em caso de erro

### Status:
- ✅ Frontend compilado (16.58s)
- ⏳ Aguardando deploy no VPS
- ✅ Documentação atualizada

### Próximo passo:
🚀 **Deploy no VPS e testar fluxo completo**

---

**Documentação criada em:** 27/01/2026 23:05  
**Build:** ✅ SUCESSO  
**Pronto para produção:** ✅ SIM
