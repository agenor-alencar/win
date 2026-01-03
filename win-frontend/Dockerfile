# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

# Build args para variáveis de ambiente do Vite
ARG VITE_MERCADOPAGO_PUBLIC_KEY
ARG VITE_API_BASE_URL

# Transformar em ENV para que o Vite possa acessar
ENV VITE_MERCADOPAGO_PUBLIC_KEY=$VITE_MERCADOPAGO_PUBLIC_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

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