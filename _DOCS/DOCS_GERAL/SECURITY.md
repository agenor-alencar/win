# 🔒 Política de Segurança

## Versões Suportadas

Atualmente mantemos suporte de segurança para as seguintes versões:

| Versão | Suportada          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🐛 Reportar uma Vulnerabilidade

A segurança do WIN Marketplace é levada a sério. Se você descobriu uma vulnerabilidade de segurança, por favor **NÃO** crie uma issue pública.

### Como Reportar

1. **Email**: Envie um email para agenoralencaar@gmail.com
2. **GitHub Security Advisory**: Use o [recurso de reporte privado](https://github.com/ArthurJsph/win-grupo1/security/advisories/new)

### Informações a Incluir

Para nos ajudar a entender e resolver o problema rapidamente, inclua:

- Tipo de vulnerabilidade (ex: SQL injection, XSS, CSRF, etc.)
- Localização do código afetado (arquivo, linha)
- Configuração necessária para reproduzir
- Passos detalhados para reproduzir a vulnerabilidade
- Proof-of-concept ou código de exploit (se possível)
- Impacto potencial da vulnerabilidade

### O que Esperar

- **Confirmação**: Responderemos em até 48 horas
- **Avaliação**: Avaliaremos a severidade em até 7 dias
- **Correção**: Trabalharemos em uma correção com timeline baseado na severidade
- **Divulgação**: Coordenaremos a divulgação responsável com você

---

## 🔒 Práticas de Segurança Implementadas

### Autenticação e Autorização

- ✅ **JWT Tokens**: Autenticação stateless com tokens JWT
- ✅ **Refresh Tokens**: Tokens de longa duração para renovação
- ✅ **Password Hashing**: BCrypt com salt de 12 rounds
- ✅ **Role-Based Access Control**: Três níveis (USER, LOJISTA, ADMIN)
- ✅ **Session Management**: Controle de sessões ativas

### Proteção de Dados

- ✅ **HTTPS**: TLS 1.3 em produção (recomendado)
- ✅ **Encrypted Storage**: Dados sensíveis criptografados
- ✅ **SQL Injection Prevention**: Prepared statements e JPA
- ✅ **XSS Prevention**: Sanitização de inputs
- ✅ **CSRF Protection**: Tokens anti-falsificação

### Configurações de Segurança

```yaml
# application.yml
spring:
  security:
    # Headers de segurança
    headers:
      frame-options: DENY
      content-type-options: nosniff
      xss-protection: 1; mode=block
    
    # CORS configurado restritivamente
    cors:
      allowed-origins: ${FRONTEND_URL}
      allowed-methods: GET, POST, PUT, DELETE
      allowed-headers: Authorization, Content-Type
      
    # Rate limiting implementado
    rate-limit:
      enabled: true
      requests-per-minute: 60
```

### Dependências

- ✅ **Atualizações Regulares**: Dependências mantidas atualizadas
- ✅ **Vulnerability Scanning**: Scan automático de vulnerabilidades
- ✅ **Dependency Review**: Revisão antes de adicionar novas deps

---

## 🛡️ Melhores Práticas para Desenvolvedores

### 1. Nunca Commitar Credenciais

```bash
# ❌ NUNCA faça isso
git add .env
git commit -m "add config"

# ✅ Use .env.example como template
cp .env.example .env
# Edite .env localmente (já está no .gitignore)
```

### 2. Validar Todos os Inputs

```java
// ✅ BOM - Validação completa
@PostMapping("/produtos")
public ResponseEntity<ProdutoDTO> criar(@Valid @RequestBody ProdutoCreateDTO dto) {
    // @Valid garante validação
    // Bean Validation constraints no DTO
    return ResponseEntity.ok(produtoService.criar(dto));
}

// DTO com validações
public class ProdutoCreateDTO {
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 255)
    private String nome;
    
    @NotNull
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "999999.99")
    private BigDecimal preco;
}
```

### 3. Sanitizar Outputs

```typescript
// ✅ BOM - Escape de HTML
import DOMPurify from 'dompurify';

const produtoNome = DOMPurify.sanitize(produto.nome);

// React escapa automaticamente em JSX
<h1>{produtoNome}</h1> // Seguro

// ❌ CUIDADO com dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} /> // Perigoso!
```

### 4. Usar Queries Parametrizadas

```java
// ✅ BOM - JPA Repository (seguro)
@Query("SELECT p FROM Produto p WHERE p.categoria = :categoria")
List<Produto> findByCategoria(@Param("categoria") String categoria);

// ❌ RUIM - Concatenação de strings (SQL Injection!)
String query = "SELECT * FROM produtos WHERE nome = '" + userInput + "'";
```

### 5. Implementar Rate Limiting

```java
// ✅ Exemplo de rate limiting
@RateLimited(requests = 5, duration = 1, unit = TimeUnit.MINUTES)
@PostMapping("/auth/login")
public ResponseEntity<AuthResponse> login(@RequestBody LoginDTO dto) {
    return ResponseEntity.ok(authService.login(dto));
}
```

### 6. Logs Seguros

```java
// ✅ BOM - Não loga dados sensíveis
log.info("Usuário {} realizou login", usuario.getId());

// ❌ RUIM - Expõe dados sensíveis
log.info("Login: {} - Senha: {}", email, senha); // NUNCA!
log.info("Token: {}", jwtToken); // NUNCA!
```

### 7. Tratamento de Erros

```java
// ✅ BOM - Mensagens genéricas para usuário
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleException(Exception e) {
    log.error("Erro interno", e); // Log completo internamente
    return ResponseEntity
        .status(500)
        .body(new ErrorResponse("Erro interno do servidor")); // Mensagem genérica
}

// ❌ RUIM - Expõe detalhes internos
return ResponseEntity.status(500).body(e.getMessage()); // Pode expor paths, stack traces
```

---

## 🔧 Configuração Segura de Produção

### Variáveis de Ambiente

```env
# ✅ Boas práticas

# Database - Use senhas fortes
POSTGRES_PASSWORD=SuperS3nh@Compl3x@2025!

# JWT - Use secrets longos e aleatórios
JWT_SECRET=aB3$kL9@mN2#pQ6&rT8*vX1!zY4^wC7%eF5+gH0-iJ

# Pagar.me - Use keys diferentes para dev/prod
PAGARME_API_KEY=sk_prod_xxxxxxxxxxxxxxxx  # Produção
PAGARME_API_KEY=sk_test_xxxxxxxxxxxxxxxx  # Desenvolvimento

# URLs - Configure corretamente
FRONTEND_URL=https://winmarketplace.com
BACKEND_URL=https://api.winmarketplace.com

# Email - Use from validado
MAIL_FROM=noreply@winmarketplace.com # Não use gmail@, hotmail@

# ❌ NUNCA use valores padrão em produção
POSTGRES_PASSWORD=postgres123  # PERIGOSO!
JWT_SECRET=secret123           # PERIGOSO!
```

### Docker em Produção

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    # Limitar recursos
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    # Não expor porta diretamente
    # Use um reverse proxy (nginx)
    expose:
      - "8080"
    # Restart automático
    restart: always
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Nginx (Reverse Proxy)

```nginx
# Configuração de segurança
server {
    listen 443 ssl http2;
    server_name api.winmarketplace.com;

    # SSL/TLS
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Headers de segurança
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy
    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🎫 Compliance e Regulamentações

### LGPD (Lei Geral de Proteção de Dados)

O sistema implementa medidas para conformidade com a LGPD:

- ✅ **Consentimento**: Necessário para coleta de dados
- ✅ **Direito ao Esquecimento**: Funcionalidade de deletar conta
- ✅ **Portabilidade**: Exportar dados pessoais
- ✅ **Transparência**: Política de privacidade clara
- ✅ **Segurança**: Criptografia e controle de acesso

### PCI DSS (Dados de Cartão)

**IMPORTANTE**: Não armazenamos dados de cartão diretamente.

- ✅ Integração com Pagar.me (PCI Compliant)
- ✅ Tokens ao invés de dados de cartão
- ✅ HTTPS obrigatório para pagamentos
- ✅ Logs não contêm dados sensíveis

---

## 📚 Recursos Adicionais

### Documentação

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [LGPD - Guia Oficial](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

### Ferramentas

- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnerabilidades
- [Snyk](https://snyk.io/) - Scan de dependências
- [SonarQube](https://www.sonarqube.org/) - Análise de código

### Contato

- 🔒 Security Email: agenoralencaar@gmail.com
- 🐛 Bug Bounty: Em breve
- 📖 Documentação: [docs/SECURITY.md](docs/SECURITY.md)

---

## 📝 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2025-03 | Release inicial com práticas de segurança |

---

**Segurança é um processo contínuo.** Agradecemos sua colaboração em manter o WIN Marketplace seguro para todos.

🛡️ **Reporte vulnerabilidades de forma responsável** 🛡️
