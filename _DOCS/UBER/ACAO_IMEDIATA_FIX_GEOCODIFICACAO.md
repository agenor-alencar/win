# 📋 AÇÃO IMEDIATA - Configuração Uber Sandbox

**Situação:** Credenciais carregadas ✅ | Backend tentando API real ✅ | Geocodificação falhando ⚠️

---

## 🚀 3 Soluções (Escolha 1)

### ✅ **OPÇÃO 1 - RÁPIDA (5 min)** [RECOMENDADO]

Teste se ViaCEP está funcionando em seu ambiente:

```bash
# Em qualquer terminal:
curl https://viacep.com.br/ws/01310100/json/

# Se funcionar, deve retornar:
#{
#  "cep": "01310-100",
#  "logradouro": "Avenida Paulista",
#  "localidade": "São Paulo",
#  "uf": "SP"
#}
```

**Se funcionar:** Investigar por que backend não consegue acessar  
**Se falhar:** Use Opção 2 ou 3

---

### ✅ **OPÇÃO 2 - RECOMENDADA (10 min)**

Forneça coordenadas GPS na request (pula geocodificação):

```powershell
$body = @{
    lojistaId = "550e8400-e29b-41d4-a716-446655440000"
    cepOrigem = "01310-100"
    enderecoOrigemCompleto = "Av. Paulista, 1000"
    cepDestino = "04567-000"
    enderecoDestinoCompleto = "Av. Brigadeiro, 3000"
    pesoTotalKg = 5.0
    
    # ⭐ ADICIONE ESTAS LINHAS:
    origemLatitude = -23.5615
    origemLongitude = -46.6560
    destinoLatitude = -23.5725
    destinoLongitude = -46.6440
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/entregas/simular-frete" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Esperado:** Quote real com ID começando com `quo_` (não MOCK)

---

### ✅ **OPÇÃO 3 - ROBUSTO (15 min)**

Configure Google Maps API como fallback:

```bash
# 1. Obter chave em: https://cloud.google.com/maps-platform
# 2. Ativar APIs: Maps SDK for Android/iOS, Geocoding API

# 3. Adicionar ao .env:
GOOGLE_MAPS_API_KEY=sua-chave-aqui

# 4. Reiniciar backend:
docker restart win-marketplace-backend
```

---

## 📊 Resumo do Status

| Componente | Status | Ação |
|-----------|--------|------|
| Credenciais Uber | ✅ Carregadas | ✓ Pronto |
| Backend Uber Real | ✅ Ativado | ✓ Pronto |
| OAuth Uber | ❓ Não testado | Esperar resposta API |
| Geocodificação | ❌ Falhando | ⭐ **RESOLVER ISTO** |
| PIN_VALIDACOES | ✅ Implementado | ✓ Pronto |

---

## 🎯 Quando as 3 Soluções Funcionarem

Você terá:
1. ✅ Backend se comunicando com Uber Sandbox (real)
2. ✅ Quotes com IDs reais (`quo_...`) ao invés de MOCK
3. ✅ Pronto para solicitar entregas de verdade
4. ✅ Pronto para produção

---

## 📞 Se Continuar Falhando

Execute e compartilhe output:

```bash
# 1. Verificar logs detalhados:
docker logs win-marketplace-backend --since 5m 2>&1 | grep -A 5 "Uber\|OAuth\|cota"

# 2. Verificar se backend está retornando erro:
curl -X POST http://localhost:8080/api/v1/entregas/simular-frete \
  -H "Content-Type: application/json" \
  -d '{"lojistaId":"550e...","cepOrigem":"01310-100","cepDestino":"04567-000","pesoTotalKg":5}'
```

---

## ✨ Próximo Passo Do Usuário

1. **Escolha 1 das 3 opções acima**
2. **Teste com script:** `powershell -File scripts/test-uber-com-gps.ps1`
3. **Valide sucesso** (Quote com ID real, não MOCK)
4. **Comunique resultado**

---

Documentação relacionada disponível em `_DOCS/UBER/`:
- `DIAGNOSTICO_INTEGACAO_UBER_REAL.md` - Análise técnica
- `RELATORIO_TESTES_ENTREGA_COMPLETO.md` - Histórico completo
- Scripts de teste em `/scripts/`
