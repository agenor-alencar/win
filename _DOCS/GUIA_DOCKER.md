# 🐳 Guia para Rodar WIN Marketplace com Docker

**Data**: 18 de outubro de 2025  
**Status**: Configuração completa

---

## 🎯 Pré-requisitos

1. **Docker Desktop** instalado e **RODANDO**
   - ⚠️ Verifique se o ícone do Docker Desktop está ativo na barra de tarefas
   - Se não estiver rodando, abra o Docker Desktop e aguarde inicializar

---

## 🚀 Como Iniciar o Sistema

### **Opção 1: Iniciar Tudo de Uma Vez** (Recomendado)

```powershell
# Na raiz do projeto (win-grupo1)
docker-compose up -d
```

**Isso vai iniciar**:
- ✅ PostgreSQL (porta 5432)
- ✅ Backend Spring Boot (porta 8080)
- ✅ Frontend React (porta 3000)

---

### **Opção 2: Iniciar Serviços Individualmente**

```powershell
# Apenas o banco de dados
docker-compose up -d postgres

# Apenas o backend (precisa do postgres rodando)
docker-compose up -d backend

# Apenas o frontend
docker-compose up -d frontend
```

---

## 📋 Comandos Úteis

### **Verificar status dos containers**
```powershell
docker ps
```

### **Ver logs de um serviço**
```powershell
# Logs do backend
docker-compose logs -f backend

# Logs do frontend
docker-compose logs -f frontend

# Logs do banco
docker-compose logs -f postgres
```

### **Parar todos os serviços**
```powershell
docker-compose down
```

### **Parar e REMOVER dados do banco**
```powershell
docker-compose down -v
```

### **Reconstruir imagens (após mudanças no código)**
```powershell
docker-compose up -d --build
```

---

## 🔍 Verificar se está Funcionando

### **1. PostgreSQL**
```powershell
# Deve retornar: CONTAINER_ID  win-marketplace-db  Up X seconds
docker ps --filter "name=win-marketplace-db"
```

### **2. Backend**
```powershell
# Deve retornar status do Spring Boot
Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing
```

**Ou acesse**: http://localhost:8080/actuator/health  
**Esperado**: `{"status":"UP"}`

### **3. Frontend**
**Acesse**: http://localhost:3000  
**Esperado**: Página inicial do WIN Marketplace

---

## ⚠️ Problemas Comuns

### **Erro: "Cannot connect to Docker daemon"**
**Causa**: Docker Desktop não está rodando  
**Solução**: Abra o Docker Desktop e aguarde inicializar

---

### **Erro: "Port already in use"**
**Causa**: Algum serviço já está usando a porta  

**Solução para porta 3000** (Frontend):
```powershell
# Encontrar processo
netstat -ano | Select-String ":3000"

# Matar processo (substitua XXXX pelo PID)
Stop-Process -Id XXXX -Force
```

**Solução para porta 8080** (Backend):
```powershell
# Encontrar processo
netstat -ano | Select-String ":8080"

# Matar processo
Stop-Process -Id XXXX -Force
```

**Solução para porta 5432** (PostgreSQL):
```powershell
# Encontrar processo
netstat -ano | Select-String ":5432"

# Matar processo
Stop-Process -Id XXXX -Force
```

---

### **Erro: "Backend não conecta no banco"**
**Causa**: PostgreSQL não iniciou completamente  

**Solução**:
```powershell
# 1. Parar tudo
docker-compose down

# 2. Iniciar só o banco e aguardar
docker-compose up -d postgres

# 3. Aguardar ~10 segundos, depois iniciar backend
docker-compose up -d backend

# 4. Iniciar frontend
docker-compose up -d frontend
```

---

### **Erro: "Frontend não conecta no backend"**
**Causa**: Variável de ambiente `VITE_API_URL` incorreta  

**Verificar** em `docker-compose.yml`:
```yaml
frontend:
  environment:
    VITE_API_URL: http://localhost:8080  # ✅ Correto
```

---

## 🔄 Fluxo de Desenvolvimento

### **Desenvolvimento com Hot Reload**

Para **frontend**, use volumes (já configurado):
```yaml
frontend:
  volumes:
    - ./win-frontend:/app
    - /app/node_modules
```

**Mudanças em `.tsx` ou `.ts`**: Atualizam automaticamente! ✨

---

Para **backend**, reconstrua a imagem:
```powershell
# Após mudanças no código Java
docker-compose up -d --build backend
```

---

### **Desenvolvimento Local (sem Docker)**

Se preferir rodar localmente durante desenvolvimento:

**1. Apenas PostgreSQL no Docker**:
```powershell
docker-compose up -d postgres
```

**2. Backend local**:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**3. Frontend local**:
```powershell
cd win-frontend
npm run dev
```

---

## 📊 Arquitetura dos Containers

```
┌─────────────────────────────────────────┐
│          win-network (bridge)           │
│                                         │
│  ┌──────────────┐  ┌─────────────┐    │
│  │  PostgreSQL  │  │   Backend   │    │
│  │   (5432)     │◄─┤   (8080)    │    │
│  └──────────────┘  └─────────────┘    │
│                           ▲             │
│                           │             │
│                    ┌──────┴──────┐     │
│                    │  Frontend   │     │
│                    │   (3000)    │     │
│                    └─────────────┘     │
└─────────────────────────────────────────┘
```

---

## 🧪 Testar Tudo Funcionando

### **1. Verificar containers rodando**
```powershell
docker ps
```

**Esperado**: 3 containers (postgres, backend, frontend) com status "Up"

---

### **2. Testar API do backend**
```powershell
# Criar usuário
$body = '{"nome":"Teste","sobrenome":"Docker","email":"teste.docker@test.com","cpf":"11122233344","senha":"Senha123"}'
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Esperado**: Dados do usuário criado

---

### **3. Testar frontend**
1. Acesse: http://localhost:3000
2. Clique em "Login"
3. Teste login com usuário criado

---

## 📝 Configurações Importantes

### **Backend** (`docker-compose.yml`)
```yaml
backend:
  environment:
    SPRING_PROFILES_ACTIVE: docker
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/win_marketplace
    SPRING_DATASOURCE_USERNAME: postgres
    SPRING_DATASOURCE_PASSWORD: postgres123
    SPRING_JPA_HIBERNATE_DDL_AUTO: update
```

**Nota**: Usa profile `docker` que lê `application-docker.yml`

---

### **Frontend** (`docker-compose.yml`)
```yaml
frontend:
  environment:
    VITE_API_URL: http://localhost:8080
    NODE_ENV: development
```

---

### **PostgreSQL** (`docker-compose.yml`)
```yaml
postgres:
  environment:
    POSTGRES_DB: win_marketplace
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres123
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
```

**Nota**: `init.sql` roda automaticamente na primeira inicialização

---

## 🎯 Próximos Passos

Depois que tudo estiver rodando:

1. ✅ Criar conta de usuário em http://localhost:3000
2. ✅ Fazer login
3. ✅ Clicar em "Venda no WIN"
4. ✅ Preencher formulário de lojista
5. ✅ Testar fluxo completo USER → LOJISTA

---

## 🆘 Suporte

Se algo não funcionar:

1. **Verifique logs**:
   ```powershell
   docker-compose logs -f backend
   ```

2. **Reinicie serviços**:
   ```powershell
   docker-compose restart
   ```

3. **Reconstrua tudo** (último recurso):
   ```powershell
   docker-compose down -v
   docker-compose up -d --build
   ```

---

**Criado por**: GitHub Copilot  
**Data**: 18 de outubro de 2025
