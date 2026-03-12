# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o **WIN Marketplace**! Este documento oferece diretrizes para tornar o processo de contribuição claro e eficiente.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

---

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você deve seguir este código. Reporte comportamentos inaceitáveis para agenoralencaar@gmail.com.

---

## Como Posso Contribuir?

### 🐛 Reportar Bugs

Antes de criar um relatório de bug:
- Verifique se o bug já não foi reportado nas [issues](https://github.com/agenor-alencar/win/issues)
- Verifique se você está usando a versão mais recente
- Colete informações sobre o problema

**Como submeter um bom relatório de bug:**

1. Use um título claro e descritivo
2. Descreva os passos exatos para reproduzir o problema
3. Forneça exemplos específicos
4. Descreva o comportamento observado vs. esperado
5. Inclua screenshots se aplicável
6. Inclua detalhes do ambiente (OS, versão do Docker, etc.)

### 💡 Sugerir Features

Antes de criar uma sugestão de feature:
- Verifique se já não existe uma sugestão similar
- Determine qual repositório/componente a feature deve ser adicionada

**Como submeter uma boa sugestão de feature:**

1. Use um título claro e descritivo
2. Forneça uma descrição detalhada da feature
3. Explique por que esta feature seria útil
4. Liste exemplos de como a feature seria usada
5. Inclua mockups se aplicável

### 🔧 Contribuir com Código

1. **Issues para iniciantes**: Procure por issues com a label `good first issue`
2. **Help wanted**: Issues com a label `help wanted` são boas para contribuir
3. **Melhorias**: Identifique áreas que podem ser melhoradas

---

## Processo de Desenvolvimento

### 1. Fork e Clone

```bash
# Fork o repositório via GitHub UI
# Clone seu fork
git clone https://github.com/seu-usuario/win.git
cd win

# Adicione o repositório original como upstream
git remote add upstream https://github.com/agenor-alencar/win.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma nova branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-fix
```

### 3. Desenvolva

```bash
# Faça suas alterações
# Teste localmente
docker-compose up -d
```

### 4. Commit

```bash
# Adicione suas mudanças
git add .

# Commit seguindo o padrão Conventional Commits
git commit -m "feat: adiciona nova funcionalidade X"
```

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Crie um Pull Request via GitHub UI
```

---

## Padrões de Código

### Backend (Java/Spring Boot)

```java
// ✅ BOM - Nomenclatura clara, responsabilidade única
@Service
public class ProdutoService {
    
    @Transactional
    public ProdutoDTO criar(ProdutoCreateDTO dto) {
        // Validação
        validarProduto(dto);
        
        // Lógica de negócio
        Produto produto = produtoMapper.toEntity(dto);
        produto = produtoRepository.save(produto);
        
        // Retorno
        return produtoMapper.toDTO(produto);
    }
}

// ❌ RUIM - Nome genérico, múltiplas responsabilidades
public class Manager {
    public void doStuff(Object obj) {
        // ...
    }
}
```

**Diretrizes:**
- Use nomes descritivos e significativos
- Classes devem ter responsabilidade única (SOLID)
- Métodos devem ter no máximo 20-30 linhas
- Use DTOs para transferência de dados
- Documente métodos públicos com JavaDoc
- Trate exceções apropriadamente
- Use `Optional` para valores que podem ser nulos

### Frontend (React/TypeScript)

```typescript
// ✅ BOM - Componente funcional, tipado, reutilizável
interface ProdutoCardProps {
  produto: Produto;
  onAdicionar: (id: string) => void;
}

export const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onAdicionar }) => {
  const handleClick = () => {
    onAdicionar(produto.id);
  };
  
  return (
    <div className="produto-card">
      <h3>{produto.nome}</h3>
      <button onClick={handleClick}>Adicionar</button>
    </div>
  );
};

// ❌ RUIM - Sem tipos, props não validadas
export default function Card(props) {
  return <div>{props.data}</div>;
}
```

**Diretrizes:**
- Use TypeScript para type safety
- Componentes funcionais com hooks
- Props tipadas com interfaces
- Use custom hooks para lógica reutilizável
- Mantenha componentes pequenos e focados
- Use TailwindCSS para estilização
- Siga as convenções de nomenclatura do React

### SQL/Database

```sql
-- ✅ BOM - Nomes descritivos, constraints, indices
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    lojista_id UUID NOT NULL REFERENCES usuarios(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT produtos_nome_lojista_unique UNIQUE (nome, lojista_id)
);

