package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.repository.EntregaRepository;
import com.win.marketplace.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Service otimizado para processar webhooks da Uber Direct API.
 * 
 * <p>Responsabilidades:</p>
 * <ul>
 *   <li>Validar assinatura HMAC-SHA256 dos webhooks</li>
 *   <li>Processar eventos de mudança de status</li>
 *   <li>Atualizar entrega e pedido no banco de dados</li>
 *   <li>Notificar cliente (futuro: WebSocket/Email)</li>
 * </ul>
 * 
 * @since 2026-02-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UberWebhookService {

    private final EntregaRepository entregaRepository;
    private final PedidoRepository pedidoRepository;
    private final ObjectMapper objectMapper;

    @Value("${uber.webhook.secret:}")
    private String webhookSecret;

    /**
     * Processa webhook recebido da Uber (versão otimizada com DTO tipado).
     * 
     * @param event DTO com dados do evento (estrutura tipada)
     * @param signature Assinatura HMAC-SHA256 do header X-Uber-Signature
     * @throws SecurityException se assinatura inválida
     */
    public void processarWebhook(UberWebhookEventDTO event, String signature) {
        log.info("🔄 Processando webhook Uber - Event Type: {}", event.getEventType());

        // 1. VALIDAR ASSINATURA (se configurado)
        if (webhookSecret != null && !webhookSecret.isEmpty() && signature != null) {
            if (!validarAssinatura(event, signature)) {
                throw new SecurityException("Assinatura HMAC inválida");
            }
            log.info("✅ Assinatura HMAC válida");
        } else {
            log.warn("⚠️ Validação de assinatura HMAC desabilitada (webhook.secret não configurado)");
        }

        // 2. EXTRAIR DELIVERY ID
        String deliveryId = Optional.ofNullable(event.getDeliveryId())
            .or(() -> Optional.ofNullable(event.getMeta())
                .map(UberWebhookEventDTO.MetaData::getResourceId))
            .orElse(null);

        if (deliveryId == null) {
            log.error("❌ Webhook inválido: faltando delivery_id");
            return;
        }

        log.info("📦 Delivery ID: {}", deliveryId);

        // 3. BUSCAR ENTREGA NO BANCO
        Entrega entrega = entregaRepository.findByIdCorridaUber(deliveryId)
                .orElse(null);

        if (entrega == null) {
            log.warn("⚠️ Entrega não encontrada para delivery_id: {}", deliveryId);
            return;
        }

        // 4. PROCESSAR EVENTO BASEADO NO TIPO
        String eventType = event.getEventType();
        switch (eventType) {
            case "deliveries.courier_assigned":
                processarMotoristaAtribuido(entrega, event);
                break;
                
            case "deliveries.courier_approaching_pickup":
                processarMotoristaACaminhoDaLoja(entrega, event);
                break;
                
            case "deliveries.courier_at_pickup":
                processarMotoristaChegouNaLoja(entrega, event);
                break;
                
            case "deliveries.courier_approaching_dropoff":
                processarMotoristaACaminhoDoCliente(entrega, event);
                break;
                
            case "deliveries.courier_at_dropoff":
                processarMotoristaChegouNoCliente(entrega, event);
                break;
                
            case "deliveries.delivered":
                processarEntregaConcluida(entrega, event);
                break;
                
            case "deliveries.canceled":
                processarEntregaCancelada(entrega, event);
                break;
                
            case "deliveries.delivery_status_updated":
                processarMudancaDeStatus(entrega, event);
                break;
                
            default:
                log.info("ℹ️ Evento não tratado: {}", eventType);
        }

        // 5. SALVAR ALTERAÇÕES
        entregaRepository.save(entrega);
        
        log.info("✅ Webhook processado com sucesso - Delivery ID: {}, Novo Status: {}", 
                deliveryId, entrega.getStatusEntrega());
    }

    /**
     * Valida assinatura HMAC-SHA256 do webhook (type-safe).
     */
    private boolean validarAssinatura(UberWebhookEventDTO event, String signature) {
        try {
            // Converter DTO para JSON string
            String payloadString = objectMapper.writeValueAsString(event);

            // Calcular HMAC SHA-256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hmacBytes = mac.doFinal(payloadString.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hmacBytes);

            // Comparar assinaturas (timing-safe)
            return calculatedSignature.equals(signature);
            
        } catch (Exception e) {
            log.error("Erro ao validar assinatura HMAC", e);
            return false;
        }
    }

    // ========================================
    // PROCESSADORES DE EVENTOS (Type-Safe)
    // ========================================

    private void processarMotoristaAtribuido(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🏍️ Motorista atribuído à entrega");

        Optional.ofNullable(event.getCourier()).ifPresent(courier -> {
            entrega.setNomeMotorista(courier.getName());
            entrega.setContatoMotorista(courier.getPhoneNumber());
            
            Optional.ofNullable(courier.getVehicle()).ifPresent(vehicle -> {
                entrega.setPlacaVeiculo(vehicle.getLicensePlate());
            });
            
            // Atualizar localização do motorista
            Optional.ofNullable(courier.getLocation()).ifPresent(location -> {
                entrega.setLatitudeMotorista(location.getLatitude());
                entrega.setLongitudeMotorista(location.getLongitude());
            });
        });

        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_MOTORISTA);
    }

    private void processarMotoristaACaminhoDaLoja(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🛣️ Motorista a caminho da loja");
        entrega.setStatusEntrega(StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA);
        
        // Atualizar localização se disponível
        atualizarLocalizacaoMotorista(entrega, event);
    }

    private void processarMotoristaChegouNaLoja(Entrega entrega, UberWebhookEventDTO event) {
        log.info("📍 Motorista chegou na loja");
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
        
        atualizarLocalizacaoMotorista(entrega, event);
    }

    private void processarMotoristaACaminhoDoCliente(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🚴 Motorista a caminho do cliente");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        entrega.setDataHoraRetirada(OffsetDateTime.now());
        
        atualizarLocalizacaoMotorista(entrega, event);
        
        // Atualizar status do pedido também
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedido.setStatus(Pedido.StatusPedido.EM_TRANSITO);
            pedidoRepository.save(pedido);
        }
    }

    private void processarMotoristaChegouNoCliente(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🏠 Motorista chegou no endereço do cliente");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        
        atualizarLocalizacaoMotorista(entrega, event);
    }

    private void processarEntregaConcluida(Entrega entrega, UberWebhookEventDTO event) {
        log.info("✅ Entrega concluída com sucesso");
        entrega.setStatusEntrega(StatusEntrega.ENTREGUE);
        entrega.setDataHoraEntrega(OffsetDateTime.now());
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedido.setStatus(Pedido.StatusPedido.ENTREGUE);
            pedido.setEntregueEm(OffsetDateTime.now());
            pedidoRepository.save(pedido);
        }
        
        // TODO: Enviar notificação ao cliente (email/SMS/push)
        log.info("📧 TODO: Enviar notificação de entrega concluída ao cliente");
    }

    private void processarEntregaCancelada(Entrega entrega, UberWebhookEventDTO event) {
        log.warn("❌ Entrega cancelada pela Uber");
        entrega.setStatusEntrega(StatusEntrega.CANCELADA);
        
        // Registrar motivo do cancelamento
        if (event.getCancellationReason() != null) {
            log.warn("📝 Motivo: {}", event.getCancellationReason());
        }
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedido.setStatus(Pedido.StatusPedido.CANCELADO);
            pedidoRepository.save(pedido);
        }
        
        // TODO: Notificar lojista e cliente sobre cancelamento
        log.warn("📧 TODO: Notificar lojista e cliente sobre cancelamento");
    }

    private void processarMudancaDeStatus(Entrega entrega, UberWebhookEventDTO event) {
        String status = event.getStatus();
        log.info("📝 Status atualizado: {}", status);
        
        if (status == null) {
            log.warn("⚠️ Status não informado no evento");
            return;
        }
        
        // Mapear status da Uber para nosso enum
        try {
            switch (status.toLowerCase()) {
                case "pending" -> entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
                case "pickup" -> entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_MOTORISTA);
                case "dropoff" -> entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
                case "delivered" -> processarEntregaConcluida(entrega, event);
                case "canceled", "cancelled" -> processarEntregaCancelada(entrega, event);
                default -> log.warn("Status desconhecido: {}", status);
            }
        } catch (Exception e) {
            log.error("Erro ao mapear status: {}", status, e);
        }
    }
    
    /**
     * Método auxiliar para atualizar localização do motorista.
     */
    private void atualizarLocalizacaoMotorista(Entrega entrega, UberWebhookEventDTO event) {
        Optional.ofNullable(event.getCourier())
            .map(UberWebhookEventDTO.CourierData::getLocation)
            .ifPresent(location -> {
                entrega.setLatitudeMotorista(location.getLatitude());
                entrega.setLongitudeMotorista(location.getLongitude());
                log.debug("📍 Localização atualizada: {}, {}", 
                    location.getLatitude(), location.getLongitude());
            });
    }
}
