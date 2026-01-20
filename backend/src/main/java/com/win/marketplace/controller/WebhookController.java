package com.win.marketplace.controller;

import com.win.marketplace.service.UberWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para webhooks da Uber Direct API.
 * 
 * Recebe notificações em tempo real sobre mudanças de status das entregas:
 * - Motorista atribuído
 * - Motorista a caminho da loja
 * - Pedido coletado
 * - Motorista a caminho do cliente
 * - Entrega concluída
 * - Entrega cancelada
 * 
 * Endpoint público (sem autenticação JWT) pois é chamado pela Uber.
 * Segurança via assinatura HMAC no header X-Uber-Signature.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final UberWebhookService uberWebhookService;

    /**
     * Webhook para notificações da Uber Direct.
     * 
     * A Uber envia POST para este endpoint quando há mudança de status na entrega.
     * 
     * Exemplos de eventos:
     * - deliveries.delivery_status_updated
     * - deliveries.courier_assigned
     * - deliveries.courier_approaching_pickup
     * - deliveries.courier_at_pickup
     * - deliveries.courier_approaching_dropoff
     * - deliveries.courier_at_dropoff
     * - deliveries.delivered
     * - deliveries.canceled
     * 
     * Payload exemplo:
     * {
     *   "event_id": "evt_123",
     *   "event_time": 1642541234,
     *   "event_type": "deliveries.delivery_status_updated",
     *   "resource_href": "/v1/customers/me/deliveries/del_123",
     *   "meta": {
     *     "user_id": "customer_123",
     *     "resource_id": "del_123"
     *   },
     *   "data": {
     *     "id": "del_123",
     *     "status": "courier_approaching_dropoff",
     *     "courier": {
     *       "name": "João Silva",
     *       "phone_number": "+5511999999999",
     *       "vehicle": {
     *         "make": "Honda",
     *         "model": "CG 160",
     *         "license_plate": "ABC1234"
     *       }
     *     }
     *   }
     * }
     * 
     * @param payload Dados do evento enviado pela Uber
     * @param signature Assinatura HMAC para validação (header X-Uber-Signature)
     * @return 200 OK se processado com sucesso
     */
    @PostMapping("/uber-direct")
    public ResponseEntity<?> receberWebhookUber(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-Uber-Signature", required = false) String signature) {
        
        log.info("📥 Webhook Uber recebido - Event Type: {}", 
                payload.get("event_type"));
        
        try {
            // Processar webhook
            uberWebhookService.processarWebhook(payload, signature);
            
            // Retornar sucesso para a Uber
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Webhook processado com sucesso"
            ));
            
        } catch (SecurityException e) {
            // Assinatura inválida
            log.error("🔒 Assinatura HMAC inválida - possível tentativa de fraude", e);
            return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "Assinatura inválida"
            ));
            
        } catch (Exception e) {
            // Erro genérico
            log.error("❌ Erro ao processar webhook Uber", e);
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", "Erro ao processar webhook: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint de teste para simular webhook (apenas em dev/staging).
     * 
     * Permite testar o fluxo de webhook sem precisar da Uber enviar.
     * Deve ser desabilitado em produção.
     */
    @PostMapping("/uber-direct/test")
    public ResponseEntity<?> testarWebhook(@RequestBody Map<String, Object> payload) {
        log.warn("⚠️ Endpoint de TESTE de webhook chamado");
        
        // Em produção, rejeitar
        if (!"dev".equalsIgnoreCase(System.getProperty("spring.profiles.active"))) {
            return ResponseEntity.status(403).body(Map.of(
                    "status", "error",
                    "message", "Endpoint de teste disponível apenas em ambiente de desenvolvimento"
            ));
        }
        
        try {
            // Processar sem validar assinatura (teste)
            uberWebhookService.processarWebhook(payload, null);
            
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Webhook de teste processado"
            ));
        } catch (Exception e) {
            log.error("❌ Erro ao processar webhook de teste", e);
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}
