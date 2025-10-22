# ===================================
# STAGE 1: BUILD
# ===================================
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# Copiar pom.xml e baixar dependências (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar aplicação (pular testes completamente)
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# ===================================
# STAGE 2: RUNTIME
# ===================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Instalar dependências para healthcheck
RUN apk add --no-cache wget curl tzdata

# Configurar timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Criar usuário não-root para segurança
RUN addgroup -S spring && adduser -S spring -G spring

# Copiar JAR do stage de build
COPY --from=build /app/target/*.jar app.jar

# Mudar ownership do arquivo
RUN chown spring:spring app.jar

# Usar usuário não-root
USER spring:spring

# Expor porta da aplicação
EXPOSE 8080

# Variáveis de ambiente (podem ser sobrescritas no docker-compose)
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
ENV SPRING_PROFILES_ACTIVE=docker

# Healthcheck para verificar se aplicação está rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Executar aplicação
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]