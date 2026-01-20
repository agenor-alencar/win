package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;

/**
 * Service para processar webhooks da Uber Direct API.
 * 
 * Responsabilidades:
 * - Validar assinatura HMAC dos webhooks
 * - Processar eventos de mudança de status
 * - Atualizar entrega e pedido no banco de dados
 * - Notificar cliente (futuro: WebSocket/Email)
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
     * Processa webhook recebido da Uber.
     * 
     * @param payload Dados do evento
     * @param signature Assinatura HMAC (header X-Uber-Signature)
     * @throws SecurityException se assinatura inválida
     */
    public void processarWebhook(Map<String, Object> payload, String signature) {
        log.info("🔄 Processando webhook Uber - Event Type: {}", payload.get("event_type"));

        // 1. VALIDAR ASSINATURA (se configurado)
        if (webhookSecret != null && !webhookSecret.isEmpty() && signature != null) {
            if (!validarAssinatura(payload, signature)) {
                throw new SecurityException("Assinatura HMAC inválida");
            }
            log.info("✅ Assinatura HMAC válida");
        } else {
            log.warn("⚠️ Validação de assinatura HMAC desabilitada (webhook.secret não configurado)");
        }

        // 2. EXTRAIR DADOS DO EVENTO
        String eventType = (String) payload.get("event_type");
        
        @SuppressWarnings("unchecked")
        Map<String, Object> meta = (Map<String, Object>) payload.get("meta");
        String deliveryId = meta != null ? (String) meta.get("resource_id") : null;

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload.get("data");

        if (deliveryId == null || data == null) {
            log.error("❌ Webhook inválido: faltando delivery_id ou data");
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
        switch (eventType) {
            case "deliveries.courier_assigned":
                processarMotoristaAtribuido(entrega, data);
                break;
                
            case "deliveries.courier_approaching_pickup":
                processarMotoristaACaminhoDaLoja(entrega, data);
                break;
                
            case "deliveries.courier_at_pickup":
                processarMotoristaChegouNaLoja(entrega, data);
                break;
                
            case "deliveries.courier_approaching_dropoff":
                processarMotoristaACaminhoDoCliente(entrega, data);
                break;
                
            case "deliveries.courier_at_dropoff":
                processarMotoristaChegouNoCliente(entrega, data);
                break;
                
            case "deliveries.delivered":
                processarEntregaConcluida(entrega, data);
                break;
                
            case "deliveries.canceled":
                processarEntregaCancelada(entrega, data);
                break;
                
            case "deliveries.delivery_status_updated":
                processarMudancaDeStatus(entrega, data);
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
     * Valida assinatura HMAC do webhook.
     */
    private boolean validarAssinatura(Map<String, Object> payload, String signature) {
        try {
            // Converter payload para JSON string
            String payloadString = objectMapper.writeValueAsString(payload);

            // Calcular HMAC SHA-256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hmacBytes = mac.doFinal(payloadString.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hmacBytes);

            // Comparar assinaturas
            return calculatedSignature.equals(signature);
            
        } catch (Exception e) {
            log.error("Erro ao validar assinatura HMAC", e);
            return false;
        }
    }

    // ========================================
    // PROCESSADORES DE EVENTOS
    // ========================================

    private void processarMotoristaAtribuido(Entrega entrega, Map<String, Object> data) {
        log.info("🏍️ Motorista atribuído à entrega");

        @SuppressWarnings("unchecked")
        Map<String, Object> courier = (Map<String, Object>) data.get("courier");
        
        if (courier != null) {
            entrega.setNomeMotorista((String) courier.get("name"));
            entrega.setContatoMotorista((String) courier.get("phone_number"));
            
            @SuppressWarnings("unchecked")
            Map<String, Object> vehicle = (Map<String, Object>) courier.get("vehicle");
            if (vehicle != null) {
                entrega.setPlacaVeiculo((String) vehicle.get("license_plate"));
            }
        }

        entrega.setStatusEntrega(StatusEntrega.MOTORISTA_ATRIBUIDO);
        entrega.setDataHoraMotoristaAtribuido(OffsetDateTime.now());
    }

    private void processarMotoristaACaminhoDaLoja(Entrega entrega, Map<String, Object> data) {
        log.info("🛣️ Motorista a caminho da loja");
        entrega.setStatusEntrega(StatusEntrega.MOTORISTA_A_CAMINHO_LOJA);
    }

    private void processarMotoristaChegouNaLoja(Entrega entrega, Map<String, Object> data) {
        log.info("📍 Motorista chegou na loja");
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_RETIRADA);
    }

    private void processarMotoristaACaminhoDoCliente(Entrega entrega, Map<String, Object> data) {
        log.info("🚴 Motorista a caminho do cliente");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        entrega.setDataHoraColetaPedido(OffsetDateTime.now());
        
        // Atualizar status do pedido também
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedido.setStatus(Pedido.StatusPedido.EM_TRANSITO);
            pedidoRepository.save(pedido);
        }
    }

    private void processarMotoristaChegouNoCliente(Entrega entrega, Map<String, Object> data) {
        log.info("🏠 Motorista chegou no endereço do cliente");
        entrega.setStatusEntrega(StatusEntrega.CHEGOU_NO_DESTINO);
    }

    private void processarEntregaConcluida(Entrega entrega, Map<String, Object> data) {
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

    private void processarEntregaCancelada(Entrega entrega, Map<String, Object> data) {
        log.warn("❌ Entrega cancelada pela Uber");
        entrega.setStatusEntrega(StatusEntrega.CANCELADO);
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedido.setStatus(Pedido.StatusPedido.CANCELADO);
            pedidoRepository.save(pedido);
        }
        
        // TODO: Notificar lojista e cliente sobre cancelamento
        log.warn("📧 TODO: Notificar lojista e cliente sobre cancelamento");
    }

    private void processarMudancaDeStatus(Entrega entrega, Map<String, Object> data) {
        String status = (String) data.get("status");
        log.info("📝 Status atualizado: {}", status);
        
        // Mapear status da Uber para nosso enum
        // Se não conseguir mapear, log mas não falha
        try {
            switch (status) {
                case "pending" -> entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
                case "pickup" -> entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_RETIRADA);
                case "dropoff" -> entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
                case "delivered" -> processarEntregaConcluida(entrega, data);
                case "canceled" -> processarEntregaCancelada(entrega, data);
                default -> log.warn("Status desconhecido: {}", status);
            }
        } catch (Exception e) {
            log.error("Erro ao mapear status: {}", status, e);
        }
    }
}
