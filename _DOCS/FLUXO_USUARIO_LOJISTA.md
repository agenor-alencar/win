# 🔄 Fluxo de Usuário → Lojista - Análise e Implementação

**Data**: 18 de outubro de 2025  
**Status**: 📋 PLANEJAMENTO

---

## 📊 Situação Atual (Como Está)

### 1. **Registro de Usuário Comum**

#### Backend: `UsuarioService.criarUsuario()`
```java
// Linha 63-78: Perfil atribuído automaticamente
Perfil perfilUser = perfilRepository.findByNome("USER")
    .orElseThrow(() -> new ResourceNotFoundException("Perfil USER não encontrado"));

// Cria associação com perfil USER
UsuarioPerfil usuarioPerfil = new UsuarioPerfil();
// ... código de criação
savedUsuario.getUsuarioPerfis().add(usuarioPerfil);
```

#### Frontend: `AuthContext.tsx`
```typescript
// Linha 179-192: Função de registro
const register = async (userData: RegisterData): Promise<boolean> => {
  const response = await api.post("/auth/register", userData);
  handleAuthSuccess(response.data);
  return true;
}
```

#### Endpoint Utilizado
```
POST /api/v1/auth/register
Body: {
  nome: "João Silva",
  email: "joao@exemplo.com",
  senha: "Senha123",
  cpf: "12345678901",
  telefone: "(61) 99999-9999"
}

Response: {
  id: "uuid",
  nome: "João Silva",
  email: "joao@exemplo.com",
  perfis: ["USER"],  // ← APENAS USER
  ativo: true
}
```

### 2. **Botão "Venda no WIN"**

#### Localização no Header
```typescript
// Header.tsx - Linha 83-89
<Link
  to="/sell"
  className="text-[#3DBEAB] hover:text-[#3DBEAB]/80 font-medium"
>
  Venda no WIN
</Link>
```

#### Página de Destino
- **Rota**: `/sell`
- **Componente**: `BecomeASeller.tsx`
- **Funcionalidade Atual**: Página informativa que redireciona para `/merchant/auth`

#### Conteúdo da Página
```typescript
// BecomeASeller.tsx - Linha 164-177
<Link to="/merchant/auth">
  <Button size="lg" variant="secondary">
    Cadastrar Minha Loja
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</Link>
```

### 3. **Problema Identificado**

❌ **O fluxo atual NÃO diferencia usuário comum de lojista!**

- Todo usuário criado via `/auth/register` recebe apenas perfil `USER`
- O botão "Venda no WIN" leva para `/merchant/auth` (login de lojista)
- **Não existe endpoint para "transformar" USER em LOJISTA**
- Um USER não consegue se tornar LOJISTA pelo sistema

---

## 🎯 Objetivo (Como Deve Ser)

### Fluxo Desejado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO SE REGISTRA                                      │
│    POST /auth/register → Perfil: USER                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USUÁRIO LOGADO NAVEGA NO SITE                            │
│    - Faz compras como cliente comum                         │
│    - Vê botão "Venda no WIN" no Header                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USUÁRIO CLICA EM "VENDA NO WIN"                          │
│    Redirecionado para /sell (BecomeASeller.tsx)             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. USUÁRIO CLICA EM "CADASTRAR MINHA LOJA"                  │
│    Sistema detecta:                                          │
│    • Usuário JÁ ESTÁ LOGADO? → Formulário de Lojista        │
│    • Usuário NÃO LOGADO? → Redireciona para Login           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. FORMULÁRIO DE CADASTRO DE LOJISTA                        │
│    Campos adicionais:                                        │
│    - Nome da Loja                                            │
│    - CNPJ                                                    │
│    - Descrição                                               │
│    - Endereço Comercial                                      │
│    - Categorias de Produtos                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. SUBMISSÃO DO FORMULÁRIO                                  │
│    POST /api/v1/usuario/tornar-lojista                      │
│    Body: { lojistaData }                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND PROCESSA                                          │
│    • Cria entidade Lojista vinculada ao Usuario             │
│    • Adiciona perfil LOJISTA ao usuário                     │
│    • Retorna sucesso                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. USUÁRIO AGORA TEM 2 PERFIS                               │
│    Perfis: ["USER", "LOJISTA"]                              │
│    - Pode comprar como cliente (USER)                       │
│    - Pode vender como lojista (LOJISTA)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementação Necessária

### 1. **Backend: Criar Endpoint de Promoção**

#### Novo Controller: `UsuarioController.java`

```java
/**
 * Endpoint para transformar um USER em LOJISTA
 * Acessível apenas por usuários autenticados com perfil USER
 */
@PostMapping("/tornar-lojista")
@PreAuthorize("hasRole('USER') and isAuthenticated()")
public ResponseEntity<UsuarioResponseDTO> tornarLojista(
    @RequestBody @Valid LojistaRequestDTO lojistaData,
    @AuthenticationPrincipal UserDetails userDetails
) {
    String email = userDetails.getUsername();
    UsuarioResponseDTO usuario = usuarioService.promoverParaLojista(email, lojistaData);
    return ResponseEntity.ok(usuario);
}
```

