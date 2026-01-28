# 🔥 ANÁLISE HARD - Sistema de Cálculo de Frete

## Data: 27/01/2026

## 🎯 OBJETIVO
Encontrar TODOS os erros semânticos e lógicos que impedem o cálculo de frete de funcionar.

---

## ✅ VALIDAÇÕES REALIZADAS

### 1. FLUXO CEPWidget → Checkout

#### CEPWidget.tsx ✅ CORRETO
```typescript
// 1. Salva CEP no localStorage
localStorage.setItem('win_cep_cliente', cepLimpo);

// 2. Se usuário logado, cria endereço temporário
const enderecoTemp = {
  cep: cepLimpo,
  logradouro: dadosCep.logradouro || "",
  numero: "S/N",
  temporario: true  // ✅ CORRETO - marca como temporário
};

const response = await api.post("/api/v1/enderecos", enderecoTemp);
localStorage.setItem('win_endereco_temp_id', response.data.id); // ✅ CORRETO
```

**PROBLEMAS IDENTIFICADOS:**
- ❌ Não há validação se o backend REALMENTE salvou o endereço
- ❌ Não verifica se o campo `temporario` foi aceito pelo backend
- ❌ Não valida se as coordenadas foram geocodificadas

---

### 2. FLUXO Checkout → Backend

#### Checkout.tsx - Estratégia 1 (Endereço Temporário)
```typescript
const enderecoTempId = localStorage.getItem('win_endereco_temp_id');
if (enderecoTempId && !freteCalculado && !enderecoId) {
  // Busca endereço temporário
  const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);
  const endTemp = responseEndereco.data;
  
  // Calcula frete
  const estimativa = await shippingApi.calcularFrete({
    lojistaId: lojistaId,
    enderecoEntregaId: enderecoTempId,  // ✅ USA ID DO ENDEREÇO
    pesoTotalKg: pesoTotal
  });
}
```

**PROBLEMAS IDENTIFICADOS:**
- ⚠️ VALIDAÇÃO FRACA: Não verifica se `endTemp` tem `latitude` e `longitude`
- ⚠️ SILENCIOSO: Se geocodificação falhou, o erro é ignorado
- ❌ NÃO VERIFICA: Se o backend conseguiu geocodificar o CEP

---

### 3. BACKEND - EnderecoService

**PROBLEMA CRÍTICO ENCONTRADO:**

```java
// EnderecoRequestDTO.java
public record EnderecoRequestDTO(
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    Boolean principal,
    Boolean temporario,  // ✅ Campo existe
    Boolean ativo
) {}
```

Mas no **EnderecoService.java**, quando cria o endereço:

```java
@Transactional
public EnderecoResponseDTO criarEndereco(EnderecoRequestDTO dto) {
    // ...validações...
    
    // 🔴 PROBLEMA: Não está setando o campo temporario!
    Endereco endereco = Endereco.builder()
        .usuario(usuario)
        .cep(cepLimpo)
        .logradouro(dto.logradouro())
        // ... outros campos ...
        .principal(dto.principal() != null ? dto.principal() : false)
        .ativo(dto.ativo() != null ? dto.ativo() : true)
        // ❌ FALTANDO: .temporario(dto.temporario() != null ? dto.temporario() : false)
        .build();
}
```

**IMPACTO:** Endereços temporários não são marcados corretamente!

---

### 4. BACKEND - Geocodificação

#### GeocodingService.java
```java
public Double[] geocodificar(String cep, String enderecoCompleto) {
    // 1. Enriquece com ViaCEP
    String enderecoEnriquecido = enriquecerEnderecoComViaCEP(cep, enderecoCompleto);
    
    // 2. Geocodifica com Nominatim
    Double[] coordenadas = geocodificarComNominatim(enderecoEnriquecido);
    
    return coordenadas; // ✅ Retorna [lat, lon] ou null
}
```

**VALIDAÇÃO:**
- ✅ Método correto
- ✅ Tratamento de erro adequado
- ⚠️ MAS: Não valida se Nominatim retornou coordenadas válidas

---

### 5. BACKEND - FreteService

