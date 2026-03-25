package com.win.marketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.request.UberWebhookDTO;
import com.win.marketplace.service.EntregaService;
import com.win.marketplace.service.UberWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para receber webhooks da Uber Direct.
 * 
 * ⚠️ IMPORTANTES: 
 * 1. Configurado na plataforma Uber Developer como webhook URL
 * 2. Protegido com validação de assinatura HMAC-SHA256 (header X-Uber-Signature)
 * 3. Rate limiting no Nginx/API Gateway
 * 4. Endpoint público (sem JWT) mas seguro via HMAC
 * 
 * Eventos tratados:
 * - event.delivery_status: Status da entrega mudou
 * - event.courier_update: Localização/info do motorista
 * - event.delivery_cancelled: Entrega foi cancelada
 * 
 * Fluxo:
 * 1. Uber envia POST com evento + assinatura HMAC
 * 2. Validamos autenticidade (HMAC-SHA256)
 * 3. Processamos evento (atualizar DB + emitir WebSocket)
 * 4. Retornamos 200 OK (confirm)
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/uber")
@RequiredArgsConstructor
public class UberWebhookController {

    private final EntregaService entregaService;
    private final UberWebhookService webhookService;
    private final ObjectMapper objectMapper;

    @Value("${app.uber.direct.webhook-secret}")
    private String webhookSecret;

    /**
     * Recebe notificações de webhooks da Uber Direct
     * 
     * POST /api/v1/webhooks/uber
     * Headers:
     * - X-Uber-Signature: <HMAC-SHA256>
     * - Content-Type: application/json
     * 
     * @param signature Assinatura HMAC do header
     * @param payload Raw JSON payload (para validação de assinatura)
     * @param webhook Dados parseados
     * @return 200 OK se processado
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> receberAtualizacaoStatus(
            @RequestHeader(value = "X-Uber-Signature", required = false) String signature,
            @RequestBody UberWebhookDTO webhook) {
        
        try {
            log.info("📩 Webhook Uber recebido");
            log.debug("📋 Signature: {}", signature);

            // Converter webhook para JSON para validação de assinatura
            String payload = objectMapper.writeValueAsString(webhook);
            log.debug("📦 Payload: {}", payload);

            // 1. Validar assinatura HMAC (segurança)
            if (!validarAssinatura(payload, signature)) {
                log.error("❌ Assinatura inválida - possível requisição fraudulenta");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("erro", "Assinatura inválida"));
            }

            log.info("✅ Webhook validado");
            log.info("   ID Corrida: {}", webhook.getIdCorridaUber());
            log.info("   Status: {}", webhook.getStatusUber());

            // 2. Processar webhook (atualizar DB)
            entregaService.processarWebhookUber(webhook);

            // 4. Retornar 200 OK (confirm to Uber)
            return ResponseEntity.ok(Map.of("status", "received"));

        } catch (IllegalArgumentException e) {
            log.error("❌ Erro de validação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));

        } catch (Exception e) {
            log.error("❌ Erro ao processar webhook: {}", e.getMessage(), e);
            
            // IMPORTANTE: Retornar 200 mesmo com erro para evitar retry excessivo da Uber
            // Uber tentará novamente se receber 4xx/5xx
            return ResponseEntity.ok(Map.of("status", "error_processing"));
        }
    }

    /**
     * Valida assinatura HMAC-SHA256
     * 
     * Processo:
     * 1. Pegar webhook secret
     * 2. Calcular HMAC-SHA256 do payload
     * 3. Comparar com signature do header
     * 
     * @param payload JSON bruto
     * @param signature Valor do header X-Uber-Signature
     * @return true se válida
     */
    private boolean validarAssinatura(String payload, String signature) {
        if (signature == null || signature.isEmpty()) {
            log.warn("⚠️ Webhook sem assinatura");
            return webhookSecret == null || webhookSecret.isEmpty();
        }

        if (webhookSecret == null || webhookSecret.isEmpty()) {
            log.warn("⚠️ Webhook secret não configurado - pulando validação");
            return true;
        }

        try {
            String calculada = calcularHmacSha256(payload, webhookSecret);
            
            log.debug("🔍 HMAC esperada: {}", calculada);
            log.debug("🔍 HMAC recebida: {}", signature);

            boolean valida = signature.equalsIgnoreCase(calculada);
            
            if (valida) {
                log.info("✅ Assinatura HMAC-SHA256 válida");
            } else {
                log.error("❌ Assinatura HMAC-SHA256 inválida");
            }

            return valida;

        } catch (Exception e) {
            log.error("❌ Erro ao validar assinatura: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Calcula HMAC-SHA256
     */
    private String calcularHmacSha256(String payload, String secret) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                "HmacSHA256"
        );
        mac.init(keySpec);
        
        byte[] hmacBytes = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        
        // Converter para hexadecimal
        StringBuilder hexString = new StringBuilder();
        for (byte b : hmacBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        
        return hexString.toString();
    }

    /**
     * Endpoint de teste para verificar se o webhook está acessível.
     * Usado pela Uber para validar a URL do webhook.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.info("✅ Health check - Webhook Uber ativo");
        return ResponseEntity.ok("Webhook Uber ativo");
    }
}
