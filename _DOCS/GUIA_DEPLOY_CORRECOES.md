# 🚀 Guia de Deploy - Correções Completas

## Status Atual

✅ **Todas as correções implementadas e testadas localmente**

### Problemas Corrigidos
1. ✅ Páginas de lojistas retornando 403 Forbidden
2. ✅ Fluxo de pagamento com erro de autorização
3. ✅ QR Code PIX não exibido
4. ✅ Página de pedidos com TypeError (campos incompatíveis)

### Testes Locais Realizados
- ✅ Backend compilado: BUILD SUCCESS
- ✅ Frontend compilado: BUILD SUCCESS
- ✅ QR Code PIX funcionando
- ✅ Página de pedidos corrigida

---

## 📋 Pré-requisitos no VPS

Antes de executar o deploy, verifique:

```bash
# 1. Acesso SSH funcionando
ssh usuario@seu-servidor

# 2. Docker e docker-compose instalados
docker --version
docker-compose --version

# 3. Espaço em disco suficiente (mínimo 5GB livre)
df -h

# 4. Permissões sudo
sudo -v
```

---

## 🔐 Backup Automático

O script de deploy cria backups automáticos:
- **Código**: `/var/backups/win/deploy_completo_TIMESTAMP/`
- **Banco**: `database_backup.sql`
- **Logs**: `/var/log/win/deploy_TIMESTAMP.log`

---

## 🚀 Deploy no VPS

### Opção 1: Deploy Completo (Recomendado)

```bash
# 1. Conectar no VPS
ssh usuario@seu-servidor

# 2. Navegar para o diretório
cd /var/www/win

# 3. Fazer commit e push das alterações locais primeiro
# (Execute isso no seu Windows ANTES do deploy)
git add .
git commit -m "Correções: lojistas, pagamento, QR code e pedidos"
git push origin main

# 4. No VPS, baixar atualizações
git pull origin main

# 5. Dar permissão de execução ao script
chmod +x scripts/deploy_completo_pagamento.sh

# 6. Executar deploy completo
./scripts/deploy_completo_pagamento.sh
```

### O que o script faz:

**FASE 1 - Preparação** (1-2 min)
- ✓ Cria backups completos (código + banco)
- ✓ Verifica git status

**FASE 2 - Atualização** (30 seg)
- ✓ Stash de alterações locais
- ✓ Pull do repositório

**FASE 3 - Parada** (10 seg)
- ✓ Para containers Docker

**FASE 4 - Backend** (1-2 min)
- ✓ Limpa build anterior
- ✓ Compila com Maven
- ✓ Verifica JAR gerado

**FASE 5 - Frontend** (1-2 min)
- ✓ Instala dependências
- ✓ Build com Vite
- ✓ Verifica dist gerado

**FASE 6 - Docker** (2-3 min)
- ✓ Remove imagens antigas
- ✓ Reconstrói sem cache

**FASE 7 - Inicialização** (30 seg)
- ✓ Inicia containers
- ✓ Aguarda 20 segundos

**FASE 8 - Health Check** (30 seg)
- ✓ Testa backend (actuator/health)
- ✓ Testa frontend
- ✓ Testa banco de dados
- ✓ Testa API de pedidos

**FASE 9 - Testes Funcionais** (30 seg)
- ✓ Verifica endpoint de lojistas
- ✓ Verifica endpoint de pagamentos

**Tempo total estimado: 8-12 minutos**

---

## ✅ Validação Pós-Deploy

### 1. Testar Login de Usuário
```bash
# No navegador:
https://seu-dominio.com/login

# Fazer login com um usuário de teste
# Verificar se não há erro 403 ou 401
```

### 2. Testar Página de Lojista
```bash
# No navegador:
https://seu-dominio.com/merchant

# Deve carregar normalmente com JWT válido
# Não deve retornar 403 Forbidden
```

### 3. Testar Fluxo de Pagamento PIX
```bash
# 1. Adicionar produto ao carrinho
# 2. Ir para checkout
# 3. Clicar em "Finalizar Pedido"
# 4. Selecionar "PIX" como forma de pagamento
# 5. Verificar se QR Code aparece
# 6. Verificar se código copia-cola aparece
# 7. Testar botão de copiar código
```

### 4. Testar Página de Pedidos
```bash
# No navegador:
https://seu-dominio.com/orders

# Verificar:
# - Pedidos carregam sem TypeError
# - Imagens dos produtos aparecem
# - Valores estão corretos
# - Status dos pedidos exibidos
# - Filtros funcionando (Todos, Pendentes, etc)
```

### 5. Verificar Logs
```bash
# Backend
sudo docker-compose logs -f backend | grep -i "error\|exception"

# Frontend
sudo docker-compose logs -f frontend

# Postgres
sudo docker-compose logs -f postgres
```

---

## 🔧 Troubleshooting

### Problema: Backend não responde (HTTP 000 ou 500)

```bash
# Verificar logs
sudo docker-compose logs --tail=100 backend

# Verificar se porta está aberta
netstat -tulpn | grep 8080

# Reiniciar backend
sudo docker-compose restart backend
```

