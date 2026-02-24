package com.win.marketplace.controller;

import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.service.UberWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller otimizado para webhooks da Uber Direct API.
 * 
 * <p>Recebe notificações em tempo real sobre mudanças de status das entregas:</p>
 * <ul>
 *   <li>Motorista atribuído</li>
 *   <li>Motorista a caminho da loja</li>
 *   <li>Pedido coletado</li>
 *   <li>Motorista a caminho do cliente</li>
 *   <li>Entrega concluída</li>
 *   <li>Entrega cancelada</li>
 * </ul>
 * 
 * <p>Endpoint público (sem autenticação JWT) pois é chamado pela Uber.
 * Segurança via assinatura HMAC-SHA256 no header X-Uber-Signature.</p>
 * 
 * @since 2026-02-24
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final UberWebhookService uberWebhookService;

    /**
     * Webhook otimizado para notificações da Uber Direct (versão tipada).
     * 
     * <p>A Uber envia POST para este endpoint quando há mudança de status na entrega.</p>
     * 
     * <p>Eventos tratados:</p>
     * <ul>
     *   <li>deliveries.delivery_status_updated</li>
     *   <li>deliveries.courier_assigned</li>
     *   <li>deliveries.courier_approaching_pickup</li>
     *   <li>deliveries.courier_at_pickup</li>
     *   <li>deliveries.courier_approaching_dropoff</li>
     *   <li>deliveries.courier_at_dropoff</li>
     *   <li>deliveries.delivered</li>
     *   <li>deliveries.canceled</li>
     * </ul>
     * 
     * @param event DTO tipado com dados do evento
     * @param signature Assinatura HMAC-SHA256 para validação
     * @return 200 OK se processado com sucesso
     */
    @PostMapping("/uber-direct")
    public ResponseEntity<?> receberWebhookUber(
            @RequestBody UberWebhookEventDTO event,
            @RequestHeader(value = "X-Uber-Signature", required = false) String signature) {
        
        log.info("📥 Webhook Uber recebido - Event Type: {}", 
                event.getEventType());
        
        try {
            // Processar webhook (validação HMAC incluída)
            uberWebhookService.processarWebhook(event, signature);
            
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
    /**
     * Endpoint de teste para simular webhooks da Uber (apenas desenvolvimento).
     * 
     * <p>Permite testar o processamento de webhooks sem validação de assinatura.</p>
     * <p><strong>IMPORTANTE</strong>: Bloqueado em produção por questões de segurança.</p>
     * 
     * @param event DTO tipado com dados de teste
     * @return 200 OK se processado
     */
    @PostMapping("/uber-direct/test")
    public ResponseEntity<?> testarWebhook(@RequestBody UberWebhookEventDTO event) {
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
            uberWebhookService.processarWebhook(event, null);
            
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