#### Novo DTO: `LojistaRequestDTO.java`

```java
public record LojistaRequestDTO(
    @NotBlank(message = "Nome da loja é obrigatório")
    String nomeLoja,
    
    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ inválido")
    String cnpj,
    
    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 20, max = 500, message = "Descrição deve ter entre 20 e 500 caracteres")
    String descricao,
    
    @NotBlank(message = "Endereço é obrigatório")
    String endereco,
    
    @NotBlank(message = "CEP é obrigatório")
    String cep,
    
    @NotBlank(message = "Cidade é obrigatória")
    String cidade,
    
    @NotBlank(message = "Estado é obrigatório")
    String estado,
    
    String telefoneComercial,
    
    List<UUID> categoriaIds // IDs das categorias que o lojista trabalha
) {}
```

#### Novo Método: `UsuarioService.promoverParaLojista()`

```java
@Transactional
public UsuarioResponseDTO promoverParaLojista(String email, LojistaRequestDTO lojistaData) {
    log.info("Promovendo usuário {} para LOJISTA", email);
    
    // 1. Buscar usuário
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    
    // 2. Verificar se já é lojista
    boolean jaEhLojista = usuario.getUsuarioPerfis().stream()
        .anyMatch(up -> up.getPerfil().getNome().equals("LOJISTA"));
    
    if (jaEhLojista) {
        throw new BusinessException("Usuário já possui perfil de lojista");
    }
    
    // 3. Verificar se CNPJ já existe
    if (lojistaRepository.existsByCnpj(lojistaData.cnpj())) {
        throw new BusinessException("CNPJ já cadastrado no sistema");
    }
    
    // 4. Criar entidade Lojista
    Lojista lojista = new Lojista();
    lojista.setUsuario(usuario);
    lojista.setNomeLoja(lojistaData.nomeLoja());
    lojista.setCnpj(lojistaData.cnpj());
    lojista.setDescricao(lojistaData.descricao());
    lojista.setEndereco(lojistaData.endereco());
    lojista.setCep(lojistaData.cep());
    lojista.setCidade(lojistaData.cidade());
    lojista.setEstado(lojistaData.estado());
    lojista.setTelefoneComercial(lojistaData.telefoneComercial());
    lojista.setAtivo(true);
    lojista.setDataCadastro(OffsetDateTime.now());
    
    // 5. Salvar lojista
    lojista = lojistaRepository.save(lojista);
    log.info("Lojista criado com sucesso. ID: {}", lojista.getId());
    
    // 6. Adicionar perfil LOJISTA ao usuário
    Perfil perfilLojista = perfilRepository.findByNome("LOJISTA")
        .orElseThrow(() -> new ResourceNotFoundException("Perfil LOJISTA não encontrado"));
    
    UsuarioPerfilId usuarioPerfilId = new UsuarioPerfilId();
    usuarioPerfilId.setUsuarioId(usuario.getId());
    usuarioPerfilId.setPerfilId(perfilLojista.getId());
    
    UsuarioPerfil usuarioPerfil = new UsuarioPerfil();
    usuarioPerfil.setId(usuarioPerfilId);
    usuarioPerfil.setUsuario(usuario);
    usuarioPerfil.setPerfil(perfilLojista);
    
    if (usuario.getUsuarioPerfis() == null) {
        usuario.setUsuarioPerfis(new HashSet<>());
    }
    usuario.getUsuarioPerfis().add(usuarioPerfil);
    
    // 7. Salvar usuário com novo perfil
    usuario = usuarioRepository.save(usuario);
    log.info("✅ Perfil LOJISTA adicionado ao usuário: {}", usuario.getEmail());
    
    return usuarioMapper.toResponseDTO(usuario);
}
```

---

### 2. **Frontend: Criar Página de Cadastro de Lojista**

#### Nova Página: `BecomeMerchant.tsx`