CREATE INDEX idx_produtos_lojista ON produtos(lojista_id);
CREATE INDEX idx_produtos_nome ON produtos USING gin(to_tsvector('portuguese', nome));

-- ❌ RUIM - Sem constraints, nomes ruins
CREATE TABLE tbl1 (
    id INT,
    name TEXT,
    price FLOAT
);
```

**Diretrizes:**
- Use Flyway para migrations
- Nomeie migrations: `V{version}__{description}.sql`
- Sempre use transactions
- Crie indices para queries frequentes
- Use constraints para integridade de dados
- Documente migrations complexas

---

## Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

### Formato

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração (não adiciona feature nem corrige bug)
- `perf`: Melhorias de performance
- `test`: Adicionar ou corrigir testes
- `build`: Mudanças no sistema de build
- `ci`: Mudanças nos arquivos de CI
- `chore`: Outras mudanças que não modificam src ou test

### Exemplos

```bash
# Feature
git commit -m "feat(produtos): adiciona filtro por categoria"

# Bug fix
git commit -m "fix(carrinho): corrige cálculo de total"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Refactor
git commit -m "refactor(auth): simplifica validação de token"

# Performance
git commit -m "perf(queries): adiciona index em produtos.nome"

# Breaking change
git commit -m "feat(api)!: altera formato de resposta de produtos

BREAKING CHANGE: campo 'price' renomeado para 'preco'"
```

### Boas Práticas

- Use o imperativo: "adiciona" não "adicionando" ou "adicionado"
- Primeira linha com no máximo 72 caracteres
- Corpo do commit opcional para explicações detalhadas
- Referencie issues: `fix #123` ou `closes #456`
- Um commit = uma mudança lógica

---

## Pull Requests

### Antes de Submeter

- [ ] Código segue os padrões do projeto
- [ ] Commits seguem Conventional Commits
- [ ] Testes passam localmente
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem credenciais ou dados sensíveis commitados
- [ ] Branch atualizada com main

### Checklist do PR

```markdown
## Descrição
Descreva suas mudanças aqui

## Tipo de mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou feature que causaria falha em funcionalidades existentes)
- [ ] Documentação

## Como foi testado?
Descreva os testes realizados

## Checklist:
- [ ] Meu código segue o style guide do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei áreas complexas do código
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção funciona ou que minha feature funciona
- [ ] Testes unitários novos e existentes passam localmente
- [ ] Mudanças dependentes foram merged e publicadas
```

### Template de PR

Use o [template de PR](.github/pull_request_template.md) automaticamente ao criar um PR.

### Revisão de Código

- Seja respeitoso e construtivo
- Explique o "porquê", não apenas o "como"
- Aceite que existem múltiplas soluções corretas
- Reconheça boas práticas
- Busque entender antes de criticar

---

## Reportar Bugs

Use o [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md):

### Informações Necessárias

1. **Descrição**: O que aconteceu?
2. **Reprodução**: Passos para reproduzir
3. **Esperado**: O que deveria acontecer?
4. **Screenshots**: Se aplicável
5. **Ambiente**:
   - OS: [e.g. Windows 11, Ubuntu 22.04]
   - Browser: [e.g. Chrome 120, Firefox 121]
   - Versão: [e.g. 1.0.0]
6. **Logs**: Logs relevantes

---

## Sugerir Features

Use o [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md):

### Informações Necessárias

1. **Problema**: Que problema a feature resolve?
2. **Soluçãoproposta**: Como você imagina a feature?
3. **Alternativas**: Outras soluções consideradas?
4. **Contexto adicional**: Informações relevantes

---

## Dúvidas?

- 📖 [Documentação Completa](docs/README.md)
- 💬 [Discussions](https://github.com/agenor-alencar/win/discussions)
- 📧 Email: agenoralencaar@gmail.com

---

**Obrigado por contribuir! 🎉**

Cada contribuição, grande ou pequena, é valorizada e ajuda a tornar o WIN Marketplace melhor para todos.
