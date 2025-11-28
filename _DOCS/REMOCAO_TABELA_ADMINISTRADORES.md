# Remoção da Tabela `administradores`

## ✅ Alterações Realizadas

### 1. Banco de Dados
- **Script SQL criado**: `database/migrations/001_remove_administradores_table.sql`
- **Ação**: Remove a tabela `administradores` do PostgreSQL
- **Segurança**: Script com transação (BEGIN/ROLLBACK) para testes seguros

### 2. Modelo de Dados (Backend)
- **Arquivo removido**: `model/Administrador.java` → Movido para `_deprecated/`
- **Arquivo removido**: `repository/AdministradorRepository.java` → Movido para `_deprecated/`

### 3. Atualizações no Código

#### 3.1 Usuario.java
- ❌ Removido campo: `private Administrador administrador;`
- ❌ Removido do `@EqualsAndHashCode exclude`: `"administrador"`
- ✅ Mantido: Sistema de perfis através de `usuarioPerfis`

#### 3.2 UsuarioMapper.java
- ❌ Removido mapeamento: `@Mapping(target = "administrador", ignore = true)` (3 ocorrências)
- ✅ Funcionamento mantido através de `getPerfis()` que retorna perfis do usuário

## 🎯 Como Funciona Agora

### ANTES (Sistema Redundante)
```java
// Duas formas de verificar se é admin:
1. usuario.getAdministrador() != null
2. usuario.getUsuarioPerfis().contains("ADMIN")
```

### DEPOIS (Sistema Unificado)
```java
// Uma única forma:
usuario.getUsuarioPerfis().stream()
    .anyMatch(up -> up.getPerfil().getNome().equals("ADMIN"))
```

## 📋 Passo a Passo para Aplicar

### 1. Backup do Banco (OBRIGATÓRIO)
```bash
docker exec win-marketplace-db pg_dump -U postgres win_marketplace > backup_pre_remove_admin_$(date +%Y%m%d).sql
```

### 2. Testar o Script SQL
```bash
# Conectar ao banco
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace

# Executar o script (mode teste com ROLLBACK)
\i /path/to/001_remove_administradores_table.sql
```

**IMPORTANTE**: O script por padrão tem `ROLLBACK` no final. Isso permite testar sem aplicar mudanças.

### 3. Verificar Resultados do Teste
O script mostrará:
- ✅ Quantos registros existem em `administradores`
- ✅ Quais admins não têm perfil ADMIN
- ✅ Migração de perfis
- ✅ Verificação final

### 4. Aplicar Definitivamente
Edite o script e troque:
```sql
-- ROLLBACK;  -- Comentar esta linha
COMMIT;        -- Descomentar esta linha
```

Execute novamente:
```bash
docker exec -it win-marketplace-db psql -U postgres -d win_marketplace -f /database/migrations/001_remove_administradores_table.sql
```

### 5. Recompilar o Backend
```bash
cd backend
./mvnw clean compile
```

### 6. Reiniciar os Containers
```bash
docker-compose down
docker-compose up -d
```

### 7. Testar Funcionalidade de Admin
1. Fazer login com usuário admin
2. Verificar que todos os endpoints com `@PreAuthorize("hasAnyAuthority('ADMIN')")` funcionam
3. Verificar dashboard de admin
4. Testar criação/edição de produtos, categorias, etc.

## ✅ Validações

### Verificar que Admin Funciona Corretamente

```sql
-- Listar todos os usuários com perfil ADMIN
SELECT u.id, u.nome, u.email, p.nome as perfil
FROM usuarios u
JOIN usuario_perfis up ON up.usuario_id = u.id
JOIN perfis p ON p.id = up.perfil_id
WHERE p.nome = 'ADMIN';

-- Verificar que tabela administradores não existe mais
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'administradores';
-- Deve retornar 0
```

### Endpoints que Continuam Funcionando
- ✅ `POST /api/v1/auth/register` - Criar usuário
- ✅ `POST /api/v1/auth/login` - Login
- ✅ `GET /api/v1/usuarios/me` - Dados do usuário logado
- ✅ Todos os endpoints protegidos com `@PreAuthorize("hasAnyAuthority('ADMIN')")`

## 🔄 Rollback (Se Necessário)

Se algo der errado, restaure o backup:

```bash
docker exec -i win-marketplace-db psql -U postgres win_marketplace < backup_pre_remove_admin_YYYYMMDD.sql
```

## 📊 Impacto

### ✅ Benefícios
- **Simplicidade**: Um único sistema de controle de acesso
- **Consistência**: Não há mais duas fontes de verdade
- **Manutenibilidade**: Menos código para manter
- **Performance**: Uma tabela a menos para joins

### ⚠️ Riscos Mitigados
- ✅ Backup completo antes de qualquer alteração
- ✅ Script com transação para testes seguros
- ✅ Validações em cada etapa
- ✅ Rollback preparado

## 🎉 Resultado Final

### Tabelas do Sistema de Usuários
```
usuarios
├── usuario_perfis (many-to-many)
│   └── perfis
│       ├── ADMIN
│       ├── LOJISTA
│       └── USER
├── lojistas (one-to-one para LOJISTA)
└── motoristas (one-to-one para MOTORISTA)
```

**Tabela `administradores` removida** ✅

### Como Verificar se Usuário é Admin
```java
// No código Java
boolean isAdmin = usuario.getUsuarioPerfis().stream()
    .anyMatch(up -> up.getPerfil().getNome().equals("ADMIN"));

// Ou usando Spring Security
@PreAuthorize("hasAnyAuthority('ADMIN')")
public ResponseEntity<?> adminOnlyEndpoint() {
    // Este método só será acessível por usuários com perfil ADMIN
}
```

## 📝 Notas Importantes

1. **Criação de Admin**:
   - Use o endpoint `/api/dev/create-first-admin` para criar o primeiro admin
   - Ou use os scripts `create-admin.sh` / `create-admin.ps1`

2. **Verificação de Permissões**:
   - Sempre use `hasAnyAuthority('ADMIN')` ao invés de `hasAnyRole('ADMIN')`
   - O sistema de perfis é baseado em authorities, não roles

3. **Migração Automática**:
   - O script SQL garante que todos os usuários em `administradores` tenham perfil ADMIN
   - Nenhum admin perderá suas permissões

4. **Integridade Referencial**:
   - O script usa `CASCADE` para remover constraints automaticamente
   - Não haverá foreign keys órfãs

## 🔍 Checklist Final

Antes de considerar a migração completa:

- [ ] Backup do banco realizado
- [ ] Script testado com ROLLBACK
- [ ] Todos os admins têm perfil ADMIN
- [ ] Backend recompilado sem erros
- [ ] Containers reiniciados
- [ ] Login de admin testado
- [ ] Endpoints protegidos testados
- [ ] Dashboard de admin acessível
- [ ] Tabela administradores não existe mais no banco

## ✨ Conclusão

A remoção da tabela `administradores` simplifica a arquitetura sem perder nenhuma funcionalidade. O sistema de perfis já existente (`perfis` + `usuario_perfis`) é mais que suficiente para gerenciar permissões de administrador.

**Status**: ✅ Pronto para aplicar (com cautela e backup)
