# 📚 Documentação - WIN Marketplace

Bem-vindo à documentação centralizada do WIN Marketplace. Aqui você encontrará guias, referências e recursos para desenvolver, implantar e manter a aplicação.

---

## 🚀 Comece Aqui

- **[GETTING_STARTED/](./GETTING_STARTED/)** - Setup local, primeiros passos, referência rápida
- **[QUICK_REFERENCE.md](./GETTING_STARTED/QUICK_REFERENCE.md)** - Guia rápido de comandos e procedimentos

---

## 📖 Categorias Principais

### 🏗️ [ARCHITECTURE/](./ARCHITECTURE/)
Documentação sobre arquitetura do sistema, estrutura de componentes e design.
- Análise do sistema ERP
- Estrutura do Uber Delivery
- Integração multi-ERP
- Resumo de organização

### 🔌 [API/](./API/)
Referência de APIs e documentação de endpoints.
- Documentação de endpoints
- Referência Uber Delivery
- API Recipients

### 💾 [DATABASE/](./DATABASE/)
Esquema do banco de dados, migrations e comandos.
- Scripts de migration
- Documentação de schema
- Instruções Flyway + Maven

### ⚙️ [CONFIGURATION/](./CONFIGURATION/)
Configuração da aplicação, dependências e extensões.
- POM dependencies
- Guias de configuração
- Manutenção de extensões

### 🚚 [DEPLOYMENT/](./DEPLOY/)
Guias de deploy, CI/CD e operações em produção.
- Scripts de deployment
- Setup SSL/HTTPS
- Instruções de rebuild

### ✨ [FEATURES/](./FEATURES/)
Documentação de features específicas.
- **UBER/** - Integração Uber Direct e webhooks
- **PAGAMENTO/** - Sistema de pagamentos
- Implementação completa

### 🔗 [INTEGRATION/](./INTEGRATION/)
Documentação sobre integrações com sistemas externos.
- ERP integrations (Tiny, NavSoft, etc)
- DigitalOcean Spaces setup
- S3 storage setup

### 🧪 [TESTING/](./TESTING/)
Testes, validação e checklist de qualidade.
- Testes E2E
- Relatório de testes
- Checklist de validação técnica

### 💻 [DEVELOPMENT/](./DEVELOPMENT/)
Guias de desenvolvimento e setup de ambiente.
- Environment setup
- Development best practices
- Troubleshooting

### 🔧 [OPERATIONS/](./OPERATIONS/)
Operações, performance e manutenção em produção.
- Best practices de manutenção
- Análise de performance
- Troubleshooting de startup
- Auditoria

### 🐛 [BUGS/](./BUGS/)
Rastreamento e documentação de bugs conhecidos.

### 🔒 [SECURITY/](../SECURITY.md)
Políticas de segurança e boas práticas.

### 📦 [ARCHIVE/](./ARCHIVE/)
Histórico de implementações e fases anteriores.
- Relatórios de PHASE 9
- Implementações antigas
- Documentação histórica

---

## 💡 Guias Rápidos

### Para Começar a Desenvolver
1. Leia [GETTING_STARTED/](./GETTING_STARTED/)
2. Configure seu ambiente local
3. Consulte [DEVELOPMENT/](./DEVELOPMENT/)
4. Veja exemplos em [API/](./API/)

### Para Deploy em Produção
1. Consulte [DEPLOYMENT/](./DEPLOY/)
2. Configure variáveis em [CONFIGURATION/](./CONFIGURATION/)
3. Siga [SECURITY.md](../SECURITY.md)
4. Monitore com [OPERATIONS/](./OPERATIONS/)

### Para Integrar um Novo Sistema
1. Veja exemplos em [INTEGRATION/](./INTEGRATION/)
2. Configure em [CONFIGURATION/](./CONFIGURATION/)
3. Teste com [TESTING/](./TESTING/)

### Para Resolver Problemas
1. Procure em [OPERATIONS/TROUBLESHOOTING/](./OPERATIONS/TROUBLESHOOTING/)
2. Consulte histórico em [ARCHIVE/](./ARCHIVE/)
3. Abra uma issue com [BUGS/](./BUGS/)

---

## 📋 Índice Completo de Arquivos

```
_DOCS/
├── ARCHIVE/                    # Histórico e implementações antigas
├── API/                        # Documentação de APIs
├── ARCHITECTURE/               # Estrutura e design do sistema
├── BUGS/                       # Rastreamento de bugs
├── CONFIGURATION/              # Configuração da app
├── DATABASE/                   # Banco de dados
├── DEPLOY/                     # Scripts e guias de deploy
├── DEVELOPMENT/                # Ambiente de desenvolvimento
├── DOCS_GERAL/                 # Documentação geral
├── FEATURES/                   # Features específicas
│   ├── UBER/                   # Integração Uber Direct
│   └── PAGAMENTO/              # Sistema de pagamentos
├── GETTING_STARTED/            # Primeiros passos
├── INTEGRATION/                # Integrações externas
├── OPERATIONS/                 # Operações e manutenção
│   └── TROUBLESHOOTING/        # Resolução de problemas
├── PERFORMANCE/                # Análise de performance
└── TESTING/                    # Testes e validação
```

---

## 🔍 Como Encontrar o que Precisa

| Preciso de... | Vá para... |
|---|---|
| Setup inicial | [GETTING_STARTED/](./GETTING_STARTED/) |
| Entender a arquitetura | [ARCHITECTURE/](./ARCHITECTURE/) |
| Documentação de APIs | [API/](./API/) |
| Configurar a app | [CONFIGURATION/](./CONFIGURATION/) |
| Fazer deploy | [DEPLOYMENT/](./DEPLOY/) |
| Trabalhar com Uber | [FEATURES/UBER/](./FEATURES/UBER/) |
| Testes e validação | [TESTING/](./TESTING/) |
| Troubleshooting | [OPERATIONS/TROUBLESHOOTING/](./OPERATIONS/TROUBLESHOOTING/) |
| Histórico de project | [ARCHIVE/](./ARCHIVE/) |

---

## 📝 Últimas Atualizações

- **2026-04-04**: Reorganização completa de documentação em categorias lógicas
- Consolidação de `docs/` e `_DOCS/`
- Remoção de arquivos desatualizados
- Criação de INDEX central

---

## 💬 Suporte

- 📖 Para dúvidas sobre documentação, consulte o README de cada pasta
- 🐛 Para reportar bugs, veja [BUGS/](./BUGS/)
- 🔒 Para questões de segurança, consulte [SECURITY.md](../SECURITY.md)
- ❓ Abra uma discussion no GitHub (não uma issue pública)

---

**Última atualização**: 4 de abril de 2026
