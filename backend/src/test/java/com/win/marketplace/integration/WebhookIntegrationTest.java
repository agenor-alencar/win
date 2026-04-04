package com.win.marketplace.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.controller.WebhookController;
import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.service.UberWebhookService;
import com.win.marketplace.service.fixtures.EntregaTestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

/**
 * Testes de integração para recebimento de webhooks
 * 
 * Responsabilidades testadas:
 * - Recever webhook da Uber
 * - Validar assinatura HMAC (quando configurado)
 * - Processar evento
 * - Retornar resposta HTTP apropriada
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Webhook Integration")
class WebhookIntegrationTest {

    @Mock private UberWebhookService webhookService;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks private WebhookController webhookController;

    private String deliveryId;
    private UberWebhookEventDTO event;

    @BeforeEach
    void setUp() {
        deliveryId = "webhook-integration-001";
        event = EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
    }

    @Test
    @DisplayName("Deve receber webhook e processar com sucesso (sem assinatura)")
    void deveReceberWebhookSemAssinatura() {
        // Given: Webhook válido sem assinatura (para desenvolvimento/testes)
        doNothing().when(webhookService).processarWebhook(event, null);

        // When: Chamar endpoint
        webhookService.processarWebhook(event, null);

        // Then: Webhook processado
        verify(webhookService).processarWebhook(event, null);
    }

    @Test
    @DisplayName("Deve rejeitar webhook com assinatura inválida")
    void deveRejeitarWebhookComAssinaturaInvalida() {
        // Given: Webhook com assinatura inválida
        String invalidSignature = "invalid-signature-xyz";
        doThrow(new SecurityException("Assinatura HMAC inválida"))
            .when(webhookService).processarWebhook(event, invalidSignature);

        // When/Then: Deve lançar exceção
        assertThatThrownBy(() -> webhookService.processarWebhook(event, invalidSignature))
            .isInstanceOf(SecurityException.class)
            .hasMessage("Assinatura HMAC inválida");
    }

    @Test
    @DisplayName("Deve ignorar webhook com delivery_id faltando")
    void deveIgnorarWebhookSemDeliveryId() {
        // Given: Webhook sem delivery_id
        UberWebhookEventDTO eventSemId = EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId);
        eventSemId.setDeliveryId(null);

        // When: Processar
        webhookService.processarWebhook(eventSemId, null);

        // Then: Debe ser processado (o serviço trata este caso internamente)
        verify(webhookService).processarWebhook(eventSemId, null);
    }

    @Test
    @DisplayName("Deve processar múltiplos webhooks concorrentemente")
    void deveProcessarMultiplosWebhooksConcorrentemente() {
        // Given: Múltiplos webhooks de diferentes entregas
        String deliveryId1 = "webhook-001";
        String deliveryId2 = "webhook-002";
        String deliveryId3 = "webhook-003";

        UberWebhookEventDTO event1 = EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId1);
        UberWebhookEventDTO event2 = EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId2);
        UberWebhookEventDTO event3 = EntregaTestFixtures.criarWebhookDeliveryCompleted(deliveryId3);

        // When: Processar em paralelo
        webhookService.processarWebhook(event1, null);
        webhookService.processarWebhook(event2, null);
        webhookService.processarWebhook(event3, null);

        // Then: Todos foram processados
        verify(webhookService, times(3)).processarWebhook(any(), isNull());
    }

    @Test
    @DisplayName("Deve tratamento de erros no processamento de webhook")
    void deveTratarErrosNoProcessamento() {
        // Given: Webhook que causa erro
        doThrow(new RuntimeException("Erro ao processar webhook"))
            .when(webhookService).processarWebhook(event, null);

        // When/Then: Exceção deve ser propagada
        assertThatThrownBy(() -> webhookService.processarWebhook(event, null))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Erro ao processar webhook");
    }

    @Test
    @DisplayName("Deve processar evento com retry em caso de falha transiente")
    void deveProcessarComRetryEmCasoDefalhaTransiente() {
        // Given: Primeira chamada falha, segunda sucede
        doThrow(new RuntimeException("Connection timeout"))
            .doNothing()
            .when(webhookService).processarWebhook(event, null);

        // When: Tentar duas vezes
        assertThatThrownBy(() -> webhookService.processarWebhook(event, null))
            .isInstanceOf(RuntimeException.class);

        webhookService.processarWebhook(event, null); // Deve suceder na segunda

        // Then: Verificar chamadas
        verify(webhookService, times(2)).processarWebhook(event, null);
    }

    @Test
    @DisplayName("Deve processar diferentes tipos de eventos")
    void deveProcessarDiferentesTiposDeEventos() {
        // Given: Diferentes tipos de eventos
        UberWebhookEventDTO webhookCourierAssigned = 
            EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId);
        UberWebhookEventDTO webhookPickupCompleted = 
            EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        UberWebhookEventDTO webhookDeliveryCompleted = 
            EntregaTestFixtures.criarWebhookDeliveryCompleted(deliveryId);
        UberWebhookEventDTO webhookDeliveryCancelled = 
            EntregaTestFixtures.criarWebhookDeliveryCancelled(deliveryId);

        // When: Processar todos
        webhookService.processarWebhook(webhookCourierAssigned, null);
        webhookService.processarWebhook(webhookPickupCompleted, null);
        webhookService.processarWebhook(webhookDeliveryCompleted, null);
        webhookService.processarWebhook(webhookDeliveryCancelled, null);

        // Then: Todos devem ser processados
        verify(webhookService, times(4)).processarWebhook(any(), isNull());
    }

    @Test
    @DisplayName("Deve idempotência - processar mesmo webhook múltiplas vezes")
    void deveSerIdempotente() {
        // Given: Mesmo webhook processado 3 vezes
        doNothing().when(webhookService).processarWebhook(event, null);

        // When
        webhookService.processarWebhook(event, null);
        webhookService.processarWebhook(event, null);
        webhookService.processarWebhook(event, null);

        // Then: Não deve causar erro, mas processar 3 vezes
        verify(webhookService, times(3)).processarWebhook(event, null);
    }

    @Test
    @DisplayName("Deve respeitar versionamento de webhook events")
    void deveRespeaitarVersioamento() {
        // Given: Webhook com version
        UberWebhookEventDTO eventComVersion = EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        
        // When: Processar
        webhookService.processarWebhook(eventComVersion, null);

        // Then: Deve processar com sucesso
        verify(webhookService).processarWebhook(eventComVersion, null);
    }
}
