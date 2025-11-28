# 📋 Migração 002: Consolidar Sistema de Avaliações

## 🎯 Objetivo
Consolidar as 3 tabelas de avaliações duplicadas em uma única tabela otimizada:
- ❌ `avaliacoes` (tabela antiga, sem índices)
- ❌ `avaliacoes_produtos` (tabela duplicada)
- ✅ `avaliacoes_produto` (tabela mantida, com índices e melhor estrutura)

## 📊 Análise Atual

### Tabelas Duplicadas no Banco
```
avaliacoes          -> Tabela antiga, genérica
avaliacoes_produto  -> Tabela nova, com índices ✅ MANTER
avaliacoes_produtos -> Tabela duplicada (plural incorreto)
```

### Código Java Duplicado
```
Avaliacao.java                -> Entidade antiga
AvaliacaoProduto.java         -> Entidade nova ✅ MANTER
AvaliacaoService.java         -> Service antigo
AvaliacaoProdutoService.java  -> Service novo ✅ MANTER
AvaliacaoController.java      -> Controller antigo
AvaliacaoProdutoController.java -> Controller novo ✅ MANTER
```

## ⚙️ Processo de Migração

### Passo 1: Executar Script SQL no Banco

```bash
# Aplicar a migração
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < database/migrations/002_consolidar_avaliacoes.sql

# Ou usar o script helper:
./database/migrations/apply_002.sh   # Linux/Mac
.\database\migrations\apply_002.ps1  # Windows
```

**O que o script faz:**
1. ✅ Cria índices otimizados em `avaliacoes_produto`
2. ✅ Migra dados de `avaliacoes` → `avaliacoes_produto`
3. ✅ Migra dados de `avaliacoes_produtos` → `avaliacoes_produto`
4. ✅ Remove tabelas redundantes (`avaliacoes`, `avaliacoes_produtos`)
5. ✅ Verifica integridade dos dados

### Passo 2: Mover Código Java Antigo para Deprecated

```bash
cd backend/src/main/java/com/win/marketplace

# Mover entidade
mv model/Avaliacao.java _deprecated/Avaliacao.java.deprecated

# Mover repository
mv repository/AvaliacaoRepository.java _deprecated/AvaliacaoRepository.java.deprecated

# Mover service
mv service/AvaliacaoService.java _deprecated/AvaliacaoService.java.deprecated

# Mover controller
mv controller/AvaliacaoController.java _deprecated/AvaliacaoController.java.deprecated

# Mover mapper
mv dto/mapper/AvaliacaoMapper.java _deprecated/AvaliacaoMapper.java.deprecated
```

**Ou via PowerShell:**
```powershell
cd backend\src\main\java\com\win\marketplace

# Mover arquivos
Move-Item -Path "model\Avaliacao.java" -Destination "_deprecated\Avaliacao.java.deprecated" -Force
Move-Item -Path "repository\AvaliacaoRepository.java" -Destination "_deprecated\AvaliacaoRepository.java.deprecated" -Force
Move-Item -Path "service\AvaliacaoService.java" -Destination "_deprecated\AvaliacaoService.java.deprecated" -Force
Move-Item -Path "controller\AvaliacaoController.java" -Destination "_deprecated\AvaliacaoController.java.deprecated" -Force
Move-Item -Path "dto\mapper\AvaliacaoMapper.java" -Destination "_deprecated\AvaliacaoMapper.java.deprecated" -Force
```

### Passo 3: Verificar e Remover Referências no Código

Buscar por referências ao sistema antigo:
```bash
# Buscar imports
grep -r "import com.win.marketplace.model.Avaliacao;" backend/src/
grep -r "import com.win.marketplace.service.AvaliacaoService;" backend/src/
grep -r "import com.win.marketplace.controller.AvaliacaoController;" backend/src/

# Buscar uso das classes
grep -r "AvaliacaoService" backend/src/ | grep -v "AvaliacaoProdutoService"
grep -r "AvaliacaoController" backend/src/ | grep -v "AvaliacaoProdutoController"
```

### Passo 4: Atualizar Referencias no Frontend (se houver)

Buscar por endpoints antigos:
```bash
# No frontend
grep -r "/api/v1/avaliacoes" win-frontend/src/
```

Substituir por:
```
/api/v1/avaliacoes-produto
```

### Passo 5: Rebuild e Teste

