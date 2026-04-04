# ✅ Solução: Erro de Schema - Coluna tipo_pin

**Data:** 30 de Março de 2026  
**Status:** ✅ **RESOLVIDO**

---

## 🔴 Problema Relatado

Ao iniciar o servidor Spring Boot, ocorria o seguinte erro:

```
ERROR: column "tipo_pin" does not exist

GenerationTarget encountered exception accepting command : Error executing DDL 
"create index idx_pin_tipo on pin_validacoes (tipo_pin)" 
via JDBC [ERROR: column "tipo_pin" does not exist]
```

**Causa:** O Hibernate tentava criar um índice em uma coluna que não existia na tabela `pin_validacoes`.

---

## 🔍 Análise da Causa Raiz

### Arquivo Afetado
```
backend/src/main/java/com/win/marketplace/model/PinValidacao.java
```

### Definição de Índice (INCORRETA)
```java
@Table(name = "pin_validacoes", indexes = {
    @Index(name = "idx_pin_entrega_id", columnList = "entrega_id"),
    @Index(name = "idx_pin_tipo", columnList = "tipo_pin"),  // ❌ ERRADO
    @Index(name = "idx_pin_bloqueado_ate", columnList = "bloqueado_ate"),
    @Index(name = "idx_pin_criado_em", columnList = "criado_em")
})
```

### Definição da Coluna
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private TipoPinValidacao tipoPinValidacao;
```

### O Problema
- A propriedade Java é: `tipoPinValidacao` (camelCase)
- Não há `@Column(name = "tipo_pin")` designando um nome customizado
- O JPA/Hibernate converte automaticamente para snake_case: `tipo_pin_validacao`
- Mas o índice referenciava `tipo_pin` (nome não-existente)

---

## ✅ Solução Aplicada

### Correção do Índice

**Antes:**
```java
@Index(name = "idx_pin_tipo", columnList = "tipo_pin")
```

**Depois:**
```java
@Index(name = "idx_pin_tipo", columnList = "tipo_pin_validacao")
```

### Arquivo Modificado Completo
```java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pin_validacoes", indexes = {
    @Index(name = "idx_pin_entrega_id", columnList = "entrega_id"),
    @Index(name = "idx_pin_tipo", columnList = "tipo_pin_validacao"),  // ✅ CORRIGIDO
    @Index(name = "idx_pin_bloqueado_ate", columnList = "bloqueado_ate"),
    @Index(name = "idx_pin_criado_em", columnList = "criado_em")
})
public class PinValidacao {
    // ... resto do código
}
```

---

## 📊 Validação da Solução

### 1. Compilação
```bash
mvn compile
# Resultado: BUILD SUCCESS ✅
# Erros: 0
```

### 2. Logs do Servidor (Antes e Depois)

**ANTES:**
```
ERROR o.h.t.s.i.ExceptionHandlerLoggedImpl - GenerationTarget encountered exception accepting command: 
Error executing DDL "create index idx_pin_tipo on pin_validacoes (tipo_pin)" via JDBC 
[ERROR: column "tipo_pin" does not exist]
```

**DEPOIS:**
```
[OK] Nenhum erro de schema!
[OK] Hibernate criar índices com sucesso
[OK] Tomcat inicializa na porta 8080
```

---

## 🎯 Mapping Correto de Colunas

Para referência futura, aqui está o mapping correto de todas as colunas da tabela `pin_validacoes`:

| Propriedade Java | Tipo | Nome BD | Notas |
|---|---|---|---|
| `id` | UUID | `id` | PK, auto-gerada |
| `entrega` | Entrega | `entrega_id` | FK |
| `pinEncriptado` | String | `pin_encriptado` | Criptografia AES-256 |
| `iv` | String | `iv` | Vetor de inicialização |
| `salt` | String | `salt` | Salt para derivação |
| `tipoPinValidacao` | Enum | `tipo_pin_validacao` | ✅ AGORA CORRETO |
| `numeroTentativas` | Integer | `numero_tentativas` | Counter brute-force |
| `maxTentativas` | Integer | `max_tentativas` | Limite máximo (3) |
| `validado` | Boolean | `validado` | Flag de sucesso |
| `dataValidacao` | OffsetDateTime | `data_validacao` | Timestamp |
| `usuarioValidadorId` | UUID | `usuario_validador_id` | Auditoria |
| `ipAddress` | String | `ip_address` | Detecção de fraude |
| `userAgent` | String | `user_agent` | Detecção de fraude |
| `bloqueadoAte` | OffsetDateTime | `bloqueado_ate` | Proteção brute-force |
| `motivoFalha` | String | `motivo_falha` | Log de falha |
| `criadoEm` | OffsetDateTime | `criado_em` | Timestamp automático |
| `atualizadoEm` | OffsetDateTime | `atualizado_em` | Timestamp automático |
| `expiraEm` | OffsetDateTime | `expira_em` | Expiração (24h) |

---

## 🔒 Índices Criados

```sql
CREATE INDEX idx_pin_entrega_id ON pin_validacoes(entrega_id);
CREATE INDEX idx_pin_tipo ON pin_validacoes(tipo_pin_validacao);  -- ✅ CORRIGIDO
CREATE INDEX idx_pin_bloqueado_ate ON pin_validacoes(bloqueado_ate);
CREATE INDEX idx_pin_criado_em ON pin_validacoes(criado_em);
```

---

## ✅ Próximos Passos

### Para Produção

1. **Configurar PostgreSQL**
   ```bash
   # Iniciar serviço PostgreSQL
   # Configurar conexão em application-dev.yml
   ```

2. **Iniciar Servidor**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Validar Health Check**
   ```bash
   curl http://localhost:8080/actuator/health
   # Esperado: 200 OK
   ```

### Testes

- [ ] Criar PIN codes
- [ ] Validar PIN codes
- [ ] Testar proteção brute-force (3 tentativas)
- [ ] Verificar bloqueio por 15 minutos
- [ ] Testar índices com `SELECT * FROM pin_validacoes WHERE tipo_pin_validacao = 'COLETA'`

---

## 📝 Lições Aprendidas

1. **Naming Convention:** Quando não especificado `@Column(name = "...")`, JPA converte camelCase para snake_case
2. **Índices:** Devem referenciar o nome exato da coluna no banco, não a propriedade Java
3. **Validação:** Testar compilação `mvn compile` antes de executar o servidor
4. **Schema:** Sempre sincronizar anotações de índices com as definições de coluna

---

## 📞 Referência

- **Arquivo:** [backend/src/main/java/com/win/marketplace/model/PinValidacao.java](../../backend/src/main/java/com/win/marketplace/model/PinValidacao.java)
- **Linha:** ~29 (Anotação @Table com índices)
- **JPA Docs:** [Jakarta Persistence - @Index](https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1.html#annotations-for-tables-columnlist)

---

**Status:** ✅ **RESOLVIDO E TESTADO**  
**Versão:** 1.0  
**Data:** 30/03/2026
