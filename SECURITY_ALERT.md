# 🚨 ALERTA CRÍTICO DE SEGURANÇA

**Data:** 03/03/2026  
**Severidade:** CRÍTICA  
**Status:** AÇÃO IMEDIATA NECESSÁRIA

---

## 📋 Resumo

GitGuardian detectou **3 tipos de credenciais expostas** no seu repositório GitHub público:

1. ❌ **SMTP Credentials** (SendGrid)
2. ❌ **Pagar.me API Key**  
3. ❌ **DigitalOcean Spaces Keys**

### Arquivos Problemáticos
- `.env.vps` - commitado **5 vezes** no histórico do Git
- `.env.vps.corrigido` - commitado
- `win-frontend/.env.production` - commitado

---

## ✅ Correções Já Aplicadas

1. ✅ Arquivos `.env.vps` e `.env.vps.corrigido` removidos do tracking do Git
2. ✅ `.gitignore` atualizado com proteções adicionais
3. ✅ Commit de segurança criado (`5896bc9`)

**Importante:** Os arquivos ainda existem no **histórico do Git** no GitHub. Removê-los completamente requer reescrever o histórico (não recomendado em produção).

---

## 🔥 AÇÃO IMEDIATA NECESSÁRIA

### ⚠️ Você DEVE revogar TODAS as credenciais expostas:

### 1. SendGrid API Key

**Se você usou SendGrid real:**

1. Acesse: https://app.sendgrid.com/settings/api_keys
2. Localize a API Key que estava no `.env.vps`
3. Clique em **"Delete"**
4. Crie uma **nova API Key**
5. Atualize seu `.env` local (NÃO commitado) com a nova chave

### 2. Pagar.me API Keys

**Se você usou credenciais reais do Pagar.me:**

1. Acesse: https://dash.pagar.me/
2. Vá em **Configurações → Chaves de API**
3. **Regenere** as chaves:
   - API Key (`sk_test_...` ou `sk_live_...`)
   - Public Key (`pk_test_...` ou `pk_live_...`)
4. Atualize seu `.env` local com as novas chaves
5. **Reinicie sua aplicação**

### 3. DigitalOcean Spaces Keys

**Se você usou Spaces reais:**

1. Acesse: https://cloud.digitalocean.com/account/api/tokens
2. Vá em **Spaces access keys**
3. **Delete** a access key exposta
4. Crie uma **nova Spaces access key**
5. Anote a `Access Key ID` e `Secret Key`
6. Atualize seu `.env` local

### 4. Uber Direct Credentials

**Se você configurou Uber Direct:**

1. Acesse: https://developer.uber.com/
2. Vá no seu **App Dashboard**
3. Regenere o **Client Secret**
4. Atualize seu `.env` local

### 5. Google Maps API Key

**Se você usou Google Maps:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Localize a API Key exposta
3. Clique em **"Restringir chave"** ou **"Regenerar"**
4. Configure restrições de aplicativo e API
5. Atualize seu `.env` local

---

## 📝 Verificação de Segurança

Execute este comando para confirmar que não há mais arquivos sensíveis:

```powershell
.\scripts\verify-security.ps1
```

---

## 🔒 Boas Práticas Implementadas

1. ✅ Todos os arquivos `.env*` (exceto `.env.example`) no `.gitignore`
2. ✅ Scripts internos movidos para `scripts/internal/` (ignorados)
3. ✅ Documentação interna em `_DOCS/` (ignorada)
4. ✅ Verificações de segurança automatizadas

---

## ⚠️ IMPORTANTE - Histórico do Git

Os arquivos removidos ainda existem no **histórico do Git**. Qualquer credencial real que estava nesses arquivos **deve ser considerada comprometida** e **deve ser revogada imediatamente**.

### Opções para Limpeza do Histórico (Avançado)

**⚠️ Reescrever o histórico é perigoso e não recomendado se outras pessoas usam o repositório.**

Se realmente necessário:

```bash
# Opção 1: BFG Repo-Cleaner (mais simples)
# https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env.vps
bfg --delete-files .env.vps.corrigido
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Opção 2: git filter-repo (mais controle)
git filter-repo --path .env.vps --invert-paths
git filter-repo --path .env.vps.corrigido --invert-paths
```

**Impacto:** Todos que clonaram o repositório precisarão fazer `git clone` novamente.

---

## 📞 Próximos Passos

1. ✅ Revogar todas as credenciais listadas acima
2. ✅ Fazer push do commit de segurança: `git push origin main`
3. ✅ Monitorar os emails do GitGuardian
4. ✅ Considerar tornar o repositório privado temporariamente
5. ✅ Revisar logs de acesso das APIs para detectar uso não autorizado

---

## 🔗 Links Úteis

- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitGuardian - Remediation Guide](https://docs.gitguardian.com/secrets-detection/detectors)
- [SendGrid - API Key Security](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
- [Pagar.me - Segurança](https://docs.pagar.me/docs/security-overview)

---

## ✅ Checklist de Segurança

- [ ] Revogadas SendGrid API Keys
- [ ] Revogadas Pagar.me API Keys
- [ ] Revogadas DigitalOcean Spaces Keys
- [ ] Revogadas Uber Direct Credentials
- [ ] Revogada Google Maps API Key
- [ ] Atualizados arquivos `.env` locais
- [ ] Testada aplicação com novas credenciais
- [ ] Push do commit de segurança realizado
- [ ] Monitoramento de logs de acesso configurado

---

**⚠️ NÃO ignore este alerta. Credenciais expostas podem resultar em:**
- Cobrança inesperada nas suas contas
- Uso indevido de serviços
- Acesso não autorizado a dados
- Problemas de compliance/LGPD

**Aja AGORA!**
