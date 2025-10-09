package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.service.PagamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pagamento")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping("/processar")
    public ResponseEntity<PagamentoResponseDTO> processarPagamento(@RequestBody PagamentoRequestDTO requestDTO) {
        PagamentoResponseDTO response = pagamentoService.processarPagamento(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/pedido/{pedidoId}")
    public ResponseEntity<PagamentoResponseDTO> buscarPorPedidoId(@PathVariable UUID pedidoId) {
        PagamentoResponseDTO pagamento = pagamentoService.buscarPorPedidoId(pedidoId);
        return ResponseEntity.ok(pagamento);
    }

    @GetMapping("/list/status/{status}")
    public ResponseEntity<List<PagamentoResponseDTO>> listarPorStatus(@PathVariable String status) {
        Pagamento.StatusPagamento statusEnum = Pagamento.StatusPagamento.valueOf(status.toUpperCase());
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarPorStatus(statusEnum);
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/list/metodo/{metodo}")
    public ResponseEntity<List<PagamentoResponseDTO>> listarPorMetodo(@PathVariable String metodo) {
        Pagamento.MetodoPagamento metodoEnum = Pagamento.MetodoPagamento.valueOf(metodo.toUpperCase());
        List<PagamentoResponseDTO> pagamentos = pagamentoService.listarPorMetodo(metodoEnum);
        return ResponseEntity.ok(pagamentos);
    }

    @PatchMapping("/aprovar/{pagamentoId}")
    public ResponseEntity<PagamentoResponseDTO> aprovarPagamento(@PathVariable UUID pagamentoId) {
        PagamentoResponseDTO pagamento = pagamentoService.aprovarPagamento(pagamentoId);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/rejeitar/{pagamentoId}")
    public ResponseEntity<PagamentoResponseDTO> rejeitarPagamento(@PathVariable UUID pagamentoId, @RequestParam String motivo) {
        PagamentoResponseDTO pagamento = pagamentoService.rejeitarPagamento(pagamentoId, motivo);
        return ResponseEntity.ok(pagamento);
    }

    @PatchMapping("/cancelar/{pagamentoId}")
    public ResponseEntity<PagamentoResponseDTO> cancelarPagamento(@PathVariable UUID pagamentoId) {
        PagamentoResponseDTO pagamento = pagamentoService.cancelarPagamento(pagamentoId);
        return ResponseEntity.ok(pagamento);
    }
}
