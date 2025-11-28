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

# Copiar arquivos buildados e servidor
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-prod.js ./

# Instalar apenas Express
RUN npm install express --production

EXPOSE 3000

CMD ["node", "server-prod.js"]