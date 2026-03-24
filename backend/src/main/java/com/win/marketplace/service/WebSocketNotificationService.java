package com.win.marketplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Serviço para notificar clientes WebSocket sobre atualizações de entrega
 * 
 * Responsabilidades:
 * - Enviar eventos de mudança de status para clientes conectados
 * - Enviar informações de localização do motorista
 * - Enviar alertas e notificações
 * 
 * Fluxo:
 * 1. Backend recebe webhook da Uber (UberWebhookController)
 * 2. Processa evento (atualiza DB)
 * 3. Chama este serviço para notificar clientes WebSocket
 * 4. Clientes (React) recebem evento em tempo real
 * 
 * Topics:
 * - /topic/entrega/{deliveryId}/status
 * - /topic/entrega/{deliveryId}/courier
 * - /topic/entrega/{deliveryId}/alert
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Notifica mudança de status de entrega
     * 
     * @param deliveryId ID da entrega/corrida na Uber
     * @param novoStatus Novo status (ex: "SEARCHING_FOR_COURIER", "PICKED_UP", "DELIVERED")
     * @param dados Dados adicionais (ex: mensagem, timestamp)
     */
    public void notificarMudancaStatus(String deliveryId, String novoStatus, Map<String, Object> dados) {
        try {
            String destino = "/topic/entrega/" + deliveryId + "/status";
            
            Map<String, Object> mensagem = Map.of(
                    "tipo", "STATUS_CHANGED",
                    "deliveryId", deliveryId,
                    "novoStatus", novoStatus,
                    "timestamp", System.currentTimeMillis(),
                    "dados", dados != null ? dados : Map.of()
            );
            
            log.info("📡 Enviando notificação de status para {}: {}", destino, novoStatus);
            messagingTemplate.convertAndSend(destino, mensagem);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar notificação de status: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifica mudança de localização do motorista
     * 
     * @param deliveryId ID da entrega
     * @param latitude Latitude atual
     * @param longitude Longitude atual
     * @param nomeMotorista Nome do motorista
     * @param telefone Telefone do motorista
     * @param veículo Informações do veículo
     */
    public void notificarAtualizacaoMotorista(String deliveryId, 
                                             Double latitude, 
                                             Double longitude,
                                             String nomeMotorista,
                                             String telefone,
                                             String veículo) {
        try {
            String destino = "/topic/entrega/" + deliveryId + "/courier";
            
            Map<String, Object> mensagem = Map.of(
                    "tipo", "COURIER_UPDATE",
                    "deliveryId", deliveryId,
                    "localizacao", Map.of(
                            "latitude", latitude,
                            "longitude", longitude
                    ),
                    "motorista", Map.of(
                            "nome", nomeMotorista != null ? nomeMotorista : "Motorista",
                            "telefone", telefone != null ? telefone : ""
                    ),
                    "veiculo", veículo != null ? veículo : "",
                    "timestamp", System.currentTimeMillis()
            );
            
            log.info("📍 Atualizando localização do motorista para {}: ({}, {})", 
                    destino, latitude, longitude);
            messagingTemplate.convertAndSend(destino, mensagem);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar atualização de motorista: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifica alerta ou mensagem importante
     * 
     * @param deliveryId ID da entrega
     * @param tipoAlerta Tipo do alerta (ex: "ENTREGA_PROXIMA", "CANCELAMENTO", "ATRASO")
     * @param mensagem Mensagem para o usuário
     * @param severidade Nível de severidade (INFO, WARNING, ERROR)
     */
    public void notificarAlerta(String deliveryId, 
                               String tipoAlerta, 
                               String mensagem, 
                               String severidade) {
        try {
            String destino = "/topic/entrega/" + deliveryId + "/alert";
            
            Map<String, Object> notificacao = Map.of(
                    "tipo", tipoAlerta,
                    "deliveryId", deliveryId,
                    "mensagem", mensagem,
                    "severidade", severidade,
                    "timestamp", System.currentTimeMillis()
            );
            
            log.warn("🔔 Alerta ({}) para {}: {}", severidade, destino, mensagem);
            messagingTemplate.convertAndSend(destino, notificacao);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar alerta: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifica quando cliente precisa fazer algo (ex: validar PIN code)
     * 
     * @param deliveryId ID da entrega
     * @param acao Ação esperada (ex: "VALIDAR_PIN_COLETA", "VALIDAR_PIN_ENTREGA", "CONFIRMAR_ENTREGA")
     * @param pinCode PIN code que o cliente deve validar (opcional, se aplicável)
     */
    public void notificarAcaoPendente(String deliveryId, String acao, String pinCode) {
        try {
            String destino = "/topic/entrega/" + deliveryId + "/action";
            
            Map<String, Object> mensagem = Map.of(
                    "tipo", "ACTION_REQUIRED",
                    "deliveryId", deliveryId,
                    "acao", acao,
                    "pinCode", pinCode != null ? pinCode : "",
                    "timestamp", System.currentTimeMillis()
            );
            
            log.info("⚠️ Ação pendente para {}: {}", destino, acao);
            messagingTemplate.convertAndSend(destino, mensagem);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar ação pendente: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast de notificação para múltiplas entregas
     * Útil para alertas gerais ou atualizações em lote
     */
    public void broadcastNotificacao(String tipoBroadcast, Map<String, Object> dados) {
        try {
            String destino = "/topic/broadcast/" + tipoBroadcast;
            messagingTemplate.convertAndSend(destino, dados);
            log.info("📢 Broadcast enviado: {}", destino);
        } catch (Exception e) {
            log.error("❌ Erro ao fazer broadcast: {}", e.getMessage(), e);
        }
    }
}
