# 📦 Dependências Maven Necessárias - POM.XML

Adicione as seguintes dependências ao seu `backend/pom.xml` se ainda não estiverem lá:

## 🧪 Dependências para Teste (Test Scope)

```xml
<!-- Dentro de <dependencies> -->

<!-- JUnit 5 + Spring Boot Test -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
    <exclusions>
        <exclusion>
            <groupId>org.junit.vintage</groupId>
            <artifactId>junit-vintage-engine</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Spring Security Test (para @WithMockUser, jwt(), etc) -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- H2 Database (In-memory para testes) -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>

<!-- AssertJ (melhor que Junit assertions) -->
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <scope>test</scope>
</dependency>

<!-- Mockito (para mocks) -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <scope>test</scope>
</dependency>

<!-- JaCoCo (Code coverage) -->
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <scope>test</scope>
</dependency>
```

## 🔨 Plugins Maven (Add to <build><plugins>)

```xml
<!-- Dentro de <build><plugins> -->

<!-- Flyway Maven Plugin -->
<plugin>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-maven-plugin</artifactId>
    <version>9.22.3</version>
    <configuration>
        <locations>classpath:db/migration</locations>
        <baselineOnMigrate>true</baselineOnMigrate>
    </configuration>
</plugin>

<!-- Maven Surefire (Test runner) -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
            <include>**/*IntegrationTest.java</include>
        </includes>
    </configuration>
</plugin>

<!-- JaCoCo Maven Plugin (Code Coverage) -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>

<!-- Spring Boot Maven Plugin -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>3.5.6</version>
</plugin>
```

## ✅ Verificar no POM.XML (Seção Properties)

```xml
<properties>
    <java.version>21</java.version>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <spring-cloud.version>2023.0.0</spring-cloud.version>
    <flyway.version>9.22.3</flyway.version>
    <jacoco.version>0.8.10</jacoco.version>
</properties>
```

## 📂 Estrutura de Diretórios Necessária

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/win/marketplace/
│   │   │       ├── service/
│   │   │       │   ├── PinEncryptionService.java
│   │   │       │   ├── PinValidacaoService.java
│   │   │       │   └── WebSocketNotificationService.java
│   │   │       ├── controller/
│   │   │       │   └── PinValidacaoController.java
│   │   │       ├── repository/
│   │   │       │   └── PinValidacaoRepository.java
│   │   │       ├── model/
│   │   │       │   ├── PinValidacao.java
│   │   │       │   └── enums/TipoPinValidacao.java
│   │   │       └── dto/
│   │   │           ├── request/ValidarPinRequestDTO.java
│   │   │           └── response/ValidarPinResponseDTO.java
│   │   └── resources/
│   │       ├── db/migration/
│   │       │   └── V6__create_pin_validacoes_table.sql
│   │       └── application.yml
│   └── test/
│       ├── java/
│       │   └── com/win/marketplace/
│       │       └── integration/
│       │           └── PinValidacaoIntegrationTest.java
│       └── resources/
│           └── application-test.yml
└── pom.xml
```

## 🔗 Dependências Relacionadas (Já deve ter)

```xml
<!-- PostgreSQL Driver (Production) -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Boot Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Boot Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Boot WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

## ⚠️ Conflitos Comuns & Soluções

### Conflito: JUnit 4 vs JUnit 5

```xml
<!-- REMOVER (JUnit 4) -->
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
</dependency>

<!-- USAR (JUnit 5) -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

### Conflito: Version Mismatch

```powershell
# Se tiver error de version conflict:
mvn dependency:tree | grep -E "conflict|evict"

# Resolver:
mvn clean install -U  # -U = forçar update
```

## 🧹 Limpar Artefatos Antigos

```powershell
# Se tiver problemas com dependências antigas:
cd backend
mvn clean
rm -Recurse .m2/repository  # Limpar cache local

# Redownload
mvn clean test
```

## ✅ Verificar Instalação

```powershell
# Ver todas as dependências
mvn dependency:tree

# Ver plugins
mvn help:describe -Dplugin=org.apache.maven.plugins:maven-surefire-plugin

# Ver informações do POM
mvn help:effective-pom
```

---

**Status:** ✅ Todas as dependências configuradas  
**Atualizado:** 2026-03-24
