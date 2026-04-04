# PLANO DE COMPLETUDE - FLUXO DE ENTREGAS UBER
**Data**: 04 de abril de 2026  
**Status**: 🔄 EM EXECUÇÃO  
**Objetivo**: Finalizar testes do fluxo de entregas e validar integridade do sistema

---

## 📊 ESTADO ATUAL DO PROJETO

### Backend (Java + Spring Boot 3.5.6 + JDK 21)
- ✅ **Modelos**: Entrega, Pedido com enum StatusEntrega
- ✅ **Controllers**: UberDeliveryController, UberWebhookController, WebhookController
- ✅ **Services**: 
  - UberWebhookService (handlers para pickup_completed, delivery_completed, etc)
  - UberDeliveryService (criação e gerenciamento)
  - UberQuoteService (cotação de frete)
  - GeocodingService (geocodificação)
  - WebSocketNotificationService (notificações em tempo real)
- ✅ **Repositórios**: EntregaRepository com queries customizadas
- ✅ **DTOs**: UberWebhookEventDTO (tipado), UberDeliveryRequestDTO, UberDeliveryResponseDTO
- ✅ **Validação**: HMAC-SHA256 para webhooks
- ✅ **Migrations**: Banco criado com Flyway

### Frontend (React + TypeScript)
- ✅ **Componentes**: FreteCalculador, ConfirmarEntrega, RastreamentoEntrega
- ✅ **Hooks**: useUberDelivery com funções auxiliares
- ✅ **WebSocket**: Integração pronta para notificações

### Testes (❌ FALTOSOS)
- ❌ UberDeliveryControllerTest.java
- ❌ UberWebhookServiceTest.java
- ❌ UberQuoteServiceTest.java
- ❌ UberDeliveryIntegrationTest.java

---

## 🎯 OBJETIVOS DE COMPLETUDE

### Objetivo 1: Testes Unitários ✅
Implementar testes para cada serviço com cobertura ≥ 80%:
- **UberWebhookServiceTest**: Validar processamento de eventos
- **UberDeliveryServiceTest**: Criar entrega, consultar status
- **UberQuoteServiceTest**: Cotação de frete

### Objetivo 2: Testes de Integração ✅
Validar fluxo E2E sem servidores externos:
- **UberDeliveryIntegrationTest**: Fluxo completo de entrega
- **WebhookIntegrationTest**: Recebimento e processamento de webhooks

### Objetivo 3: Validações Adicionais ✅
Garantir tratamento robusto de erros:
- Validação de CEP válido
- Verificação de distância máxima
- Tratamento de fora da área de cobertura
- Timeout para requisições API

### Objetivo 4: Documentação ✅
Gerar relatório de validação com:
- Casos de teste implementados
- Cobertura de código
- Limitações conhecidas

---

## 📋 PLANO DE EXECUÇÃO

### FASE 1: Preparação do Ambiente ⏳

**Tarefas**:
1. Stash de alterações locais
2. Verificar build atual (deve compilar sem erros)
3. Verificar testes atuais (baseline)
4. Criar branch para desenvolvimento

### FASE 2: Testes Unitários (Média-Baixa Complexidade) 🧪

**2.1 - UberWebhookServiceTest**
- Validar processamento de evento `pickup_completed`
- Validar processamento de evento `delivery_completed`
- Validar processamento de evento `delivery_cancelled`
- Validar atualização de localização do motorista
- Validar notificações WebSocket
- Validar transição de status do pedido

**2.2 - UberDeliveryServiceTest**
- Criar entrega com dados válidos
- Consultar status de entrega
- Gerar PIN codes aleatórios
- Validar geração de tracking URL
- Validar relacionamento com Pedido

**2.3 - UberQuoteServiceTest**
- Solicitar cotação com dados válidos
- Validar cálculo de taxa
- Validar tratamento de erro (sem quote_id)

### FASE 3: Testes de Integração (Média Complexidade) 🔗