### Problema: Frontend não carrega

```bash
# Verificar logs
sudo docker-compose logs --tail=100 frontend

# Verificar build
ls -lh win-frontend/dist

# Reiniciar frontend
sudo docker-compose restart frontend
```

### Problema: Banco de dados não conecta

```bash
# Verificar se está rodando
sudo docker-compose ps postgres

# Verificar logs
sudo docker-compose logs postgres

# Testar conexão
sudo docker exec win-postgres pg_isready -U winuser
```

### Problema: QR Code ainda não aparece

```bash
# Verificar resposta da API
curl -X POST http://localhost:8080/api/v1/pagamentos/pedido/[ID]/pix \
  -H "Content-Type: application/json"

# Verificar console do navegador (F12)
# Procurar por erros de CORS ou 401/403
```

### Problema: Erro 403 em páginas de lojistas

```bash
# Verificar JWT no localStorage
# Abrir console (F12) e digitar:
localStorage.getItem('win-token')

# Verificar se SecurityConfig está correto
grep -n "lojistas" backend/src/main/java/com/win/marketplace/config/SecurityConfig.java
```

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, execute o rollback:

```bash
# 1. Parar serviços
sudo docker-compose down

# 2. Localizar último backup
ls -lrt /var/backups/win/ | tail -5

# 3. Restaurar código
BACKUP_DIR="/var/backups/win/deploy_completo_20260221_HHMMSS"
sudo cp -r "$BACKUP_DIR/backend" /var/www/win/
sudo cp -r "$BACKUP_DIR/win-frontend" /var/www/win/

# 4. Rebuild e restart
cd /var/www/win
sudo docker-compose build --no-cache
sudo docker-compose up -d

# 5. Verificar se voltou ao normal
sudo docker-compose ps
curl http://localhost:8080/actuator/health
```

---

## 📊 Monitoramento Pós-Deploy

### Primeiras 24 horas

```bash
# Monitorar logs em tempo real
sudo docker-compose logs -f

# Verificar uso de recursos
htop

# Verificar containers
watch -n 5 'sudo docker-compose ps'

# Verificar conexões
netstat -an | grep :8080
netstat -an | grep :3000

# Verificar logs do nginx (se houver)
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Métricas a acompanhar

- Taxa de erro 4xx/5xx
- Tempo de resposta do backend
- Uso de CPU/memória dos containers
- Conexões ativas no banco
- Logs de exceções

---

## 📝 Checklist Final

Após o deploy, marcar:

- [ ] Backend respondendo (HTTP 200)
- [ ] Frontend respondendo (HTTP 200)
- [ ] Banco de dados aceitando conexões
- [ ] Login funcionando
- [ ] Páginas de lojistas carregando
- [ ] Fluxo de pagamento sem Access Denied
- [ ] QR Code PIX exibindo
- [ ] Página de pedidos sem TypeError
- [ ] Imagens dos produtos carregando
- [ ] Filtros de pedidos funcionando
- [ ] Logs sem erros críticos
- [ ] SSL/HTTPS funcionando (se configurado)
- [ ] Backup criado e verificado
- [ ] Documentação atualizada

---

## 🎯 Próximos Passos (Após Deploy)

1. **Monitoramento**: Acompanhar logs por 24h
2. **Performance**: Verificar tempo de resposta das APIs
3. **Usuários**: Coletar feedback sobre os flows corrigidos
4. **Otimização**: Considerar cache para imagens de produtos
5. **Testes**: Fazer testes de carga se necessário

---

## 📞 Suporte

**Documentação disponível em:**
- `_DOCS/CORRECAO_LOJISTAS_FORBIDDEN.md`
- `_DOCS/CORRECAO_FLUXO_PAGAMENTO.md`
- `_DOCS/CORRECAO_QRCODE_PIX.md`
- `_DOCS/CORRECAO_PAGINA_PEDIDOS.md`
- `_DOCS/RESUMO_CORRECOES_COMPLETO.md`

**Scripts:**
- `scripts/deploy_completo_pagamento.sh` - Deploy completo
- `scripts/corrigir_pagina_pedidos.sh` - Só página de pedidos
- `scripts/corrigir_fluxo_pagamento.sh` - Só fluxo de pagamento
- `scripts/corrigir_lojistas_forbidden.sh` - Só lojistas

---

## ✨ Resumo das Melhorias

### Segurança
- ✅ JWT agora obrigatório para rotas de lojistas
- ✅ Autenticação correta no fluxo de pedidos
- ✅ Rotas públicas apenas onde necessário (webhooks, PIX page)

### User Experience
- ✅ QR Code PIX exibindo corretamente
- ✅ Código copia-cola funcionando
- ✅ Página de pedidos com imagens
- ✅ Informações completas dos produtos

### Código
- ✅ Interfaces TypeScript consistentes
- ✅ DTOs backend completos
- ✅ Mapeamento correto de dados
- ✅ Tratamento de erros melhorado

---

**Data de Criação**: 21/02/2026  
**Versão**: 1.0  
**Status**: ✅ Pronto para Produção
