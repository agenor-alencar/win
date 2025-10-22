# 🔗 Integração com APIs Externas

**Data**: 18 de outubro de 2025  
**Objetivo**: Auto-preenchimento de formulários com CNPJ e CEP

---

## 🎯 Requisitos

### **1. Auto-preenchimento por CNPJ**
- **API**: ReceitaWS (https://receitaws.com.br/api/v1/cnpj/{cnpj})
- **Campos preenchidos**:
  - Razão Social
  - Nome Fantasia
  - Telefone
  - Email
  - Endereço completo (CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF)
  - Situação Cadastral

### **2. Auto-preenchimento por CEP**
- **API**: ViaCEP (https://viacep.com.br/ws/{cep}/json/)
- **Campos preenchidos**:
  - Logradouro (Rua/Avenida)
  - Bairro
  - Cidade
  - UF (Estado)

### **3. Campos de Endereço Obrigatórios**
Para o lojista poder receber pedidos e ter produtos visíveis:
- ✅ CEP
- ✅ Logradouro
- ✅ Número
- ⚠️ Complemento (opcional)
- ✅ Bairro
- ✅ Cidade
- ✅ UF

---

## 📋 Implementação

### **Backend - Atualizar DTO**

**Arquivo**: `backend/src/main/java/com/win/marketplace/dto/request/LojistaRequestDTO.java`

```java
@NotBlank(message = "CEP é obrigatório")
@Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
private String cep;

@NotBlank(message = "Logradouro é obrigatório")
@Size(min = 3, max = 255, message = "Logradouro deve ter entre 3 e 255 caracteres")
private String logradouro;

@NotBlank(message = "Número é obrigatório")
@Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
private String numero;

@Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
private String complemento; // Opcional

@NotBlank(message = "Bairro é obrigatório")
@Size(min = 2, max = 100, message = "Bairro deve ter entre 2 e 100 caracteres")
private String bairro;

@NotBlank(message = "Cidade é obrigatória")
@Size(min = 2, max = 100, message = "Cidade deve ter entre 2 e 100 caracteres")
private String cidade;

@NotBlank(message = "UF é obrigatório")
@Pattern(regexp = "[A-Z]{2}", message = "UF deve ter 2 letras maiúsculas")
private String uf;
```

---

### **Frontend - API Service**

**Arquivo**: `win-frontend/src/lib/ExternalApis.ts` (NOVO)

```typescript
// API ReceitaWS
export interface ReceitaWSResponse {
  cnpj: string;
  nome: string; // Razão Social
  fantasia: string; // Nome Fantasia
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string; // Cidade
  uf: string;
  situacao: string; // ATIVA, BAIXADA, etc
}

export async function buscarCNPJ(cnpj: string): Promise<ReceitaWSResponse> {
  const cnpjNumeros = cnpj.replace(/\D/g, '');
  const response = await fetch(`https://receitaws.com.br/api/v1/cnpj/${cnpjNumeros}`);
  
  if (!response.ok) {
    throw new Error('CNPJ não encontrado');
  }
  
  return response.json();
}

// API ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;
  erro?: boolean;
}

