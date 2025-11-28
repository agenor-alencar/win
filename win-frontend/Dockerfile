# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Listar arquivos gerados para debug
RUN ls -la dist/ && ls -la dist/server/ || echo "No server dir"

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar TODOS os arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar apenas dependências de produção necessárias
RUN npm install express cors --force

EXPOSE 3000

# Servir arquivos estáticos com Express simples
CMD ["node", "-e", "const express = require('express'); const path = require('path'); const app = express(); app.use(express.static('dist/spa')); app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/spa/index.html'))); app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));"]