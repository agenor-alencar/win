# 💰 Sistema de Cadastro Bancário e Criação Automática de Recipients

## 📋 Resumo

O sistema Win Marketplace agora possui **criação automática de recipients no Pagar.me** quando o lojista cadastra seus dados bancários. Isso elimina a necessidade de criar recipients manualmente via API ou dashboard do Pagar.me.

---

## 🔄 Fluxo Completo

```
1. Lojista acessa painel Win Marketplace
   ↓
2. Navega para "Dados Bancários"
   ↓
3. Preenche formulário:
   - Nome do titular
   - CPF/CNPJ
   - Banco, agência, conta
   - Tipo de conta
   ↓
4. Clica em "Salvar"
   ↓
5. Sistema salva dados no banco Win
   ↓
6. Sistema chama API Pagar.me automaticamente
   ↓
7. Recipient é criado no Pagar.me
   ↓
8. recipient_id é salvo na tabela lojistas
   ↓
✅ Lojista está pronto para receber split de pagamento!
```

---

## 🎯 Endpoints da API

### **1. Cadastrar Dados Bancários**

**Cria/atualiza dados bancários e cria recipient automaticamente**

```http
POST /api/v1/lojistas/{lojistaId}/dados-bancarios
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
  "titularNome": "João da Silva",
  "titularDocumento": "12345678900",
  "titularTipo": "individual",
  "codigoBanco": "341",
  "agencia": "1234",
  "agenciaDv": "5",
  "conta": "12345",
  "contaDv": "6",
  "tipoConta": "conta_corrente"
}
```

**Resposta de sucesso (201 Created):**
```json
{
  "id": "uuid-dados-bancarios",
  "lojistaId": "uuid-lojista",
  "titularNome": "João da Silva",
  "titularDocumentoMascarado": "***.***.***-00",
  "titularTipo": "individual",
  "codigoBanco": "341",
  "nomeBanco": "Itaú",
  "agenciaMascarada": "**34-5",
  "contaMascarada": "****5-6",
  "tipoConta": "conta_corrente",
  "validado": true,
  "recipientCriado": true,
  "criadoEm": "2026-02-22T10:30:00Z",
  "atualizadoEm": "2026-02-22T10:30:00Z"
}
```

---

### **2. Buscar Dados Bancários**

**Retorna dados bancários cadastrados (mascarados por segurança)**

```http
GET /api/v1/lojistas/{lojistaId}/dados-bancarios
Authorization: Bearer {token_jwt}
```

**Resposta:**
```json
{
  "id": "uuid",
  "lojistaId": "uuid-lojista",
  "titularNome": "João da Silva",
  "titularDocumentoMascarado": "***.***.***-00",
  "nomeBanco": "Itaú",
  "agenciaMascarada": "**34-5",
  "contaMascarada": "****5-6",
  "validado": true,
  "recipientCriado": true
}
```

---

### **3. Recriar Recipient**

**Útil se houve erro na primeira tentativa**

```http
POST /api/v1/lojistas/{lojistaId}/dados-bancarios/recriar-recipient
Authorization: Bearer {token_jwt}
```

---

## 🏦 Códigos de Bancos Suportados

| Código | Banco |
|--------|-------|
| 001 | Banco do Brasil |
| 033 | Santander |
| 104 | Caixa Econômica |
| 237 | Bradesco |
| 341 | Itaú |
| 077 | Inter |
| 260 | Nubank |
| 290 | PagBank |
| 336 | C6 Bank |
| 422 | Safra |

---

## 🔐 Segurança

### **Dados Mascarados**

O sistema **NÃO retorna dados sensíveis completos** via API:

- ✅ CPF: `***.***.***-00` (somente 2 últimos dígitos)
- ✅ CNPJ: `**.***.***/0001-**` (somente parte do meio)
- ✅ Agência: `**34-5` (somente 2 últimos dígitos)
- ✅ Conta: `****5-6` (somente último dígito)

### **Permissões**

Apenas **LOJISTA** (owner) ou **ADMIN** podem:
- Cadastrar dados bancários
- Visualizar dados bancários
- Recriar recipient

---

## 📊 Estrutura do Banco de Dados

### **Tabela: `dados_bancarios_lojista`**

```sql
CREATE TABLE dados_bancarios_lojista (
    id UUID PRIMARY KEY,
    lojista_id UUID UNIQUE NOT NULL,
    titular_nome VARCHAR(200),
    titular_documento VARCHAR(14),
    titular_tipo VARCHAR(20),
    codigo_banco VARCHAR(3),
    agencia VARCHAR(10),
    agencia_dv VARCHAR(1),
    conta VARCHAR(20),
    conta_dv VARCHAR(2),
    tipo_conta VARCHAR(20),
    validado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP,
    atualizado_em TIMESTAMP
);
```

### **Coluna Adicionada em `lojistas`**

```sql
ALTER TABLE lojistas 
ADD COLUMN pagarme_recipient_id VARCHAR(100);
```

---

## 🎨 Exemplo de Interface (Frontend)

### **Formulário de Cadastro**

