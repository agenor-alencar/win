# 🔌 Integrações Externas - WIN Marketplace

Esta pasta contém módulos e configurações de integrações com serviços externos.

---

## 📋 Integrações Disponíveis

### 📧 Email (SendGrid)

**Status:** ✅ Configurado

**Descrição:** Envio de emails transacionais (recuperação de senha, notificações)

**Documentação:** [docs/configuration/email-sendgrid.md](../docs/configuration/email-sendgrid.md)

**Configuração:**
```properties
SENDGRID_API_KEY=SG.xxxxx
MAIL_FROM=noreply@winmarketplace.com
```

---

## 🚀 Como Adicionar Nova Integração

1. Criar pasta com nome da integração: `integracoes/nome-servico/`
2. Adicionar README.md com documentação
3. Adicionar arquivos de configuração/código
4. Atualizar este README.md
5. Documentar endpoints no `api-docs/` se aplicável

---

## 📚 Estrutura Sugerida

```
integracoes/
├── README.md (este arquivo)
├── sendgrid/
│   ├── README.md
│   ├── templates/
│   └── config/
├── payment-gateway/
│   ├── README.md
│   └── config/
└── storage/
    ├── README.md
    └── config/
```

---

## 🔐 Segurança

- ⚠️ **NUNCA** commitar chaves/tokens/senhas
- ✅ Usar variáveis de ambiente (`.env`)
- ✅ Documentar variáveis no `.env.example`
- ✅ Adicionar arquivos sensíveis no `.gitignore`

---

**Última atualização:** 23 de outubro de 2025
