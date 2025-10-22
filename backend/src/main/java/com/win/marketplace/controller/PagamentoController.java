package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping
    public ResponseEntity<List<PagamentoResponseDTO>> listarTodos() {
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarTodos();
        return ResponseEntity.ok(pagamentos);
    }
}
