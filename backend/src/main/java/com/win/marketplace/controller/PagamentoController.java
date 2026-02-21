package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping("/processar")
    public ResponseEntity<PagamentoResponseDTO> processarPagamento(@Valid @RequestBody PagamentoRequestDTO requestDTO) {
        PagamentoResponseDTO response = pagamentoService.processarPagamento(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<PagamentoResponseDTO> buscarPorPedidoId(@PathVariable UUID pedidoId) {
        PagamentoResponseDTO pagamento = pagamentoService.buscarPorPedidoId(pedidoId);
        return ResponseEntity.ok(pagamento);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PagamentoResponseDTO>> listarPorStatus(@PathVariable String status) {
        Pagamento.StatusPagamento statusEnum = Pagamento.StatusPagamento.valueOf(status.toUpperCase());
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarPorStatus(statusEnum);
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/metodo/{metodo}")
    public ResponseEntity<List<PagamentoResponseDTO>> listarPorMetodo(@PathVariable String metodo) {
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarPorMetodo(metodo);
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/transacao/{transacaoId}")
    public ResponseEntity<PagamentoResponseDTO> buscarPorTransacaoId(@PathVariable String transacaoId) {
        PagamentoResponseDTO pagamento = pagamentoService.buscarPorTransacaoId(transacaoId);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/{pagamentoId}/aprovar")
    public ResponseEntity<PagamentoResponseDTO> aprovarPagamento(@PathVariable UUID pagamentoId) {
        PagamentoResponseDTO pagamento = pagamentoService.aprovarPagamento(pagamentoId);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/{pagamentoId}/recusar")
    public ResponseEntity<PagamentoResponseDTO> recusarPagamento(
            @PathVariable UUID pagamentoId,
            @RequestParam(required = false) String motivo) {
        PagamentoResponseDTO pagamento = pagamentoService.recusarPagamento(pagamentoId, motivo);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/{pagamentoId}/cancelar")
    public ResponseEntity<PagamentoResponseDTO> cancelarPagamento(@PathVariable UUID pagamentoId) {
        PagamentoResponseDTO pagamento = pagamentoService.cancelarPagamento(pagamentoId);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/{pagamentoId}/estornar")
    public ResponseEntity<PagamentoResponseDTO> estornarPagamento(@PathVariable UUID pagamentoId) {
        PagamentoResponseDTO pagamento = pagamentoService.estornarPagamento(pagamentoId);
        return ResponseEntity.ok(pagamento);
    }

    // ========================================
    // 🥑 ABACATE PAY - Checkout PIX
    // ========================================

    /**
     * Cria pagamento PIX via Abacate Pay
     */
    @PostMapping("/abacatepay/pix/{pedidoId}")
    public ResponseEntity<?> criarPagamentoPix(
        @PathVariable UUID pedidoId,
        @RequestBody Map<String, String> pixData
    ) {
        try {
            String cpf = pixData.get("cpf");
            String email = pixData.get("email");
            
            Map<String, Object> pixInfo = pagamentoService.criarPagamentoPix(pedidoId, cpf, email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pagamento PIX criado com sucesso!");
            response.put("billing", pixInfo);
            response.put("pedidoId", pedidoId.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            // Abacate Pay não configurado
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ABACATEPAY_NAO_CONFIGURADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (RuntimeException e) {
            // Pedido não encontrado ou erro na API
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_PROCESSAMENTO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            // Erro genérico
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_INTERNO");
            error.put("message", "Erro inesperado ao processar PIX: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Busca cobrança no Abacate Pay
     */
    @GetMapping("/abacatepay/cobranca/{billingId}")
    public ResponseEntity<?> buscarCobranca(@PathVariable String billingId) {
        try {
            Map<String, Object> cobranca = pagamentoService.buscarCobrancaAbacatePay(billingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("billing", cobranca);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "COBRANCA_NAO_ENCONTRADA");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Webhook do Abacate Pay
     */
    @PostMapping("/webhooks/abacatepay")
    public ResponseEntity<Map<String, String>> receberWebhookAbacatePay(
        @RequestBody Map<String, Object> payload,
        @RequestParam(required = false) String webhookSecret
    ) {
        try {
            // Validar secret (se configurado)
            // TODO: Implementar validação de HMAC signature
            
            pagamentoService.processarWebhookAbacatePay(payload);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook processado com sucesso");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ========================================
    // � PAGAR.ME (STONE) - Checkout PIX
    // ========================================

    /**
     * Cria pagamento PIX via Pagar.me
     */
    @PostMapping("/pagarme/pix/{pedidoId}")
    public ResponseEntity<?> criarPagamentoPixPagarMe(
        @PathVariable UUID pedidoId,
        @RequestBody Map<String, String> pixData
    ) {
        try {
            String nome = pixData.get("nome");
            String email = pixData.get("email");
            String cpf = pixData.get("cpf");
            String telefone = pixData.get("telefone");
            
            Map<String, Object> pixInfo = pagamentoService.criarPagamentoPixPagarMe(
                pedidoId, nome, email, cpf, telefone
            );
            
            // Transformar resposta para formato esperado pelo frontend
            Map<String, Object> billing = new HashMap<>();
            billing.put("checkoutUrl", pixInfo.get("qrCodeUrl")); // URL da imagem do QR Code
            billing.put("billingId", pixInfo.get("orderId")); // ID da ordem no Pagar.me
            billing.put("qrCode", pixInfo.get("qrCode")); // Código PIX (copia e cola)
            billing.put("qrCodeUrl", pixInfo.get("qrCodeUrl")); // URL da imagem
            billing.put("amount", pixInfo.get("amount")); // Valor em centavos
            billing.put("expiresAt", pixInfo.get("expiresAt")); // Data de expiração
            billing.put("status", pixInfo.get("status")); // Status do pagamento
            billing.put("transactionId", pixInfo.get("transactionId")); // ID da transação
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pagamento PIX Pagar.me criado com sucesso!");
            response.put("billing", billing);
            response.put("pedidoId", pedidoId.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            // Pagar.me não configurado
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PAGARME_NAO_CONFIGURADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (RuntimeException e) {
            // Pedido não encontrado ou erro na API
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_PROCESSAMENTO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            // Erro genérico
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_INTERNO");
            error.put("message", "Erro inesperado ao processar PIX: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Busca ordem no Pagar.me
     */
    @GetMapping("/pagarme/ordem/{orderId}")
    public ResponseEntity<?> buscarOrdemPagarMe(@PathVariable String orderId) {
        try {
            Map<String, Object> ordem = pagamentoService.buscarOrdemPagarMe(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", ordem);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ORDEM_NAO_ENCONTRADA");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Cancela ordem no Pagar.me
     */
    @DeleteMapping("/pagarme/ordem/{orderId}")
    public ResponseEntity<?> cancelarOrdemPagarMe(@PathVariable String orderId) {
        try {
            Map<String, Object> ordem = pagamentoService.cancelarOrdemPagarMe(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ordem cancelada com sucesso");
            response.put("order", ordem);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_CANCELAMENTO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Webhook do Pagar.me
     */
    @PostMapping("/webhooks/pagarme")
    public ResponseEntity<Map<String, String>> receberWebhookPagarMe(
        @RequestBody Map<String, Object> payload,
        @RequestHeader(value = "X-Hub-Signature", required = false) String signature
    ) {
        try {
            // TODO: Implementar validação de assinatura
            // pagarMeService.validarWebhook(payload, signature);
            
            pagamentoService.processarWebhookPagarMe(payload);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook processado com sucesso");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Busca dados do pagamento PIX pelo ID do pedido (para página de pagamento)
     */
    @GetMapping("/pedido/{pedidoId}/pix")
    public ResponseEntity<?> buscarPagamentoPix(@PathVariable UUID pedidoId) {
        try {
            Map<String, Object> pagamentoData = pagamentoService.buscarDadosPagamentoPix(pedidoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("billing", pagamentoData.get("billing"));
            response.put("pedido", pagamentoData.get("pedido"));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PAGAMENTO_NAO_ENCONTRADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Obtém ou recria pagamento PIX com validação de produtos
     * Se o pagamento existir e for válido, retorna ele
     * Se expirou ou não existe, cria um novo automaticamente
     * Valida produtos, preços e estoque antes de criar
     */
    @PostMapping("/pedido/{pedidoId}/pix/obter-ou-recriar")
    public ResponseEntity<?> obterOuRecriarPagamentoPix(
        @PathVariable UUID pedidoId,
        @RequestBody Map<String, String> dadosCliente
    ) {
        try {
            Map<String, Object> resultado = pagamentoService.obterOuRecriarPagamentoPix(pedidoId, dadosCliente);
            
            // Se tem produtos indisponíveis, retornar 400
            if (resultado.containsKey("error") && "PRODUTOS_INDISPONIVEIS".equals(resultado.get("error"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resultado);
            }
            
            return ResponseEntity.ok(resultado);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_PROCESSAMENTO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_INTERNO");
            error.put("message", "Erro inesperado ao processar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Verifica status do pagamento PIX no Pagar.me
     */
    @GetMapping("/{orderId}/status")
    public ResponseEntity<?> verificarStatusPagamento(@PathVariable String orderId) {
        try {
            String status = pagamentoService.verificarStatusPagamentoPix(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", status);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_VERIFICACAO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ========================================
    // �📋 GESTÃO DE PAGAMENTOS
    // ========================================

    @GetMapping
    public ResponseEntity<List<PagamentoResponseDTO>> listarTodos() {
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarTodos();
        return ResponseEntity.ok(pagamentos);
    }
}
