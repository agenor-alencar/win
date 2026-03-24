package com.win.marketplace.controller;

import com.win.marketplace.dto.request.UberDeliveryRequestDTO;
import com.win.marketplace.dto.response.UberDeliveryResponseDTO;
import com.win.marketplace.service.UberDeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller para criar e gerenciar entregas via Uber Direct
 * 
 * ⚠️ PIN CODES OBRIGATÓRIOS:
 * - Pickup PIN: Fornecido ao lojista - valida coleta
 * - Delivery PIN: Fornecido ao cliente - valida entrega
 * 
 * Endpoints:
 * - POST /api/v1/uber/deliveries - Confirmar entrega (chamar após "Pronto para Retirada")
 * - GET /api/v1/uber/deliveries/{deliveryId}/status - Consultar status
 * - GET /api/v1/uber/deliveries/generate-pin - Gerar PIN aleatório
 * 
 * Fluxo:
 * 1. Lojista clica "Pronto para Retirada" no painel
 * 2. Frontend chama POST /deliveries com quote_id e PIN codes
 * 3. Sistema retorna delivery_id e tracking_url
 * 4. Motorista recebe order
 * 5. Webhooks atualizam status em tempo real
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/uber/deliveries")
@RequiredArgsConstructor
@Tag(name = "Uber Deliveries", description = "APIs de Criação e Gerenciamento de Entregas via Uber Direct")
public class UberDeliveryController {

    private final UberDeliveryService uberDeliveryService;

    /**
     * Confirma uma entrega na Uber Direct
     * 
     * Chamado quando: Lojista clica "Pronto para Retirada"
     * 
     * Requer:
     * - quote_id (obtido do Step 3 - Create Quote)
     * - PIN de coleta (4-6 dígitos) para lojista confirmar
     * - PIN de entrega (4-6 dígitos) para cliente confirmar
     * - Coordenadas de coleta e entrega
     * - Contato do cliente
     * 
     * Retorna:
     * - delivery_id: ID único da entrega
     * - tracking_url: URL para cliente acompanhar em tempo real
     * - status: Status atual da entrega
     * 
     * @param pedidoId ID do pedido
     * @param request DTO com detalhes da entrega
     * @return Resposta com delivery_id e tracking_url
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Confirmar Entrega via Uber", 
               description = "Cria entrega na Uber Direct. Chamado quando lojista clica 'Pronto para Retirada'")
    public ResponseEntity<?> criarEntrega(
            @RequestParam(value = "pedido_id") UUID pedidoId,
            @Valid @RequestBody UberDeliveryRequestDTO request) {

        try {
            log.info("🚚 POST /api/v1/uber/deliveries - Criando entrega para pedido: {}", pedidoId);

            // Validar que o ID do pedido no request corresponde ao pedido ID
            if (!request.getPedidoId().equals(pedidoId.toString())) {
                log.warn("❌ Mismatch: pedido_id na URL não confere com o no body");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                            "sucesso", false,
                            "erro", "ID do pedido na URL não confere com o no body"
                        ));
            }

            // Chamar serviço
            UberDeliveryResponseDTO delivery = uberDeliveryService.criarEntrega(request, pedidoId);

            log.info("✅ Entrega criada com sucesso - Delivery ID: {}", delivery.getDeliveryId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", true);
                        put("delivery", new HashMap<String, Object>() {{
                            put("id", delivery.getDeliveryId());
                            put("status", delivery.getStatus());
                            put("tracking_url", delivery.getUrlRastreamento());
                            put("pin_coleta", delivery.getPinColeta());
                            put("pin_entrega", delivery.getPinEntrega());
                            put("criado_em", delivery.getCriadoEm());
                        }});
                        put("mensagem", "Entrega confirmada! Motorista será atribuído em breve.");
                    }});

        } catch (RuntimeException e) {
            log.error("❌ Erro ao criar entrega: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                        put("tipo_erro", "ENTREGA_INVALIDA");
                    }});

        } catch (Exception e) {
            log.error("❌ Erro inesperado: {}", e.getMessage(), e);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", "Erro ao criar entrega");
                    }});
        }
    }

    /**
     * Consulta o status de uma entrega pelo ID
     * 
     * @param deliveryId ID da entrega (retornado ao criar)
     * @return Status atual da entrega
     */
    @GetMapping("/{deliveryId}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Consultar Status da Entrega", description = "Retorna informações atuais sobre uma entrega")
    public ResponseEntity<?> obterStatusEntrega(@PathVariable String deliveryId) {
        try {
            log.info("🔍 GET /api/v1/uber/deliveries/{}/status", deliveryId);

            UberDeliveryResponseDTO delivery = uberDeliveryService.obterStatusEntrega(deliveryId);

            if (delivery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                            "sucesso", false,
                            "erro", "Entrega não encontrada"
                        ));
            }

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("delivery", delivery);
            }});

        } catch (Exception e) {
            log.error("❌ Erro: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "sucesso", false,
                        "erro", e.getMessage()
                    ));
        }
    }

    /**
     * Gera um PIN code aleatório para usar na entrega
     * Útil para gerar PIN de coleta e PIN de entrega
     * 
     * @return PIN de 4-6 dígitos
     */
    @PostMapping("/generate-pin")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gerar PIN Code", description = "Gera um PIN aleatório para coleta/entrega")
    public ResponseEntity<?> gerarPinCode() {
        try {
            String pin = uberDeliveryService.gerarPinCode();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("pin", pin);
                put("mensagem", "PIN gerado - fornecê-lo ao motorista para confirmação");
            }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("sucesso", false, "erro", e.getMessage()));
        }
    }
}
