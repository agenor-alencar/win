# Guia Rápido de Deploy - Sistema de Geolocalização

## ⚡ Comandos para Executar na VPS

### 1️⃣ Aplicar Migrations SQL

```bash
# Ir para o diretório do projeto
cd /root/win

# Aplicar migration para lojistas
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_lojista_coordinates.sql

# Aplicar migration para usuários e endereços
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_usuario_endereco_coordinates.sql
```

### 2️⃣ Verificar Colunas Criadas

```bash
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('lojistas', 'usuarios', 'enderecos')
AND column_name IN ('latitude', 'longitude')
ORDER BY table_name;"
```

**Resultado esperado:**
```
  table_name  | column_name |      data_type
--------------+-------------+--------------------
 enderecos    | latitude    | double precision
 enderecos    | longitude   | double precision
 lojistas     | latitude    | double precision
 lojistas     | longitude   | double precision
 usuarios     | latitude    | double precision
 usuarios     | longitude   | double precision
```

### 3️⃣ Reiniciar Backend

```bash
cd /root/win
docker-compose restart backend
```

**OU rebuild completo se necessário:**
```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

### 4️⃣ Monitorar Logs

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Buscar por geocodificações
docker-compose logs backend | grep -i "geocodif"

# Ver últimas 50 linhas
docker-compose logs --tail=50 backend
```

**Logs esperados após reiniciar:**
```
backend_1    | Hibernate: create table if not exists usuarios (... latitude float8, longitude float8 ...)
backend_1    | Hibernate: create table if not exists enderecos (... latitude float8, longitude float8 ...)
backend_1    | Hibernate: create table if not exists lojistas (... latitude float8, longitude float8 ...)
```

### 5️⃣ Verificar Estatísticas

```bash
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT 
    'lojistas' as tabela,
    COUNT(*) as total,
    COUNT(latitude) as com_coordenadas
FROM lojistas
UNION ALL
SELECT 'usuarios', COUNT(*), COUNT(latitude) FROM usuarios
UNION ALL
SELECT 'enderecos', COUNT(*), COUNT(latitude) FROM enderecos;"
```

## 🧪 Testar Integração

### Teste 1: Criar Usuário com Endereço

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Teste",
    "email": "joao.teste@example.com",
    "cpf": "123.456.789-00",
    "senha": "Senha123",
    "telefone": "(11) 98765-4321",
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "uf": "SP"
  }'
```

**Após criar, verificar logs:**
```bash
docker-compose logs backend | grep -A 2 "joao.teste"
```

**Deve aparecer:**
```
📍 Usuário geocodificado: lat=-23.561414, lon=-46.656258
```

### Teste 2: Verificar Usuário no Banco

```bash
docker exec postgres-db psql -U postgres -d winmarketplace -c "
SELECT nome, email, latitude, longitude
FROM usuarios
WHERE email = 'joao.teste@example.com';"
```

## 🔧 Troubleshooting

### Problema: Colunas não foram criadas

**Solução:**
```bash
# Executar migrations manualmente
cd /root/win
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_lojista_coordinates.sql
docker exec -i postgres-db psql -U postgres -d winmarketplace < database/add_usuario_endereco_coordinates.sql

# Verificar novamente
docker exec postgres-db psql -U postgres -d winmarketplace -c "\d lojistas" | grep latitude
```

### Problema: Backend não geocodifica

**Verificar logs:**
```bash
docker-compose logs backend | grep -i "error\|exception\|geocod"
```

**Possíveis causas:**
1. GeocodingService não está funcionando
2. API Nominatim bloqueada (rate limit)
3. Coordenadas fornecidas manualmente (não precisa geocodificar)

### Problema: Docker não encontra arquivo SQL

**Solução: Copiar para dentro do container**
```bash
docker cp database/add_lojista_coordinates.sql postgres-db:/tmp/
docker exec postgres-db psql -U postgres -d winmarketplace -f /tmp/add_lojista_coordinates.sql

docker cp database/add_usuario_endereco_coordinates.sql postgres-db:/tmp/
docker exec postgres-db psql -U postgres -d winmarketplace -f /tmp/add_usuario_endereco_coordinates.sql
```

## ✅ Checklist de Validação

- [ ] Migrations SQL executadas sem erros
- [ ] 6 colunas criadas (latitude/longitude em 3 tabelas)
- [ ] Backend reiniciado com sucesso
- [ ] Logs mostram "Hibernate: create table..." ou DDL statements
- [ ] Teste de cadastro de usuário funciona
- [ ] Logs mostram "📍 Usuário geocodificado"
- [ ] Banco de dados tem coordenadas armazenadas

## 🎯 Resultado Final Esperado

Após aplicar todas as mudanças:

1. ✅ **Tabelas atualizadas**: lojistas, usuarios, enderecos com latitude/longitude
2. ✅ **Backend funcional**: Reiniciado sem erros
3. ✅ **Auto-geocodificação**: Logs mostram geocodificações bem-sucedidas
4. ✅ **Performance**: Cálculo de frete 80% mais rápido
5. ✅ **Compatibilidade**: Sistema existente continua funcionando

## 📞 Suporte

Se algo não funcionar:

1. **Verificar logs completos:**
   ```bash
   docker-compose logs backend > /tmp/backend-logs.txt
   cat /tmp/backend-logs.txt
   ```

2. **Verificar conexão com banco:**
   ```bash
   docker exec postgres-db psql -U postgres -d winmarketplace -c "SELECT version();"
   ```

3. **Verificar estrutura completa:**
   ```bash
   docker exec postgres-db psql -U postgres -d winmarketplace -c "\d lojistas"
   docker exec postgres-db psql -U postgres -d winmarketplace -c "\d usuarios"
   docker exec postgres-db psql -U postgres -d winmarketplace -c "\d enderecos"
   ```