export async function buscarCEP(cep: string): Promise<ViaCEPResponse> {
  const cepNumeros = cep.replace(/\D/g, '');
  const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
  
  if (!response.ok) {
    throw new Error('CEP não encontrado');
  }
  
  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP inválido');
  }
  
  return data;
}
```

---

### **Frontend - BecomeMerchant.tsx**

**Adicionar campos de endereço**:

```typescript
const formSchema = z.object({
  nomeFantasia: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  razaoSocial: z.string().min(2, "Razão social deve ter pelo menos 2 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  descricao: z.string().min(20, "Mínimo 20 caracteres").max(1000, "Máximo 1000 caracteres"),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  
  // NOVOS CAMPOS
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  logradouro: z.string().min(3, "Logradouro deve ter pelo menos 3 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  uf: z.string().regex(/^[A-Z]{2}$/, "UF inválida (ex: SP, RJ)"),
});
```

**Função de busca CNPJ**:

```typescript
const handleCNPJBlur = async () => {
  const cnpj = form.getValues("cnpj");
  if (!cnpj || cnpj.length !== 18) return;

  try {
    setIsLoadingCNPJ(true);
    const data = await buscarCNPJ(cnpj);
    
    if (data.situacao !== "ATIVA") {
      toast({
        title: "⚠️ Atenção",
        description: "Este CNPJ está com situação: " + data.situacao,
        variant: "destructive",
      });
    }
    
    // Preencher formulário automaticamente
    form.setValue("razaoSocial", data.nome);
    form.setValue("nomeFantasia", data.fantasia || data.nome);
    form.setValue("telefone", formatarTelefone(data.telefone));
    form.setValue("cep", formatarCEP(data.cep));
    form.setValue("logradouro", data.logradouro);
    form.setValue("numero", data.numero);
    form.setValue("complemento", data.complemento);
    form.setValue("bairro", data.bairro);
    form.setValue("cidade", data.municipio);
    form.setValue("uf", data.uf);
    
    toast({
      title: "✅ Dados encontrados!",
      description: "Formulário preenchido automaticamente. Verifique os dados.",
    });
  } catch (error) {
    toast({
      title: "Erro ao buscar CNPJ",
      description: "Não foi possível encontrar os dados. Preencha manualmente.",
      variant: "destructive",
    });
  } finally {
    setIsLoadingCNPJ(false);
  }
};
```

**Função de busca CEP**:

```typescript
const handleCEPBlur = async () => {
  const cep = form.getValues("cep");
  if (!cep || cep.length !== 9) return;

  try {
    setIsLoadingCEP(true);
    const data = await buscarCEP(cep);
    
    // Preencher campos de endereço
    form.setValue("logradouro", data.logradouro);
    form.setValue("bairro", data.bairro);
    form.setValue("cidade", data.localidade);
    form.setValue("uf", data.uf);
    
    // Focar no campo número
    document.getElementById("numero")?.focus();
    
    toast({
      title: "✅ CEP encontrado!",
      description: "Endereço preenchido. Informe o número.",
    });
  } catch (error) {
    toast({
      title: "CEP não encontrado",
      description: "Verifique o CEP ou preencha manualmente.",
      variant: "destructive",
    });
  } finally {
    setIsLoadingCEP(false);
  }
};
```

---

## 🔄 Fluxo de Uso

### **Cenário 1: Busca por CNPJ**
1. Usuário digita CNPJ: `12.345.678/0001-90`
2. Ao sair do campo (onBlur), sistema busca na ReceitaWS
3. ✅ Se encontrado: Preenche TODOS os campos automaticamente
4. ⚠️ Se CNPJ baixado: Exibe aviso mas permite continuar
5. ❌ Se não encontrado: Permite preenchimento manual

### **Cenário 2: Busca por CEP**
1. Usuário digita CEP: `01310-100`
2. Ao sair do campo, sistema busca no ViaCEP
3. ✅ Se encontrado: Preenche Logradouro, Bairro, Cidade, UF
4. 🎯 Foco automático no campo "Número"
5. ❌ Se não encontrado: Permite preenchimento manual

---

## 🛡️ Validações

### **CNPJ**
- ✅ Formato: XX.XXX.XXX/XXXX-XX
- ✅ Somente números (14 dígitos)
- ✅ Verificação se já existe no banco
- ⚠️ Aviso se situação não for "ATIVA"

### **CEP**
- ✅ Formato: XXXXX-XXX
- ✅ Somente números (8 dígitos)
- ✅ Validação via ViaCEP

### **Endereço Completo**
- ✅ Logradouro: 3-255 caracteres
- ✅ Número: 1-10 caracteres
- ⚪ Complemento: Opcional, máx 100 caracteres
- ✅ Bairro: 2-100 caracteres
- ✅ Cidade: 2-100 caracteres
- ✅ UF: 2 letras maiúsculas (SP, RJ, MG, etc)

---

## 📊 Estrutura do Banco

### **Tabela `lojista`** (Atualizar)

```sql
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS cep VARCHAR(8);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS numero VARCHAR(10);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE lojista ADD COLUMN IF NOT EXISTS uf VARCHAR(2);

-- Índice para busca por região
CREATE INDEX IF NOT EXISTS idx_lojista_uf_cidade ON lojista(uf, cidade);
CREATE INDEX IF NOT EXISTS idx_lojista_cep ON lojista(cep);
```

---

## 🎨 UI/UX

### **Indicadores Visuais**
- 🔄 **Loading**: Spinner ao buscar CNPJ/CEP
- ✅ **Sucesso**: Toast verde com mensagem de confirmação
- ❌ **Erro**: Toast vermelho com mensagem de erro
- ⚠️ **Aviso**: Toast amarelo para CNPJ com situação irregular

### **Auto-formatação**
- CNPJ: `12345678000190` → `12.345.678/0001-90`
- CEP: `01310100` → `01310-100`
- Telefone: `11987654321` → `(11) 98765-4321`

---

## 🔐 Segurança

### **Rate Limiting**
- ReceitaWS: Máx 3 requisições/minuto
- ViaCEP: Sem limite conhecido, mas usar debounce

### **Timeout**
- Aguardar máx 5 segundos por requisição
- Se timeout: Permitir preenchimento manual

### **Fallback**
- Se APIs falharem: Formulário manual sempre disponível
- Não bloquear cadastro por falha de API

---

## 📝 Próximos Passos

1. ✅ Criar `ExternalApis.ts` com funções de busca
2. ✅ Atualizar `LojistaRequestDTO.java` com campos de endereço
3. ✅ Atualizar entidade `Lojista.java` no backend
4. ✅ Adicionar migration SQL para novos campos
5. ✅ Atualizar `BecomeMerchant.tsx` com novos campos
6. ✅ Implementar funções de auto-preenchimento
7. ✅ Adicionar loading states e feedbacks visuais
8. ✅ Testar fluxo completo
9. ⏳ Adicionar tela de configurações de perfil
10. ⏳ Implementar lógica de visibilidade por região

---

**Criado por**: GitHub Copilot  
**Data**: 18 de outubro de 2025