```tsx
// Componente: DadosBancarios.tsx

const DadosBancarios = () => {
  const [formData, setFormData] = useState({
    titularNome: '',
    titularDocumento: '',
    titularTipo: 'individual',
    codigoBanco: '',
    agencia: '',
    agenciaDv: '',
    conta: '',
    contaDv: '',
    tipoConta: 'conta_corrente'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post(
        `/v1/lojistas/${lojistaId}/dados-bancarios`,
        formData
      );
      
      if (response.data.recipientCriado) {
        alert('✅ Dados bancários salvos e recipient criado com sucesso!');
      }
    } catch (error) {
      alert('❌ Erro ao salvar dados bancários');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Nome do Titular"
        value={formData.titularNome}
        onChange={(e) => setFormData({...formData, titularNome: e.target.value})}
      />
      
      <input 
        placeholder="CPF ou CNPJ (somente números)"
        value={formData.titularDocumento}
        onChange={(e) => setFormData({...formData, titularDocumento: e.target.value})}
      />
      
      <select 
        value={formData.codigoBanco}
        onChange={(e) => setFormData({...formData, codigoBanco: e.target.value})}
      >
        <option value="">Selecione o banco</option>
        <option value="001">Banco do Brasil</option>
        <option value="341">Itaú</option>
        <option value="237">Bradesco</option>
        <option value="104">Caixa Econômica</option>
        {/* ... outros bancos */}
      </select>
      
      <input 
        placeholder="Agência"
        value={formData.agencia}
        onChange={(e) => setFormData({...formData, agencia: e.target.value})}
      />
      
      <input 
        placeholder="Conta"
        value={formData.conta}
        onChange={(e) => setFormData({...formData, conta: e.target.value})}
      />
      
      <input 
        placeholder="Dígito da Conta"
        value={formData.contaDv}
        onChange={(e) => setFormData({...formData, contaDv: e.target.value})}
      />
      
      <select 
        value={formData.tipoConta}
        onChange={(e) => setFormData({...formData, tipoConta: e.target.value})}
      >
        <option value="conta_corrente">Conta Corrente</option>
        <option value="conta_poupanca">Conta Poupança</option>
      </select>
      
      <button type="submit">Salvar e Criar Recipient</button>
    </form>
  );
};
```

---

## 🧪 Testando

### **1. Ambiente de Desenvolvimento**

```bash
# Credenciais Pagar.me devem estar no .env
PAGARME_API_KEY=sk_test_xxxxxxxx
PAGARME_ENABLED=true
PAGARME_ENVIRONMENT=test
```

### **2. Testar Cadastro via cURL**

```bash
curl -X POST http://localhost:8080/api/v1/lojistas/{uuid}/dados-bancarios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "titularNome": "Teste Silva",
    "titularDocumento": "12345678900",
    "titularTipo": "individual",
    "codigoBanco": "341",
    "agencia": "1234",
    "conta": "12345",
    "contaDv": "6",
    "tipoConta": "conta_corrente"
  }'
```

### **3. Verificar no Banco**

```sql
-- Ver dados bancários cadastrados
SELECT * FROM dados_bancarios_lojista;

-- Ver recipient_id criado
SELECT id, razao_social, pagarme_recipient_id 
FROM lojistas 
WHERE pagarme_recipient_id IS NOT NULL;
```

---

## ✅ Vantagens

1. ✅ **Automático**: Recipient criado instantaneamente
2. ✅ **Seguro**: Dados mascarados nas respostas
3. ✅ **Simples**: Lojista não precisa acessar Pagar.me
4. ✅ **Rastreável**: Logs completos de criação
5. ✅ **Recuperável**: Endpoint para recriar se falhar
6. ✅ **Validado**: Dados validados antes de enviar ao Pagar.me

---

## 🚨 Tratamento de Erros

### **Erro: Dados bancários inválidos**

```json
{
  "error": "Conta bancária inválida no Pagar.me",
  "message": "Verifique os dados e tente novamente"
}
```

**Solução**: Lojista pode usar o endpoint `recriar-recipient` após corrigir os dados.

### **Erro: Pagar.me indisponível**

Os dados são salvos no banco Win, mas recipient não é criado.  
**Solução**: Usar endpoint `recriar-recipient` posteriormente.

---

## 📝 Notas Importantes

1. **Ambiente de teste**: Use credenciais `sk_test_` do Pagar.me
2. **Ambiente de produção**: Trocar para `sk_live_` 
3. **Validação bancária**: Pagar.me valida dados automaticamente
4. **Taxas**: Verifique taxas de transferência com Pagar.me
5. **Prazo de transferência**: Configurado para D+0 (mesmo dia)

---

## 🎯 Próximos Passos

Após implementar esta funcionalidade:

1. ✅ Criar interface frontend para cadastro bancário
2. ✅ Adicionar validação de CPF/CNPJ no frontend
3. ✅ Mostrar status do recipient (criado/pendente/erro)
4. ✅ Implementar notificação quando recipient for criado
5. ✅ Dashboard para lojista visualizar dados bancários

---

**Documentação criada em:** 22/02/2026  
**Versão:** 1.0  
**Sistema:** Win Marketplace - Split de Pagamento Automático
