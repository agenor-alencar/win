package com.win.marketplace.controller;

import com.win.marketplace.dto.request.UberWebhookDTO;
import com.win.marketplace.service.EntregaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para receber webhooks da Uber Flash.
 * 
 * IMPORTANTE: Este endpoint deve ser:
 * 1. Configurado na plataforma Uber Developer como webhook URL
 * 2. Protegido com validação de assinatura (verificar header X-Uber-Signature)
 * 3. Ter rate limiting configurado no Nginx/API Gateway
 * 
 * Endpoint público (sem autenticação JWT) pois é chamado pela Uber.
 * A segurança é feita via validação de assinatura no header.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/uber")
@RequiredArgsConstructor
public class UberWebhookController {

    private final EntregaService entregaService;

    /**
     * Recebe notificações de atualização de status da Uber Flash.
     * 
     * @param webhook Dados do webhook enviado pela Uber
     * @return 200 OK para confirmar recebimento
     */
    @PostMapping
    public ResponseEntity<Void> receberAtualizacaoStatus(
            @RequestHeader(value = "X-Uber-Signature", required = false) String signature,
            @RequestBody UberWebhookDTO webhook) {
        
        log.info("Webhook Uber recebido - Corrida: {}, Status: {}",
                webhook.getIdCorridaUber(), webhook.getStatusUber());

        // TODO: Validar assinatura do webhook
        // if (!validarAssinaturaUber(signature, webhook)) {
        //     log.warn("Assinatura inválida no webhook Uber");
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        // }

        try {
            entregaService.processarWebhookUber(webhook);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao processar webhook Uber", e);
            // Retornar 200 mesmo com erro para evitar retry excessivo da Uber
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Endpoint de teste para verificar se o webhook está acessível.
     * Usado pela Uber para validar a URL do webhook.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Webhook Uber ativo");
    }

    // TODO: Implementar validação de assinatura
    // private boolean validarAssinaturaUber(String signature, UberWebhookDTO webhook) {
    //     // Implementar validação conforme documentação Uber
    //     return true;
    // }
}
