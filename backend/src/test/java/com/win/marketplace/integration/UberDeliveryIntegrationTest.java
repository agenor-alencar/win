package com.win.marketplace.integration;

import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.repository.EntregaRepository;
import com.win.marketplace.service.*;
import com.win.marketplace.service.fixtures.EntregaTestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes de integração para o fluxo E2E de entregas via Uber
 * 
 * Simula o fluxo completo:
 * 1. Criar entrega
 * 2. Motorista aceita (webhook: courier_assigned)
 * 3. Motorista coleta (webhook: pickup_completed)
 * 4. Motorista entrega (webhook: delivery_completed)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Fluxo E2E de Entregas")
class UberDeliveryIntegrationTest {

    @Mock private EntregaRepository entregaRepository;
    @Mock private PedidoStatusService pedidoStatusService;
    @Mock private WebSocketNotificationService webSocketService;

    @InjectMocks private UberWebhookService webhookService;

    private String deliveryId;
    private Entrega entrega;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
        deliveryId = "delivery-e2e-001";
        entrega = EntregaTestFixtures.criarEntregaAguardandoMotorista();
        entrega.setIdCorridaUber(deliveryId);
        
        pedido = EntregaTestFixtures.criarPedido();
        entrega.setPedido(pedido);
    }

    @Test
    @DisplayName("Deve completar fluxo E2E: Criar → Motorista → Coleta → Entrega")
    void deveCompletarFluxoE2E() {
        // ========== PASSO 1: Criar Entrega ==========
        // Given: Uma entrega aguardando motorista
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.AGUARDANDO_PREPARACAO);

        // ========== PASSO 2: Motorista Atribuído ==========
        // Given: Webhook de motorista atribuído
        UberWebhookEventDTO webhookMotorista = 
            EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId);
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        // When: Processar webhook
        webhookService.processarWebhook(webhookMotorista, null);

        // Then: Entrega aguardando motorista, com dados do motorista preenchidos
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.AGUARDANDO_MOTORISTA);
        assertThat(entrega.getNomeMotorista()).isNotNull();
        verify(entregaRepository).save(entrega);

        // ========== PASSO 3: Coleta Completa ==========
        // Given: Webhook de coleta completa
        UberWebhookEventDTO webhookColeta = 
            EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));

        // When: Processar webhook
        webhookService.processarWebhook(webhookColeta, null);

        // Then: Entrega em transito
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.EM_TRANSITO);
        assertThat(entrega.getDataHoraRetirada()).isNotNull();
        assertThat(entrega.getLatitudeMotorista()).isNotNull();
        assertThat(entrega.getLongitudeMotorista()).isNotNull();
        
        verify(pedidoStatusService).transicionarStatus(pedido.getId(), Pedido.StatusPedido.EM_TRANSITO);
        verify(webSocketService).notificarMudancaStatus(
            eq(deliveryId),
            eq("COLETA_COMPLETA"),
            anyMap()
        );

        // ========== PASSO 4: Entrega Completa ==========
        // Given: Webhook de entrega concluída
        UberWebhookEventDTO webhookEntrega = 
            EntregaTestFixtures.criarWebhookDeliveryCompleted(deliveryId);
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));

        // When: Processar webhook
        webhookService.processarWebhook(webhookEntrega, null);

        // Then: Entrega concluída
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.ENTREGUE);
        assertThat(entrega.getDataHoraEntrega()).isNotNull();
        
        verify(pedidoStatusService).transicionarStatus(pedido.getId(), Pedido.StatusPedido.ENTREGUE);
        verify(webSocketService).notificarMudancaStatus(
            eq(deliveryId),
            eq("ENTREGUE_COM_SUCESSO"),
            anyMap()
        );
    }

    @Test
    @DisplayName("Deve atualizar localização do motorista durante transito")
    void deveAtualizarLocalizacaoDuranteTransito() {
        // Given: Entrega em transito
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        Double latitudeInicial = -23.5500d;
        Double longitudeInicial = -46.6330d;
        entrega.setLatitudeMotorista(latitudeInicial);
        entrega.setLongitudeMotorista(longitudeInicial);

        // When: Receber webhook com localização atualizada
        UberWebhookEventDTO webhookPosicao = 
            EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        webhookService.processarWebhook(webhookPosicao, null);

        // Then: Localização atualizada
        assertThat(entrega.getLatitudeMotorista()).isEqualTo(-23.5505d);
        assertThat(entrega.getLongitudeMotorista()).isEqualTo(-46.6333d);
    }

    @Test
    @DisplayName("Deve reverter status para CANCELADA quando motorista cancela")
    void deveRevertStatusParaCanceladoOnMotoristaCancel() {
        // Given: Entrega em transito
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);

        // When: Webhook de cancelamento
        UberWebhookEventDTO webhookCancelamento = 
            EntregaTestFixtures.criarWebhookDeliveryCancelled(deliveryId);
        
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        webhookService.processarWebhook(webhookCancelamento, null);

        // Then: Status cancelado e pedido cancelado
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.CANCELADA);
        
        verify(pedidoStatusService).transicionarStatus(pedido.getId(), Pedido.StatusPedido.CANCELADO);
        verify(webSocketService).notificarAlerta(
            eq(deliveryId),
            eq("ENTREGA_CANCELADA"),
            contains("Motivo"),
            eq("ERROR")
        );
    }

    @Test
    @DisplayName("Deve notificar cliente em cada mudança de status")
    void deveNotificarClienteEmCadaMudancaDEStatus() {
        // Given
        UberWebhookEventDTO webhookMotorista = 
            EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId);
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        // When
        webhookService.processarWebhook(webhookMotorista, null);

        // Then: Verificar notificações
        verify(webSocketService).notificarAcaoPendente(
            eq(deliveryId),
            eq("MOTORISTA_ATRIBUIDO"),
            any()
        );
    }

    @Test
    @DisplayName("Deve manter integridade de dados ao processar múltiplos webhooks")
    void deveMantarIntegridadeDadosAoProcessarMultiplosWebhooks() {
        // Given: Simular múltiplos webhooks em sequência
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        UberWebhookEventDTO webhook1 = EntregaTestFixtures.criarWebhookMotoristaAtribuido(deliveryId);
        UberWebhookEventDTO webhook2 = EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        UberWebhookEventDTO webhook3 = EntregaTestFixtures.criarWebhookDeliveryCompleted(deliveryId);

        // When: Processar webhooks em sequência
        webhookService.processarWebhook(webhook1, null);
        webhookService.processarWebhook(webhook2, null);
        webhookService.processarWebhook(webhook3, null);

        // Then: Deve ter processado todos sem erros
        assertThat(entrega.getStatusEntrega()).isEqualTo(StatusEntrega.ENTREGUE);
        assertThat(entrega.getNomeMotorista()).isNotNull();
        assertThat(entrega.getDataHoraEntrega()).isNotNull();
        
        // Verificar que save foi chamado múltiplas vezes
        verify(entregaRepository, atLeast(3)).save(any());
    }

    @Test
    @DisplayName("Deve respeitar timestamps de cada evento")
    void deveReseitarTimestampsEmCadaEvento() {
        // Given: Entrega com webhook
        UberWebhookEventDTO webhookColeta = EntregaTestFixtures.criarWebhookPickupCompleted(deliveryId);
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));
        when(entregaRepository.save(any())).thenReturn(entrega);

        // When
        webhookService.processarWebhook(webhookColeta, null);

        // Then: Verificar que data hora foi atualizada
        assertThat(entrega.getDataHoraRetirada()).isNotNull();
        // Validar que o timestamp está próximo ao que foi processado
        assertThat(entrega.getDataHoraRetirada().getYear()).isGreaterThanOrEqualTo(2026);
    }
}
