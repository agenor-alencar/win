# Scripts para executar serviços individualmente

## Windows PowerShell

### Iniciar serviços individuais
```powershell
# Apenas banco de dados
docker-compose up -d postgres

# Apenas backend
docker-compose up -d backend

# Apenas frontend
docker-compose up -d frontend

# Backend + Banco
docker-compose up -d postgres backend

# Tudo
docker-compose up -d
```

### Parar serviços individuais
```powershell
docker-compose stop postgres
docker-compose stop backend
docker-compose stop frontend
```

### Ver logs
```powershell
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Banco
docker-compose logs -f postgres
```

### Status dos serviços
```powershell
docker-compose ps
```

### Reiniciar serviços
```powershell
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```
