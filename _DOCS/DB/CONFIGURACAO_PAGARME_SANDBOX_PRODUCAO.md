# ⚠️ Configuração PagarMe - Sandbox em Produção

## 📧 Decisão do PagarMe

Em email enviado em **17 de março de 2026**, o PagarMe solicitou que continuemos usando as **chaves de API SandBox (Teste)** mesmo em ambiente de **Produção**.

Esta documentação registra essa decisão e como implementá-la corretamente.

---

## 🔐 Configuração Atual (VPS)

No arquivo `.env` da VPS, configure:

```env
# ========================================
# 💳 PAGAR.ME (STONE) - Gateway de Pagamento PIX
# ========================================
# ⚠️ IMPORTANTE: Usar credenciais de TESTE mesmo em produção
# por solicitação do PagarMe (email 17/03/2026)

# Chaves de TESTE (SandBox)
PAGARME_API_KEY=acc_z3DoakwS0C5ag84p
PAGARME_PUBLIC_KEY=pk_lKy5xpKjtesp4ZLX

# ⚠️ MANTER COMO 'test' mesmo em produção
PAGARME_ENVIRONMENT=test

# Habilitar Pagar.me
PAGARME_ENABLED=true
```

---

## ✅ Passo a Passo de Configuração

### 1. Conectar na VPS

```powershell
ssh root@137.184.87.106
```

### 2. Editar arquivo .env

```bash
nano /root/win-marketplace/.env
```

### 3. Localizar seção PAGAR.ME

Procure por:
```
# 💳 PAGAR.ME (STONE) - Gateway de Pagamento PIX
```

### 4. Atualizar valores

```bash
# Mudar de:
PAGARME_API_KEY=
PAGARME_PUBLIC_KEY=
PAGARME_ENVIRONMENT=production
PAGARME_ENABLED=false

# Para:
PAGARME_API_KEY=acc_z3DoakwS0C5ag84p
PAGARME_PUBLIC_KEY=pk_lKy5xpKjtesp4ZLX
PAGARME_ENVIRONMENT=test
PAGARME_ENABLED=true
```

### 5. Salvar (CTRL+X, Y, ENTER)

### 6. Rebuild do Backend

```bash
cd /root/win-marketplace

# Parar containers
docker compose down

# Reconstruir com novas variáveis
docker compose up -d --build backend

# Verificar logs
docker compose logs -f backend
```

**Aguarde até ver:**
```
✅ Pagar.me está HABILITADO (environment: test) ✅
```

---

## 📌 Implicações Desta Decisão

| Item | Valor |
|------|-------|
| **Ambiente** | Production |
| **Chaves** | SandBox/Teste |
| **Transações** | Permitidas (não cobram) |
| **Webhook** | Continua recebendo eventos |
| **Risco** | ❌ NENHUM (são chaves de teste) |
| **Solicitante** | PagarMe (oficial) |

---

## ⚠️ Considerações de Segurança

### ✅ Seguro porque:

1. **Chaves de teste não cobram** - Não há risco financeiro
2. **Transações não são reais** - Teste contínuo é permitido
3. **PagarMe autoriza explicitamente** - Email confirmado
4. **Mesmo ambiente de produção** - Aplicação roda normalmente
5. **Webhook funciona** - Recebe eventos de teste corretamente

### ⚠️ Limitações:

1. **Dados são de teste** - Não refletem transações reais
2. **Relatórios do PagarMe** - Mostram "teste" ou "sandbox"
3. **Backup de chaves** - Chaves de teste funcionam indefinidamente
4. **Migração futura** - Quando for para chaves reais, mudar apenas `PAGARME_ENVIRONMENT=production` e as chaves

---

## 🔄 Transição para Produção Real (quando necessário)

Quando PagarMe liberar chaves de produção:

```env
# Apenas estes 3 valores mudam:
PAGARME_API_KEY=sk_live_XXXXX...        # Nova chave de produção
PAGARME_PUBLIC_KEY=pk_live_XXXXX...     # Nova chave de produção
PAGARME_ENVIRONMENT=production          # Muda para production

# Resto permanece igual
PAGARME_ENABLED=true
```

---

## ✔️ Verificação

### Confirmar que está funcionando:

```bash
# Na VPS, verificar variáveis carregadas
curl http://localhost:8080/api/v1/health | grep pagarme

# Ou via logs
docker compose logs backend | grep -i "pagar"
```

### Esperado:
```
✅ Pagar.me está HABILITADO (environment: test)
```

---

## 📞 Referência

- **Email PagarMe**: 17 de março de 2026
- **Credenciais**: Chaves de teste fornecidas pelo PagarMe
- **Documentação**: [GUIA_INTEGRACAO_PAGARME.md](GUIA_INTEGRACAO_PAGARME.md)
- **Testes**: [GUIA_TESTE_PAGARME.md](GUIA_TESTE_PAGARME.md)

---

## 🆘 Troubleshooting

### Erro: "PAGARME_NAO_CONFIGURADO"

```bash
# Verificar se variáveis foram carregadas
docker compose exec backend env | grep PAGARME
```

### Erro: Chaves rejeitadas

```bash
# Verificar se as chaves estão completamente copiadas
# Não deve haver espaços no final
nano /root/win-marketplace/.env
```

### Rebuild não pega novas variáveis

```bash
# Forçar rebuild completo
docker compose down
docker image prune -a
docker compose up -d --build backend
```

---

**Última atualização:** 17 de março de 2026  
**Status:** ✅ Configurado e Funcional
