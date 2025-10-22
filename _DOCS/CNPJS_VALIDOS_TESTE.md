# 🧪 CNPJs Válidos para Teste

**Data**: 18 de outubro de 2025

---

## ✅ CNPJs Válidos para Teste de Auto-preenchimento

Use estes CNPJs **REAIS** para testar a funcionalidade de auto-preenchimento:

### **1. Petrobras** (ATIVA) ⭐ RECOMENDADO
```
CNPJ: 33.000.167/0001-01
```
- **Nome**: PETROLEO BRASILEIRO S A PETROBRAS
- **Fantasia**: PETROBRAS - EDISE
- **Endereço**: Av República do Chile, 65 - Centro - Rio de Janeiro/RJ
- **CEP**: 20031-170
- **Status**: ✅ ATIVA

---

### **2. Banco do Brasil**
```
CNPJ: 00.000.000/0001-91
```
- **Nome**: BANCO DO BRASIL S.A.
- **Status**: ✅ ATIVA

---

### **3. Correios**
```
CNPJ: 34.028.316/0001-03
```
- **Nome**: EMPRESA BRASILEIRA DE CORREIOS E TELEGRAFOS
- **Status**: ✅ ATIVA

---

### **4. Caixa Econômica Federal**
```
CNPJ: 00.360.305/0001-04
```
- **Nome**: CAIXA ECONOMICA FEDERAL
- **Status**: ✅ ATIVA

---

### **5. Vale**
```
CNPJ: 33.592.510/0001-54
```
- **Nome**: VALE S.A.
- **Status**: ✅ ATIVA

---

## ❌ CNPJ Inválido que Você Testou

```
CNPJ: 36.354.806/0001-25
```

**Problema**: Este CNPJ não foi encontrado na base da Receita Federal.

**Possíveis causas**:
1. CNPJ não existe
2. CNPJ incorreto (dígito verificador errado)
3. Empresa cancelada/baixada

---

## 🔍 Como Validar um CNPJ

### **Estrutura do CNPJ**
```
XX.XXX.XXX/XXXX-YY
│  │   │   │    └─ Dígitos verificadores
│  │   │   └────── Ordem (0001 = matriz)
│  │   └────────── Raiz (identifica a empresa)
│  └────────────── Raiz
└───────────────── Raiz

Exemplo: 33.000.167/0001-01
         ────────── ──── ──
         Raiz       Ordem DV
```

---

## 🧪 Passo a Passo para Testar

### **Teste 1: CNPJ Válido (Petrobras)** ✅

1. Acesse: http://localhost:3000/become-merchant
2. Faça login se necessário
3. No campo **CNPJ**, digite: `33.000.167/0001-01`
4. Clique fora do campo ou pressione Tab
5. **Aguarde 2-3 segundos** ⏳
6. **Resultado esperado**:
   - Spinner aparece e desaparece
   - Todos os campos preenchidos:
     - Nome Fantasia: PETROBRAS - EDISE
     - Razão Social: PETROLEO BRASILEIRO S A PETROBRAS
     - Telefone: (21) 2166-0000
     - CEP: 20031-170
     - Logradouro: AV REPUBLICA DO CHILE
     - Número: 65
     - Bairro: CENTRO
     - Cidade: RIO DE JANEIRO
     - UF: RJ
   - Toast verde: "✅ Dados encontrados!"

---

### **Teste 2: CNPJ Inválido** ❌

1. No campo CNPJ, digite: `36.354.806/0001-25`
2. Clique fora do campo
3. **Resultado esperado**:
   - Spinner aparece e desaparece
   - Campos ficam vazios
   - Toast vermelho: "CNPJ não encontrado"
   - Mensagem: "CNPJ não encontrado na base da Receita Federal. Verifique o número ou preencha os dados manualmente."
   - **Você pode continuar** preenchendo manualmente ✅

---

## 🌐 Fontes dos Dados

### **ReceitaWS**
- URL: https://receitaws.com.br/
- Dados: Base oficial da Receita Federal do Brasil
- Atualização: Diária
- Grátis: Sim (limite de 3 requisições/minuto)

### **Como testar a API diretamente**

**PowerShell**:
```powershell
Invoke-RestMethod -Uri "https://receitaws.com.br/v1/cnpj/33000167000101"
```

**Browser**:
```
https://receitaws.com.br/v1/cnpj/33000167000101
```

---

## ⚠️ Limitações da API

### **Taxa de Requisições**
- **Limite**: ~3 requisições por minuto
- **Ação**: Se exceder, aguarde 1 minuto

### **CNPJ Não Encontrado**
- **Motivo 1**: CNPJ não existe
- **Motivo 2**: CNPJ com situação BAIXADA (cancelado)
- **Motivo 3**: CNPJ recém-criado (ainda não na base)

### **API Fora do Ar**
- **Motivo**: Manutenção ou problema técnico
- **Ação**: Preencha manualmente (formulário sempre funciona)

---

## 💡 Dicas

### **Para Teste Rápido**
Use o CNPJ da **Petrobras**: `33.000.167/0001-01`
- Sempre ativo
- Dados completos
- Funcionamento garantido

### **Se a Busca Falhar**
1. ✅ **NÃO ENTRE EM PÂNICO**
2. ✅ O formulário continua funcionando
3. ✅ Preencha os campos manualmente
4. ✅ Validação garante dados corretos

### **Preenchimento Manual**
Mesmo que a API falhe, você pode:
- Digitar todos os campos manualmente
- Cadastrar a loja normalmente
- Sistema valida os dados no backend

---

## 📋 Checklist de Teste

- [ ] Teste com CNPJ válido (Petrobras)
- [ ] Verifique auto-preenchimento de todos os campos
- [ ] Teste com CNPJ inválido
- [ ] Verifique mensagem de erro
- [ ] Teste preenchimento manual após erro
- [ ] Teste busca de CEP (01310-100)
- [ ] Submeta formulário completo
- [ ] Verifique criação da loja no banco

---

## 🆘 Se Nada Funcionar

### **1. Verifique Console do Navegador**
```
F12 → Console → Procure por erros em vermelho
```

### **2. Teste API Manualmente**
```powershell
Invoke-RestMethod -Uri "https://receitaws.com.br/v1/cnpj/33000167000101"
```

### **3. Verifique Logs do Backend**
```powershell
docker logs win-marketplace-backend --tail 50
```

---

**✅ Use o CNPJ da Petrobras `33.000.167/0001-01` e teste novamente!**

