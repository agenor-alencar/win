# Diagnóstico de Erros no Cálculo de Frete

## Problemas Identificados

### 1. Erros no Console do Navegador

#### A. Recursos não encontrados (ERR_NAME_NOT_RESOLVED)
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
- 6666661text-PIXE1
- 6666667text-VISAE1
- 6666667text-NO51NOME.Is:643
```

**Causa**: Parecem ser tentativas de carregar recursos de ícones de pagamento que não existem.

**Solução**: Verificar os componentes de pagamento e corrigir as URLs dos ícones.

---

#### B. Erro 500 no endpoint /api/v1/pedidos
```
Status: 500
URL: /api/v1/pedidos
```

**Causa provável**: Erro ao criar pedido no backend. Pode ser relacionado a:
1. Validação de dados do pedido
2. Cálculo de frete falhando
3. Problema com endereço temporário

---

### 2. Checklist de Verificação

#### Backend - FreteService

**Método**: `estimarFretePorCEP()`
- [ ] Verific se o método `geocodificarPorCEP()` do GeocodingService está funcionando
- [ ] Validar se está retornando coordenadas válidas
- [ ] Conferir logs de erro no console do backend

**Comando para verificar logs**:
```bash
docker compose logs -f backend | grep -i "frete\|uber\|erro"
```

#### Frontend - Checkout

**Método**: `calcularFrete()`
- [ ] Verificar se está passando `enderecoId` correto
- [ ] Validar se endereço temporário está sendo criado
- [ ] Conferir se `localStorage` tem `win_endereco_temp_id`

**Verificar no console do navegador**:
```javascript
// Ver CEP salvo
localStorage.getItem('win_cep_cliente')

// Ver ID do endereço temporário
localStorage.getItem('win_endereco_temp_id')
```

---

### 3. Fluxo Esperado

```
1. Usuário informa CEP no widget
   ↓
2. CEPWidget valida CEP via ViaCEP
   ↓
3. Se usuário logado → cria endereço temporário
   ↓
4. Salva CEP e enderecoId no localStorage
   ↓
5. No checkout → usa enderecoId para calcular frete
   ↓
6. Backend geocodifica endereço e chama Uber API
   ↓
7. Retorna valor do frete com quoteId
```

---

### 4. Endpoints para Testar

#### Estimativa por CEP (não requer auth)
```bash
GET http://localhost:8080/api/v1/fretes/estimar?cepDestino=70040902&lojistaId=UUID&pesoKg=1.5
```

#### Cálculo completo (requer endereço)
```bash
POST http://localhost:8080/api/v1/fretes/calcular
{
  "lojistaId": "UUID",
  "enderecoEntregaId": "UUID",
  "pesoTotalKg": 1.5
}
```

---

### 5. Logs para Adicionar

**FreteService.java** - linha 92 (geocodificarPorCEP):
```java
log.info("🔍 Geocodificando CEP: {}", cepLimpo);
Double[] coordsDestino = geocodingService.geocodificarPorCEP(cepLimpo);
log.info("📍 Coordenadas encontradas: {} , {}", 
    coordsDestino != null ? coordsDestino[0] : "null", 
    coordsDestino != null ? coordsDestino[1] : "null");
```

**Checkout.tsx** - calcularFrete():
```typescript
console.log("🚚 Calculando frete com:", {
  lojistaId,
  enderecoEntregaId,
  pesoTotalKg
});

console.log("📦 Resposta do frete:", freteResponse);
```

---

### 6. Ações Imediatas

1. **Rebuildar frontend** com novo CEPWidget:
```bash
cd win-frontend
npm run build
```

2. **Verificar logs do backend**:
```bash
docker compose logs -f backend | tail -100
```

3. **Testar criação de endereço temporário**:
- Abrir DevTools → Console
- Informar CEP no widget
- Verificar requisição POST `/api/v1/enderecos`
- Conferir se retorna status 200 e ID do endereço

4. **Testar cálculo de frete no checkout**:
- Adicionar produto ao carrinho
- Ir para checkout
- Verificar requisição POST `/api/v1/fretes/calcular`
- Analisar resposta (sucesso ou erro)

---

### 7. Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `geocodificarPorCEP(): null` | CEP não encontrado | Verificar se ViaCEP está respondendo |
| `enderecoEntregaId: null` | Endereço temp não criado | Verificar endpoint POST /enderecos |
| `Uber API error` | Token expirado | Renovar access token |
| `Status 500` | Exceção no backend | Ver stack trace nos logs |

---

## Próximos Passos

1. ✅ CEPWidget redesenhado (mais clean)
2. ⏳ Verificar logs do backend
3. ⏳ Testar fluxo completo de frete
4. ⏳ Corrigir ícones de pagamento
5. ⏳ Adicionar mais logs para debug
