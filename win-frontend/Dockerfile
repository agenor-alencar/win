# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar apenas arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server

# Instalar apenas dependências de produção
RUN npm install --production --force

EXPOSE 3000

CMD ["npm", "run", "start"]