```bash
# Rebuild dos containers
docker-compose down
docker-compose up --build -d

# Verificar logs
docker-compose logs -f backend

# Testar endpoints
curl http://localhost:8080/api/v1/avaliacoes-produto
```

## ✅ Verificações Pós-Migração

### 1. Verificar Banco de Dados
```sql
-- Conectar ao banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

-- Listar tabelas de avaliações (deve aparecer apenas avaliacoes_produto)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'avalia%';

-- Contar registros
SELECT COUNT(*) FROM avaliacoes_produto;

-- Verificar índices
\d avaliacoes_produto

-- Sair
\q
```

### 2. Verificar Compilação Java
```bash
# Não deve ter erros de compilação
docker-compose logs backend | grep -i error
```

### 3. Testar Funcionalidades
- ✅ Criar avaliação de produto
- ✅ Listar avaliações de um produto
- ✅ Listar avaliações de um usuário
- ✅ Atualizar avaliação
- ✅ Deletar avaliação
- ✅ Verificar média de notas no produto

## 📈 Benefícios da Consolidação

### Performance
- ✅ Índices otimizados: `idx_avaliacao_produto`, `idx_avaliacao_usuario`
- ✅ Query mais rápida para buscar avaliações por produto
- ✅ Query mais rápida para buscar avaliações por usuário
- ✅ Índice em `criado_em` para ordenação DESC eficiente

### Manutenibilidade
- ✅ Apenas 1 tabela ao invés de 3
- ✅ Apenas 1 entidade Java ao invés de 2
- ✅ Apenas 1 service ao invés de 2
- ✅ Apenas 1 controller ao invés de 2
- ✅ Código mais limpo e fácil de entender

### Integridade de Dados
- ✅ Sem duplicação de avaliações
- ✅ Estrutura consistente
- ✅ Timestamps (criado_em, atualizado_em) em todos os registros

## 🚨 Rollback (se necessário)

Se algo der errado, restaure o backup:

```bash
# Restaurar backup do banco
docker exec -i win-marketplace-db psql -U postgres -d win_marketplace < backup_before_migration.sql

# Restaurar arquivos Java
cd backend/src/main/java/com/win/marketplace
mv _deprecated/Avaliacao.java.deprecated model/Avaliacao.java
mv _deprecated/AvaliacaoRepository.java.deprecated repository/AvaliacaoRepository.java
mv _deprecated/AvaliacaoService.java.deprecated service/AvaliacaoService.java
mv _deprecated/AvaliacaoController.java.deprecated controller/AvaliacaoController.java
mv _deprecated/AvaliacaoMapper.java.deprecated dto/mapper/AvaliacaoMapper.java

# Rebuild
docker-compose up --build -d
```

## 📞 Troubleshooting

### Problema: Erro "relation avaliacoes does not exist"
**Solução**: A tabela antiga foi removida. Atualize o código para usar `AvaliacaoProduto`.

### Problema: Erro "AvaliacaoService cannot be resolved"
**Solução**: Substitua por `AvaliacaoProdutoService` no código.

### Problema: Frontend não carrega avaliações
**Solução**: Atualize a URL da API de `/api/v1/avaliacoes` para `/api/v1/avaliacoes-produto`.

### Problema: Dados perdidos após migração
**Solução**: Verifique se o script foi executado com COMMIT. Restaure o backup se necessário.

## 📝 Checklist Final

- [ ] Backup do banco criado
- [ ] Script SQL executado com sucesso
- [ ] Tabelas antigas removidas (`avaliacoes`, `avaliacoes_produtos`)
- [ ] Arquivos Java antigos movidos para `_deprecated/`
- [ ] Código compilando sem erros
- [ ] Testes funcionais passando
- [ ] Frontend atualizado (se necessário)
- [ ] Aplicação funcionando em produção
- [ ] Documentação atualizada

## 🎉 Resultado Esperado

**Antes:**
```
Tabelas: avaliacoes, avaliacoes_produto, avaliacoes_produtos
Classes: Avaliacao, AvaliacaoProduto
Services: AvaliacaoService, AvaliacaoProdutoService
```

**Depois:**
```
Tabelas: avaliacoes_produto
Classes: AvaliacaoProduto
Services: AvaliacaoProdutoService
```

✅ **Sistema mais limpo, rápido e fácil de manter!**