#### estimarFretePorCep()
```java
// 3. GEOCODIFICAR CEP DE DESTINO
String cepLimpo = cepDestino.replaceAll("\\D", "");
log.info("🔍 Geocodificando CEP destino: {}", cepLimpo);

Double[] coordsDestino = geocodingService.geocodificarPorCEP(cepLimpo);

if (coordsDestino == null) {
    log.error("❌ Falha ao geocodificar CEP: {}", cepLimpo);
    throw new RuntimeException("CEP inválido ou não encontrado");
}
```

**VALIDAÇÃO:**
- ✅ Validação de null está presente
- ✅ Log adequado
- ✅ Exceção lançada corretamente

---

### 6. BACKEND - UberFlashService

**PRECISA VERIFICAR:** Se o método `simularFrete()` está funcionando corretamente.

---

## 🔥 PROBLEMAS CRÍTICOS ENCONTRADOS

### ❌ PROBLEMA #1: Campo `temporario` não é salvo
**Arquivo:** `backend/src/.../service/EnderecoService.java`
**Linha:** ~linha 80-100
**Impacto:** ALTO - Endereços temporários não são marcados
**Solução:** Adicionar `.temporario(dto.temporario() != null ? dto.temporario() : false)`

### ⚠️ PROBLEMA #2: Validação fraca no Checkout
**Arquivo:** `win-frontend/src/pages/shared/Checkout.tsx`
**Linha:** ~linha 123
**Impacto:** MÉDIO - Pode tentar calcular frete sem coordenadas
**Solução:** Adicionar validação de `latitude` e `longitude` antes de calcular

### ⚠️ PROBLEMA #3: CEPWidget não valida resposta do backend
**Arquivo:** `win-frontend/src/components/CEPWidget.tsx`
**Linha:** ~linha 90
**Impacto:** MÉDIO - Não garante que endereço foi geocodificado
**Solução:** Validar se `response.data` contém `latitude` e `longitude`

---

## 🛠️ CORREÇÕES NECESSÁRIAS

### Correção #1: EnderecoService.java
```java
// Adicionar campo temporario ao builder
Endereco endereco = Endereco.builder()
    .usuario(usuario)
    .cep(cepLimpo)
    .logradouro(dto.logradouro())
    .numero(dto.numero())
    .complemento(dto.complemento())
    .bairro(dto.bairro())
    .cidade(dto.cidade())
    .estado(dto.estado())
    .principal(dto.principal() != null ? dto.principal() : false)
    .temporario(dto.temporario() != null ? dto.temporario() : false)  // ✅ ADICIONAR
    .ativo(dto.ativo() != null ? dto.ativo() : true)
    .build();
```

### Correção #2: Checkout.tsx
```typescript
// Validar coordenadas antes de calcular frete
const responseEndereco = await api.get(`/api/v1/enderecos/${enderecoTempId}`);
const endTemp = responseEndereco.data;

// ✅ ADICIONAR VALIDAÇÃO
if (!endTemp.latitude || !endTemp.longitude) {
  console.warn('⚠️ Endereço sem coordenadas, pulando cálculo inicial');
  setLoadingFrete(false);
  return;
}

// Só calcula se tiver coordenadas
const estimativa = await shippingApi.calcularFrete({...});
```

### Correção #3: CEPWidget.tsx
```typescript
const response = await api.post("/api/v1/enderecos", enderecoTemp);

// ✅ ADICIONAR VALIDAÇÃO
if (response.data?.id) {
  const enderecoSalvo = response.data;
  
  // Verificar se foi geocodificado
  if (!enderecoSalvo.latitude || !enderecoSalvo.longitude) {
    console.warn('⚠️ Endereço salvo mas sem coordenadas');
  }
  
  localStorage.setItem('win_endereco_temp_id', enderecoSalvo.id);
  console.log('✅ Endereço temporário salvo:', enderecoSalvo.id);
}
```

---

## 📊 PRIORIDADE DE CORREÇÕES

1. **🔴 CRÍTICO:** Corrigir EnderecoService.java (campo `temporario`)
2. **🟠 ALTO:** Adicionar validação de coordenadas no Checkout.tsx
3. **🟡 MÉDIO:** Melhorar validação no CEPWidget.tsx

---

## ✅ PRÓXIMOS PASSOS

1. Aplicar correção #1 no backend
2. Aplicar correção #2 no frontend  
3. Aplicar correção #3 no frontend
4. Rebuild backend + frontend
5. Testar fluxo completo
6. Monitorar logs