**3.1 - UberDeliveryIntegrationTest**
Fluxo E2E simulado:
1. Criar pedido
2. Geocodificar endereço cliente
3. Geocodificar endereço lojista
4. Solicitar cotação
5. Criar entrega
6. Simular webhook de coleta
7. Simular webhook de entrega
8. Validar status final

**3.2 - WebhookIntegrationTest**
Recebimento e processamento:
1. Receber webhook não validado (dev)
2. Receber webhook com assinatura válida
3. Receber webhook com assinatura inválida
4. Processar sequência de eventos

### FASE 4: Validações Adicionais (Baixa Complexidade) 🛡️

**4.1 - Validação de CEP**
- Implementar validação de formato CEP (XXXXX-XXX)
- Testar com CEP válido e inválido

**4.2 - Validação de Distância**
- Implementar limite máximo de 20km
- Testar com distância dentro/fora do limite

**4.3 - Tratamento de Erros**
- Tentar entrega fora da área de cobertura
- Timeout em requisições API da Uber
- Tratamento de dados inválidos

### FASE 5: Validação e Documentação 📄

**5.1 - Executar todos os testes**
```bash
mvn clean test
```

**5.2 - Gerar relatório de cobertura**
```bash
mvn clean verify jacoco:report
```

**5.3 - Documentar resultados**
- Casos de teste: X cobertura
- Limitações: Y
- Recomendações: Z

---

## 🔧 IMPLEMENTAÇÃO

### Dependências Maven Necessárias

```xml
<!-- JUnit 5 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Mockito -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>

<!-- JaCoCo (Cobertura) -->
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>org.jacoco.core</artifactId>
    <scope>test</scope>
</dependency>

<!-- AssertJ (Assertions fluentes) -->
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <scope>test</scope>
</dependency>

<!-- RestAssured (Testes de API) -->
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <scope>test</scope>
</dependency>
```

### Estrutura de Testes

```
backend/src/test/java/com/win/marketplace/
├── controller/
│   └── UberDeliveryControllerTest.java
├── service/
│   ├── UberWebhookServiceTest.java
│   ├── UberDeliveryServiceTest.java
│   └── UberQuoteServiceTest.java
├── integration/
│   ├── UberDeliveryIntegrationTest.java
│   ├── WebhookIntegrationTest.java
│   └── PinValidacaoIntegrationTest.java
└── fixtures/
    ├── UberEventFixtures.java
    ├── EntregaFixtures.java
    └── PedidoFixtures.java
```

---

## ✅ CRITÉRIO DE SUCESSO

- [x] Todos os testes compilam sem erros
- [ ] Cobertura de testes ≥ 80%
- [ ] 100% de testes passando
- [ ] Fluxo E2E validado
- [ ] Zero erros de integridade
- [ ] Documentação completa

---

## 🚨 RISCOS E MITIGAÇÃO

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Testes falharem por dependências mock incompletas | Média | Usar @MockBean e @ExtendWith(MockitoExtension.class) |
| Banco de dados em testes (conflitus) | Média | Usar H2 em memória para testes |
| Integração WebSocket falhar em testes | Baixa | Usar mock para WebSocketNotificationService |
| Assinatura HMAC falhar em testes | Baixa | Usar factory para gerar assinaturas válidas |

---

## 📅 CRONOGRAMA

| Fase | Tarefa | Estimado | Status |
|------|--------|----------|--------|
| 1 | Preparação | 15 min | ⏳ |
| 2 | Testes Unitários | 2-3 horas | ⏳ |
| 3 | Testes Integração | 1-2 horas | ⏳ |
| 4 | Validações | 30 min | ⏳ |
| 5 | Documentação | 30 min | ⏳ |
| **Total** | | **4-6 horas** | |

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Revisar este plano
2. ⏳ Confirmar execução
3. ⏳ Implementar Fase 1
4. ⏳ Implementar Fase 2
5. ⏳ Implementar Fase 3
6. ⏳ Executar Fase 4
7. ⏳ Gerar Fase 5
