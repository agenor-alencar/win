# 📚 Documentação - WIN Marketplace

> Sistema de marketplace desenvolvido com Spring Boot, React e PostgreSQL

---

## 🚀 Início Rápido

Novo no projeto? Comece por aqui:

1. **[Instalação](../README.md#-início-rápido)** - Subir o sistema com Docker (5 min)
2. **[Criar Primeiro Admin](getting-started/first-admin.md)** - Configurar acesso administrativo (5 min)
3. **[Configurar Email](configuration/email-sendgrid.md)** _(opcional)_ - Habilitar reset de senha (10 min)

---

## 📖 Documentação por Categoria

### 🎯 Getting Started (Começando)

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| **[Criar Primeiro Admin](getting-started/first-admin.md)** | Como criar conta admin para acessar o sistema | 5 min |

### 🔑 Administração

| Documento | Descrição | Detalhes |
|-----------|-----------|----------|
| **[Gerador de Hash](admin/password-hash.md)** | Documentação completa do gerador de senha | Guia completo |
| **[Exemplos Práticos](admin/hash-examples.md)** | 10 exemplos prontos para copiar/colar | Casos de uso |

### ⚙️ Configuração

| Documento | Descrição | Recomendação |
|-----------|-----------|--------------|
| **[Email - SendGrid](configuration/email-sendgrid.md)** | Setup rápido SendGrid (10 min) | ✅ Produção |
| **[Email - SendGrid Detalhado](configuration/email-sendgrid-detailed.md)** | Guia completo passo a passo | 📖 Referência |
| **[Email - Gmail](configuration/email-gmail.md)** | Configuração Gmail para dev | 🧪 Dev apenas |

### 🔐 Segurança

| Documento | Descrição |
|-----------|-----------|
| **[Guia de Segurança](SECURITY.md)** | Boas práticas, variáveis de ambiente, proteção de senhas |
| **[Resumo de Otimizações](OPTIMIZATION.md)** | ✨ Mudanças de segurança e organização implementadas |

### ⚡ Performance e Otimização

| Documento | Descrição |
|-----------|-----------|
| **[Limpeza de Arquivos](CLEANUP.md)** | 🧹 Como remover arquivos desnecessários (~65 MB economizados) |

### 🐳 Deploy e Execução

| Documento | Descrição | Ambiente |
|-----------|-----------|----------|
| **[Docker](deployment/docker.md)** | Executar com Docker Compose | Recomendado |
| **[Desenvolvimento Local](deployment/local-development.md)** | Rodar sem Docker | Apenas dev |

### 🏗️ Arquitetura

| Documento | Descrição |
|-----------|-----------|
| **[Estrutura do Projeto](architecture/project-structure.md)** | Organização de pastas e arquivos |
| **[Especificações](architecture/specifications.md)** | Requisitos e funcionalidades |

---

## 🔍 Busca Rápida por Necessidade

### "Acabei de clonar o projeto"
1. ✅ [README principal](../README.md) → Subir containers
2. ✅ [Criar admin](getting-started/first-admin.md) → Acessar sistema
3. ✅ Fazer login → http://localhost:3000/login

### "Preciso criar conta admin"
- **Rápido:** [Criar Primeiro Admin](getting-started/first-admin.md) (comandos prontos)
- **Exemplos:** [Casos práticos](admin/hash-examples.md) (10 cenários)
- **Completo:** [Documentação detalhada](admin/password-hash.md)

### "Esqueci senha do admin"
- Ver: [Exemplo 3 - Reset de senha](admin/hash-examples.md#-exemplo-3-resetar-senha-de-admin-existente)

### "Quero configurar email"
- **Produção:** [SendGrid](configuration/email-sendgrid.md) ⭐ Recomendado
- **Desenvolvimento:** [Gmail](configuration/email-gmail.md)

### "Como rodar o sistema?"
- **Com Docker:** [Guia Docker](deployment/docker.md) ⭐ Recomendado
- **Sem Docker:** [Desenvolvimento local](deployment/local-development.md)

### "Quero entender o código"
- [Estrutura do projeto](architecture/project-structure.md)
- [Especificações técnicas](architecture/specifications.md)

---

## 🛠️ Scripts Automatizados

Disponíveis em `/scripts`:

```powershell
# Windows - Criar admin automaticamente
.\scripts\create-admin.ps1

# Linux/Mac - Criar admin automaticamente
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh
```

---

## 📊 Estrutura da Documentação

```
docs/
├── README.md (você está aqui)
│
├── getting-started/        # 🚀 Primeiros passos
│   └── first-admin.md      # Como criar conta admin
│
├── admin/                  # 🔑 Administração
│   ├── password-hash.md    # Gerador de hash completo
│   └── hash-examples.md    # Exemplos práticos
│
├── configuration/          # ⚙️ Configurações
│   ├── email-sendgrid.md   # SendGrid (produção)
│   ├── email-sendgrid-detailed.md
│   └── email-gmail.md      # Gmail (dev)
│
├── deployment/             # 🐳 Deploy
│   ├── docker.md           # Docker Compose
│   └── local-development.md
│
└── architecture/           # 🏗️ Arquitetura
    ├── project-structure.md
    └── specifications.md
```

---

## 🎓 Trilhas de Aprendizado

### 👶 Iniciante (Primeira Vez)
1. [README Principal](../README.md) - Visão geral
2. [Criar Admin](getting-started/first-admin.md) - Acesso ao sistema
3. [Exemplos Práticos](admin/hash-examples.md) - Casos de uso

**Tempo total:** ~15 minutos

### 🧑‍💻 Intermediário (Já rodou o projeto)
1. [Docker Completo](deployment/docker.md) - Gerenciar containers
2. [SendGrid](configuration/email-sendgrid.md) - Configurar email
3. [Estrutura](architecture/project-structure.md) - Entender código

**Tempo total:** ~30 minutos

### 🚀 Avançado (Deploy/Produção)
1. [SendGrid Detalhado](configuration/email-sendgrid-detailed.md)
2. [Especificações](architecture/specifications.md)
3. [Desenvolvimento Local](deployment/local-development.md)

**Tempo total:** ~1 hora

---

## 💡 Convenções

- **⭐** = Recomendado
- **✅** = Pronto para usar
- **🧪** = Apenas desenvolvimento
- **📖** = Documentação de referência
- **⚠️** = Atenção/Cuidado

---

## 🆘 Troubleshooting

### Backend não inicia
→ Ver [Docker - Troubleshooting](deployment/docker.md#troubleshooting)

### Não consigo criar admin
→ Ver [Criar Admin - Troubleshooting](getting-started/first-admin.md#-troubleshooting)

### Email não envia
→ Ver [SendGrid - Problemas](configuration/email-sendgrid.md#-troubleshooting)

### Porta ocupada
→ Ver [Docker - Portas](deployment/docker.md#portas-alternativas)

---

## 📝 Contribuindo

Ao adicionar nova documentação:

1. **Escolha a categoria certa** (`getting-started`, `admin`, `configuration`, etc.)
2. **Use templates consistentes** (veja arquivos existentes)
3. **Inclua exemplos práticos** sempre que possível
4. **Atualize este README** adicionando link para novo doc
5. **Teste os comandos** antes de documentar

---

## 🔗 Links Úteis

- **[README Principal](../README.md)** - Visão geral do projeto
- **[GitHub Issues](https://github.com/ArthurJsph/win-grupo1/issues)** - Reportar problemas
- **[Docker Hub](https://hub.docker.com/)** - Imagens Docker
- **[SendGrid](https://sendgrid.com/)** - Serviço de email

---

## 📞 Suporte

- **Dúvidas:** Consulte esta documentação
- **Bugs:** Abra issue no GitHub
- **Melhorias:** Pull requests são bem-vindos

---

## 📅 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 24/10/2025 | Reestruturação completa da documentação |
| 0.2.0 | 24/10/2025 | Adicionado gerador de hash de senha |
| 0.1.0 | - | Documentação inicial |

---

**Última atualização:** 24 de outubro de 2025  
**Mantido por:** Equipe WIN Marketplace  
**Status:** ✅ Ativo e mantido
