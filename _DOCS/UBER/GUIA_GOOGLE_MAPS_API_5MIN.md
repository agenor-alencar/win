# GUIA RAPIDO: Obter Chave Google Maps em 5 Minutos

## OPCAO A: Já Tem Projeto Google Cloud?

### Passo 1: Acesse Google Cloud Console
```
https://console.cloud.google.com/
```
✅ Faça login com sua conta Google

### Passo 2: Selecione Seu Projeto
- Clique em seletor de projeto (topo-esquerda)
- Escolha projeto existente OU crie novo
- Se novo: Nomeie `WinMarketplace-Dev` ou similar

### Passo 3: Ative Geocoding API
```
1. Vá para: APIs & Services → Library
2. Procure: "Geocoding API"
3. Clique no resultado
4. Clique botão azul "Enable"
5. Aguarde activacao (1-2 segundos)
```

### Passo 4: Crie Chave API
```
1. APIs & Services → Credentials
2. Clique "+ Create Credentials"
3. Selecione "API Key"
4. Google gera chave em popup
5. Copie a chave (formato: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX)
```

---

## OPCAO B: Sem Projeto Google Cloud (Primeiro Acesso)

### Passo 1: Criar Projeto
```
https://console.cloud.google.com/projectcreate
```
- Nome: `WinMarketplace`
- Organizacao: (deixe em branco)
- Click "Create"

### Passo 2: Aguarde Criacao
- Google vai criar projeto (pode levar 1-2 minutos)
- Redirecionara automaticamente para dashboard

### Passo 3: Habilitar Faturamento (NECESSARIO)
```
1. Vá para: Billing → Linke um projeto a conta de faturamento
2. Pode usar Free Trial (credito $300)
3. Insira dados do cartao (nao sera cobrado se usar Free Trial)
```

### Passo 4: Ativar Geocoding API
```
1. APIs & Services → Library
2. Procure: "Geocoding API"
3. Click "Enable"
4. Aguarde (1-2 segundos)
```

### Passo 5: Crie Chave API
```
1. APIs & Services → Credentials
2. "+ Create Credentials" → "API Key"
3. COPIE A CHAVE!
```

---

## OPCAO C: Usar Free Tier / Teste Grátis

Google oferece **$300 de credito FREE por 90 dias** no Cloud Console.

**Geocoding API preço:**
- $5 USD por 1000 requests
- Com $300 credito = 60.000 requests gratis
- Sua cota de testes = ~1000 requests max
- **Resultado: Totalmente GRATIS!**

---

## PASSO FINAL: Atualizar .env

### 1. Abra o arquivo .env
```
c:\Users\user\OneDrive\Documentos\win\.env
```

### 2. Localize a linha (procure por: Maps_API_KEY)
```
Maps_API_KEY=
```

### 3. Cole sua chave (sem aspas!)
```
Maps_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**EXEMPLO REAL:**
```
Maps_API_KEY=AIzaSyDQRNJFGXXXX0123456789abcdefghijklmnop
```

### 4. Salve o arquivo (Ctrl+S)

### 5. Reinicie Backend
```powershell
docker restart win-marketplace-backend

# Aguarde 15 segundos
Start-Sleep -Seconds 15

# Verifique se subiu
docker ps | grep win-marketplace-backend
```

---

## TESTE: Verificar Carregamento

### Opcao A: Testar Endpoint
```powershell
# Executar script de teste novamente
powershell -File "scripts/test-uber-solucoes.ps1"
# Escolher opcao 1 novamente
# Espera: REAL (nao MOCK) na resposta
```

### Opcao B: Verificar Logs
```bash
docker logs win-marketplace-backend --since 5m | grep "Maps_API_KEY\|geocod\|MOCK"
```

Evento:
```
Geocoding: Usando Google Maps (chave detectada)
```

### Opcao C: Curl Direto
```bash
curl -X POST http://localhost:8080/api/v1/geocoding/test \
  -H "Content-Type: application/json" \
  -d '{"cep": "01310-100"}'

# Resposta esperada (REAL, nao MOCK):
# {
#   "latitude": -23.5505,
#   "longitude": -46.6361,
#   "bairro": "Consolacao",
#   "cidade": "Sao Paulo"
# }
```

---

## TROUBLESHOOTING

### Erro: "Invalid API Key"
- Verifique que copiou TODA a chave (sem espacos no inicio/fim)
- Aguarde 1 minuto para chave ativar completamente

### Erro: "API Key Disabled"
- Verifique em Google Cloud que "Geocoding API" está Enable
- Se não, habilite novamente

### Erro: "Free Trial Expired"
- Você usou $300 credito
- Atualize com metodo de pagamento real
- OU use Nominatim/OpenStreetMap (gratis, mais lento)

### Ainda Retorna MOCK
- Restart backend: `docker restart win-marketplace-backend`
- Aguarde 15 segundos
- Teste novamente

---

## RESUMO RAPIDO

| Etapa | Tempo | Status |
|-------|-------|--------|
| 1. Abrir Google Cloud | 1 min | ✅ |
| 2. Criar Projeto | 2 min | ✅ |
| 3. Ativar Geocoding API | 1 min | ✅ |
| 4. Gerar Chave API | 1 min | ✅ |
| 5. Copiar Chave | 30 seg | ✅ |
| 6. Atualizar .env | 30 seg | ✅ |
| 7. Restart Docker | 20 seg | ✅ |
| **TOTAL** | **~5-10 min** | **✅ COMPLETO** |

---

## PROXIMAS ACOES

Apos adicionar chave:

### 1. Re-testar Script
```powershell
powershell -File "scripts/test-uber-solucoes.ps1"
# Escolha 1
# Espera: response.mockado = false (REAL quote)
```

### 2. Validar Resposta REAL
```
Se receber:
- "quoteId": "quo_xxxx" (nao MOCK-QUOTE)
- "valorCorridaUber": XX.XX
- "tempoEstimadoMinutos": XX

Significa: ✅ UBER REAL INTEGRADO COM SUCESSO!
```

### 3. Testar Fluxo Completo
```bash
# Criar pedido real
# Solicitar entrega Uber
# Validar PIN entrega
# Testar status em tempo real
```

---

## SUPORTE RÁPIDO

Se precisar de help:
- Google Cloud Help: https://cloud.google.com/support
- Documentação: https://developers.google.com/maps/documentation/geocoding
- Forum: https://stackoverflow.com/questions/tagged/google-maps-api

---

**Tempo total esperado: 5-10 minutos até Uber REAL respondendo!** 🚀
