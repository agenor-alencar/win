package com.win.marketplace.controller;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    // 💳 MERCADO PAGO - Checkout
    // ========================================

    /**
     * Cria pagamento PIX via Mercado Pago
     */
    @PostMapping("/mercadopago/pix/{pedidoId}")
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
            response.put("pix", pixInfo);
            response.put("pedidoId", pedidoId.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            // Mercado Pago não configurado
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_NAO_CONFIGURADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (MPApiException e) {
            // Erro na API do Mercado Pago
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_API_ERROR");
            error.put("message", "Erro ao criar PIX no Mercado Pago: " + e.getMessage());
            error.put("statusCode", e.getStatusCode());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (MPException e) {
            // Erro de conexão com Mercado Pago
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_CONNECTION_ERROR");
            error.put("message", "Erro de conexão com Mercado Pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            
        } catch (RuntimeException e) {
            // Pedido não encontrado ou outros erros
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PEDIDO_NAO_ENCONTRADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            
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
     * Cria checkout de cartão de crédito via Mercado Pago
     */
    @PostMapping("/mercadopago/cartao")
    public ResponseEntity<?> criarCheckoutCartao(@RequestParam UUID pedidoId) {
        try {
            String checkoutUrl = pagamentoService.criarPreferenciaCartao(pedidoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("checkoutUrl", checkoutUrl);
            response.put("message", "Checkout de cartão criado! Redirecione o cliente para a URL fornecida.");
            response.put("pedidoId", pedidoId.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_NAO_CONFIGURADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (MPApiException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_API_ERROR");
            error.put("message", "Erro ao criar checkout: " + e.getMessage());
            error.put("statusCode", e.getStatusCode());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (MPException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_CONNECTION_ERROR");
            error.put("message", "Erro de conexão: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PEDIDO_NAO_ENCONTRADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_INTERNO");
            error.put("message", "Erro inesperado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/mercadopago/pedido/{pedidoId}")
    public ResponseEntity<?> criarCheckoutPedido(@PathVariable UUID pedidoId) {
        try {
            String checkoutUrl = pagamentoService.criarPreferenciaPedido(pedidoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("checkoutUrl", checkoutUrl);
            response.put("message", "Checkout criado com sucesso! Redirecione o usuário para a URL fornecida.");
            response.put("pedidoId", pedidoId.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            // Mercado Pago não configurado
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_NAO_CONFIGURADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (MPApiException e) {
            // Erro na API do Mercado Pago
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_API_ERROR");
            error.put("message", "Erro ao criar checkout no Mercado Pago: " + e.getMessage());
            error.put("statusCode", e.getStatusCode());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (MPException e) {
            // Erro de conexão com Mercado Pago
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "MERCADOPAGO_CONNECTION_ERROR");
            error.put("message", "Erro de conexão com Mercado Pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            
        } catch (RuntimeException e) {
            // Pedido não encontrado ou outros erros
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PEDIDO_NAO_ENCONTRADO");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            
        } catch (Exception e) {
            // Erro genérico
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ERRO_INTERNO");
            error.put("message", "Erro inesperado ao processar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/mercadopago/item")
    public ResponseEntity<?> criarCheckoutItem(
        @RequestParam UUID pedidoId,
        @RequestParam String titulo,
        @RequestParam Integer quantidade,
        @RequestParam BigDecimal valorUnitario
    ) {
        try {
            String checkoutUrl = pagamentoService.criarPreferenciaMercadoPago(
                pedidoId, titulo, quantidade, valorUnitario
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("checkoutUrl", checkoutUrl);
            response.put("message", "Checkout criado com sucesso!");
            response.put("item", Map.of(
                "titulo", titulo,
                "quantidade", quantidade,
                "valorUnitario", valorUnitario,
                "valorTotal", valorUnitario.multiply(new BigDecimal(quantidade))
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getClass().getSimpleName());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/webhooks/mercadopago")
    public ResponseEntity<Map<String, String>> receberWebhookMercadoPago(
        @RequestBody Map<String, Object> payload
    ) {
        try {
            pagamentoService.processarWebhookMercadoPago(payload);
            
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
    // 📋 GESTÃO DE PAGAMENTOS
    // ========================================

    @GetMapping
    public ResponseEntity<List<PagamentoResponseDTO>> listarTodos() {
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarTodos();
        return ResponseEntity.ok(pagamentos);
    }
}
