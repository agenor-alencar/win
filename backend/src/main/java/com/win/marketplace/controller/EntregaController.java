package com.win.marketplace.controller;

import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.response.DeliveryStatusResponseDTO;
import com.win.marketplace.dto.response.EntregaResponseDTO;
import com.win.marketplace.dto.response.SimulacaoFreteResponseDTO;
import com.win.marketplace.dto.response.SolicitacaoCorridaUberResponseDTO;
import com.win.marketplace.service.EntregaService;
import com.win.marketplace.service.UberFlashService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller para gerenciamento de entregas via Uber Flash.
 * 
 * Endpoints:
 * - POST /api/v1/entregas/simular-frete - Simula custo de frete (público)
 * - POST /api/v1/entregas/{pedidoId}/solicitar - Solicita corrida Uber (lojista)
 * - GET /api/v1/entregas/pedido/{pedidoId} - Busca entrega do pedido (lojista/cliente)
 * - GET /api/v1/entregas/{entregaId}/status - Consulta status em tempo real (lojista/cliente)
 * - GET /api/v1/entregas/lojista/minhas - Lista entregas do lojista (lojista)
 * - GET /api/v1/entregas/lojista/em-andamento - Lista entregas em andamento (lojista)
 * - DELETE /api/v1/entregas/{entregaId} - Cancela entrega (lojista)
 */
@RestController
@RequestMapping("/api/v1/entregas")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;
    private final UberFlashService uberFlashService;

    /**
     * Simula o custo de frete para um pedido.
     * Usado na página de checkout antes do pagamento.
     */
    @PostMapping("/simular-frete")
    public ResponseEntity<SimulacaoFreteResponseDTO> simularFrete(
            @Valid @RequestBody SimulacaoFreteRequestDTO request) {
        var simulacao = uberFlashService.simularFrete(request);
        return ResponseEntity.ok(simulacao);
    }

    /**
     * Solicita corrida Uber Flash quando pedido estiver pronto.
     * Chamado pelo lojista após preparar o pedido.
     */
    @PostMapping("/{pedidoId}/solicitar")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'ADMIN')")
    public ResponseEntity<SolicitacaoCorridaUberResponseDTO> solicitarCorrida(
            @PathVariable UUID pedidoId) {
        var response = entregaService.solicitarCorridaUber(pedidoId);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca informações da entrega por pedido.
     */
    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'CLIENTE', 'ADMIN')")
    public ResponseEntity<EntregaResponseDTO> buscarPorPedido(@PathVariable UUID pedidoId) {
        var entrega = entregaService.buscarPorPedido(pedidoId);
        return ResponseEntity.ok(entrega);
    }
    
    /**
     * Consulta status em tempo real da entrega na Uber.
     * Retorna informações atualizadas sobre motorista, localização e ETAs.
     * 
     * @param entregaId ID da entrega no sistema WIN
     * @return Status atualizado em tempo real
     */
    @GetMapping("/{entregaId}/status")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'CLIENTE', 'ADMIN')")
    public ResponseEntity<DeliveryStatusResponseDTO> consultarStatusEmTempoReal(
            @PathVariable UUID entregaId) {
        var status = entregaService.consultarStatusEmTempoReal(entregaId);
        return ResponseEntity.ok(status);
    }

    /**
     * Lista todas as entregas do lojista.
     */
    @GetMapping("/lojista/minhas")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'ADMIN')")
    public ResponseEntity<List<EntregaResponseDTO>> listarMinhasEntregas(
            @RequestParam UUID lojistaId) {
        var entregas = entregaService.listarPorLojista(lojistaId);
        return ResponseEntity.ok(entregas);
    }

    /**
     * Lista entregas em andamento do lojista.
     */
    @GetMapping("/lojista/em-andamento")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'ADMIN')")
    public ResponseEntity<List<EntregaResponseDTO>> listarEntregasEmAndamento(
            @RequestParam UUID lojistaId) {
        var entregas = entregaService.listarEmAndamentoPorLojista(lojistaId);
        return ResponseEntity.ok(entregas);
    }

    /**
     * Cancela uma entrega.
     */
    @DeleteMapping("/{entregaId}")
    @PreAuthorize("hasAnyAuthority('LOJISTA', 'ADMIN')")
    public ResponseEntity<Void> cancelarEntrega(@PathVariable UUID entregaId) {
        entregaService.cancelarEntrega(entregaId);
        return ResponseEntity.noContent().build();
    }
}