```typescript
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/Api";

interface LojistaFormData {
  nomeLoja: string;
  cnpj: string;
  descricao: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  telefoneComercial: string;
}

export default function BecomeMerchant() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LojistaFormData>({
    nomeLoja: "",
    cnpj: "",
    descricao: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
    telefoneComercial: "",
  });

  // Verificar se usuário está logado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Você precisa estar logado para se tornar um lojista.
            </p>
            <Button onClick={() => navigate("/login")}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se já é lojista
  if (user?.perfis?.includes("LOJISTA")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Você já é um Lojista!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Você já possui uma loja cadastrada no WIN.
            </p>
            <Button onClick={() => navigate("/merchant/dashboard")}>
              Ir para Painel de Lojista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/usuario/tornar-lojista", formData);
      
      // Atualizar dados do usuário no contexto
      updateUser(response.data);

      toast({
        title: "Sucesso!",
        description: "Você agora é um lojista do WIN! 🎉",
        variant: "default",
      });

      // Redirecionar para dashboard do lojista
      navigate("/merchant/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cadastrar loja",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Cadastre sua Loja no WIN
            </CardTitle>
            <p className="text-gray-600">
              Preencha os dados abaixo para começar a vender
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Loja */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome da Loja *
                </label>
                <Input
                  name="nomeLoja"
                  value={formData.nomeLoja}
                  onChange={handleChange}
                  placeholder="Ex: Ferragens Silva"
                  required
                />
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  CNPJ *
                </label>
                <Input
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00000000000000"
                  maxLength={14}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição da Loja *
                </label>
                <Textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Conte sobre sua loja, produtos e diferenciais..."
                  rows={4}
                  required
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Endereço Comercial *
                </label>
                <Input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, complemento"
                  required
                />
              </div>

              {/* CEP, Cidade, Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    CEP *
                  </label>
                  <Input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cidade *
                  </label>
                  <Input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Brasília"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado *
                  </label>
                  <Input
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="DF"
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              {/* Telefone Comercial */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefone Comercial
                </label>
                <Input
                  name="telefoneComercial"
                  value={formData.telefoneComercial}
                  onChange={handleChange}
                  placeholder="(61) 99999-9999"
                />
              </div>

              {/* Botão de Submissão */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Minha Loja"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### 3. **Frontend: Modificar `BecomeASeller.tsx`**

#### Alterar Botão "Cadastrar Minha Loja"

```typescript
// ANTES (linha 164):
<Link to="/merchant/auth">
  <Button size="lg" variant="secondary">
    Cadastrar Minha Loja
  </Button>
</Link>

// DEPOIS:
<Link to="/become-merchant">
  <Button size="lg" variant="secondary">
    Cadastrar Minha Loja
  </Button>
</Link>
```

---

### 4. **Frontend: Adicionar Rota**

#### Modificar `main.tsx` ou arquivo de rotas

```typescript
import BecomeMerchant from "@/pages/shared/BecomeMerchant";

// Adicionar rota:
{
  path: "/become-merchant",
  element: <BecomeMerchant />
}
```

---

## 📋 Checklist de Implementação

### Backend
- [ ] Criar `LojistaRequestDTO.java`
- [ ] Criar método `promoverParaLojista()` em `UsuarioService`
- [ ] Adicionar endpoint `POST /usuario/tornar-lojista` em `UsuarioController`
- [ ] Adicionar `@PreAuthorize("hasRole('USER')")` no endpoint
- [ ] Criar `LojistaRepository.existsByCnpj()` se não existir
- [ ] Testar endpoint com Postman/Thunder Client

### Frontend
- [ ] Criar componente `BecomeMerchant.tsx`
- [ ] Criar formulário com validação
- [ ] Adicionar lógica de verificação de login
- [ ] Adicionar lógica de verificação se já é lojista
- [ ] Integrar com API (`POST /usuario/tornar-lojista`)
- [ ] Atualizar contexto de autenticação após sucesso
- [ ] Modificar link em `BecomeASeller.tsx`
- [ ] Adicionar rota `/become-merchant`
- [ ] Testar fluxo completo

### Testes
- [ ] Criar usuário comum (USER)
- [ ] Logar com usuário
- [ ] Clicar em "Venda no WIN"
- [ ] Preencher formulário de lojista
- [ ] Verificar se perfil LOJISTA foi adicionado
- [ ] Verificar se entidade Lojista foi criada
- [ ] Testar acesso a endpoints de lojista

---

## 🎓 Observações Importantes

### 1. **Perfis Múltiplos**
Um usuário pode ter AMBOS os perfis simultaneamente:
```json
{
  "perfis": ["USER", "LOJISTA"]
}
```
Isso permite que ele:
- **Compre** como cliente (perfil USER)
- **Venda** como lojista (perfil LOJISTA)

### 2. **Segurança**
O endpoint `tornar-lojista` deve:
- ✅ Exigir autenticação (`isAuthenticated()`)
- ✅ Exigir perfil USER (`hasRole('USER')`)
- ✅ Verificar se usuário já é lojista
- ✅ Validar CNPJ único no sistema

### 3. **UX (Experiência do Usuário)**
- ❌ **NÃO** exigir novo cadastro/login
- ✅ **SIM** utilizar dados do usuário existente
- ✅ **SIM** adicionar perfil ao invés de substituir
- ✅ **SIM** mostrar mensagem de sucesso clara

### 4. **Entidade Lojista**
A entidade `Lojista` já existe no banco e tem:
- Relacionamento `@OneToOne` com `Usuario`
- Campos: nomeLoja, cnpj, descricao, endereco, etc.
- Logo, só precisamos criar o registro e associar ao usuário

---

## 🚀 Próximos Passos Após Implementação

1. **Dashboard Contextual**: Mostrar interface diferente se usuário tem perfil LOJISTA
2. **Troca de Contexto**: Botão para alternar entre "Modo Cliente" e "Modo Lojista"
3. **Aprovação Manual**: Adicionar campo `lojistaAprovado` para moderação
4. **Verificação de Documentos**: Upload de CNPJ, Alvará, etc.
5. **Onboarding**: Tutorial guiado para novos lojistas

---

**Documentado por**: GitHub Copilot  
**Data**: 18 de outubro de 2025
