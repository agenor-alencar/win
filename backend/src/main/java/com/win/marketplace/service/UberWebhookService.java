package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.repository.EntregaRepository;
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
    private final PedidoStatusService pedidoStatusService;
    private final WebSocketNotificationService webSocketService;
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
                
            case "deliveries.pickup_completed":
                processarColetaCompleta(entrega, event);
                break;
                
            case "deliveries.courier_approaching_dropoff":
                processarMotoristaACaminhoDoCliente(entrega, event);
                break;
                
            case "deliveries.courier_at_dropoff":
                processarMotoristaChegouNoCliente(entrega, event);
                break;
                
            case "deliveries.delivery_completed":
                processarEntregaCompleta(entrega, event);
                break;
                
            case "deliveries.delivered":
                processarEntregaCompleta(entrega, event);
                break;
                
            case "deliveries.canceled", "deliveries.delivery_cancelled":
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
        
        // 📡 Notificar clientes WebSocket
        webSocketService.notificarAcaoPendente(
            entrega.getIdCorridaUber(),
            "MOTORISTA_ATRIBUIDO",
            null
        );
    }

    private void processarMotoristaACaminhoDaLoja(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🛣️ Motorista a caminho da loja");
        entrega.setStatusEntrega(StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA);
        
        // Atualizar localização se disponível
        atualizarLocalizacaoMotorista(entrega, event);
        
        // 📡 Notificar mudança de status
        webSocketService.notificarMudancaStatus(
            entrega.getIdCorridaUber(),
            "MOTORISTA_A_CAMINHO_RETIRADA",
            Map.of("mensagem", "Motorista está a caminho da loja para retirada")
        );
    }

    private void processarMotoristaChegouNaLoja(Entrega entrega, UberWebhookEventDTO event) {
        log.info("📍 Motorista chegou na loja");
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
        
        // 📡 Notificar ação pendente - validação de PIN de coleta
        webSocketService.notificarAcaoPendente(
            entrega.getIdCorridaUber(),
            "VALIDAR_PIN_COLETA",
            entrega.getCodigoRetiradaUber()
        );
        
        atualizarLocalizacaoMotorista(entrega, event);
    }

    private void processarMotoristaACaminhoDoCliente(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🚴 Motorista a caminho do cliente");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        entrega.setDataHoraRetirada(OffsetDateTime.now());
        
        atualizarLocalizacaoMotorista(entrega, event);
        
        // 📡 Notificar mudança de status
        webSocketService.notificarMudancaStatus(
            entrega.getIdCorridaUber(),
            "EM_TRANSITO",
            Map.of("mensagem", "Motorista retirou do lojista e está a caminho do cliente")
        );
        
        // 📍 Notificar localização do motorista
        if (event.getCourier() != null && event.getCourier().getLocation() != null) {
            webSocketService.notificarAtualizacaoMotorista(
                entrega.getIdCorridaUber(),
                event.getCourier().getLocation().getLatitude(),
                event.getCourier().getLocation().getLongitude(),
                entrega.getNomeMotorista(),
                entrega.getContatoMotorista(),
                entrega.getPlacaVeiculo()
            );
        }
        
        // Atualizar status do pedido também
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.EM_TRANSITO);
        }
    }

    private void processarMotoristaChegouNoCliente(Entrega entrega, UberWebhookEventDTO event) {
        log.info("🏠 Motorista chegou no endereço do cliente");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        
        atualizarLocalizacaoMotorista(entrega, event);
        
        // 📡 Notificar ação pendente - validação de PIN de entrega
        webSocketService.notificarAcaoPendente(
            entrega.getIdCorridaUber(),
            "VALIDAR_PIN_ENTREGA",
            entrega.getCodigoEntregaUber()
        );
        
        // 📍 Notificar que motorista chegou no local
        webSocketService.notificarAlerta(
            entrega.getIdCorridaUber(),
            "MOTORISTA_CHEGOU",
            "Motorista chegou no endereço de entrega. Prepare-se para receber!",
            "INFO"
        );
    }

    /**
     * Processa evento de coleta completa pelo motorista
     * Chamado quando: deliveries.pickup_completed
     */
    private void processarColetaCompleta(Entrega entrega, UberWebhookEventDTO event) {
        log.info("📦 Coleta completa - Motorista retirou pacote do lojista");
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        entrega.setDataHoraRetirada(OffsetDateTime.now());
        
        atualizarLocalizacaoMotorista(entrega, event);
        
        // 📡 Notificar mudança de status para o cliente
        webSocketService.notificarMudancaStatus(
            entrega.getIdCorridaUber(),
            "COLETA_COMPLETA",
            Map.of("mensagem", "Seu pacote foi coletado e está a caminho!", 
                   "dataHoraRetirada", entrega.getDataHoraRetirada().toString())
        );
        
        // 🎯 Alertar cliente que entrega está saindo para seu endereço
        webSocketService.notificarAlerta(
            entrega.getIdCorridaUber(),
            "SAINDO_PARA_ENTREGA",
            "Motorista saiu com seu pedido e está a caminho!",
            "INFO"
        );
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.EM_TRANSITO);
            log.info("✅ Pedido #{} marcado como EM_TRANSITO", pedido.getId());
        }
    }

    /**
     * Processa evento de entrega completa pelo motorista
     * Chamado quando: deliveries.delivery_completed
     */
    private void processarEntregaCompleta(Entrega entrega, UberWebhookEventDTO event) {
        log.info("✅ Entrega completa - Cliente recebeu o pacote");
        entrega.setStatusEntrega(StatusEntrega.ENTREGUE);
        entrega.setDataHoraEntrega(OffsetDateTime.now());
        
        atualizarLocalizacaoMotorista(entrega, event);
        
        // 📡 Notificar mudança de status - conclusão bem sucedida
        webSocketService.notificarMudancaStatus(
            entrega.getIdCorridaUber(),
            "ENTREGUE_COM_SUCESSO",
            Map.of("mensagem", "Entrega concluída com sucesso!", 
                   "dataHoraEntrega", entrega.getDataHoraEntrega().toString())
        );
        
        // 📢 Broadcast: Alertar que entrega foi concluída
        webSocketService.notificarAlerta(
            entrega.getIdCorridaUber(),
            "ENTREGA_CONCLUIDA",
            "Sua entrega foi recebida com sucesso!",
            "INFO"
        );
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.ENTREGUE);
            log.info("✅ Pedido #{} marcado como ENTREGUE", pedido.getId());
        }
        
        // 📧 Notificar cliente sobre conclusão
        log.info("📧 Entrega concluída - Cliente deve receber notificação de conclusão");
    }

    private void processarEntregaCancelada(Entrega entrega, UberWebhookEventDTO event) {
        log.warn("❌ Entrega cancelada pela Uber");
        entrega.setStatusEntrega(StatusEntrega.CANCELADA);
        
        String motivo = event.getCancellationReason() != null ? 
            event.getCancellationReason() : "Cancelada pela Uber";
        
        // Registrar motivo do cancelamento
        log.warn("📝 Motivo: {}", motivo);
        
        // 📡 Notificar mudança de status
        webSocketService.notificarMudancaStatus(
            entrega.getIdCorridaUber(),
            "CANCELADA",
            Map.of("motivo", motivo)
        );
        
        // 🔔 Alertar com severidade ERROR
        webSocketService.notificarAlerta(
            entrega.getIdCorridaUber(),
            "ENTREGA_CANCELADA",
            "Sua entrega foi cancelada. Motivo: " + motivo,
            "ERROR"
        );
        
        // Atualizar status do pedido
        Pedido pedido = entrega.getPedido();
        if (pedido != null) {
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.CANCELADO);
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
                case "pending" -> {
                    entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
                    webSocketService.notificarMudancaStatus(
                        entrega.getIdCorridaUber(),
                        "AGUARDANDO_PREPARACAO",
                        Map.of("mensagem", "Lojista está preparando seu pedido")
                    );
                }
                case "pickup" -> {
                    entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_MOTORISTA);
                    webSocketService.notificarMudancaStatus(
                        entrega.getIdCorridaUber(),
                        "AGUARDANDO_MOTORISTA",
                        Map.of("mensagem", "Sua entrega está pronta para coleta")
                    );
                }
                case "dropoff" -> {
                    entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
                    webSocketService.notificarMudancaStatus(
                        entrega.getIdCorridaUber(),
                        "EM_TRANSITO",
                        Map.of("mensagem", "Motorista está a caminho com seu pedido")
                    );
                }
                case "delivered" -> processarEntregaCompleta(entrega, event);
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
