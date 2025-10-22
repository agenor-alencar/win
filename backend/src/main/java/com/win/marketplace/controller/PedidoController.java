package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller de Pedidos
 * 
 * Permissões:
 * - Criar pedido: Usuários autenticados (USER, LOJISTA, ADMIN)
 * - Listar todos os pedidos: Apenas ADMIN
 * - Listar próprios pedidos: Usuário autenticado
 * - Atualizar status/operações: ADMIN ou LOJISTA
 * - Motorista: Pode ver pedidos atribuídos a ele e atualizar status de entrega
 */
@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    /**
     * Criar pedido - Qualquer usuário autenticado
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponseDTO> criarPedido(
            @Valid @RequestBody PedidoCreateRequestDTO requestDTO) {
        PedidoResponseDTO response = pedidoService.criarPedido(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Listar pedidos por usuário - ADMIN ou o próprio usuário
     * TODO: Implementar verificação se é o próprio usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorUsuario(
            @PathVariable UUID usuarioId) {
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidosPorUsuario(usuarioId);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Listar pedidos por motorista - ADMIN ou MOTORISTA
     */
    @GetMapping("/motorista/{motoristaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOTORISTA')")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorMotorista(
            @PathVariable UUID motoristaId) {
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidosPorMotorista(motoristaId);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Listar por status - ADMIN ou LOJISTA
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorStatus(
            @PathVariable String status) {
        Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(status.toUpperCase());
        List<PedidoResponseDTO> pedidos = pedidoService.listarPorStatus(statusEnum);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Listar pedidos por lojista - ADMIN ou LOJISTA
     */
    @GetMapping("/lojista/{lojistaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorLojista(
            @PathVariable UUID lojistaId) {
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidosPorLojista(lojistaId);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Listar pedidos por lojista e status - ADMIN ou LOJISTA
     */
    @GetMapping("/lojista/{lojistaId}/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorLojistaEStatus(
            @PathVariable UUID lojistaId,
            @PathVariable String status) {
        Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(status.toUpperCase());
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidosPorLojistaEStatus(lojistaId, statusEnum);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Buscar pedido por ID - Usuários autenticados
     * TODO: Verificar se usuário tem permissão para ver este pedido específico
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.buscarPorId(id);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Buscar por número do pedido - Usuários autenticados
     */
    @GetMapping("/numero/{numeroPedido}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponseDTO> buscarPorNumero(
            @PathVariable String numeroPedido) {
        PedidoResponseDTO pedido = pedidoService.buscarPorNumeroPedido(numeroPedido);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Atualizar status do pedido - ADMIN ou LOJISTA
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestParam String novoStatus) {
        Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(novoStatus.toUpperCase());
        PedidoResponseDTO pedido = pedidoService.atualizarStatus(id, statusEnum);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Confirmar pedido - ADMIN ou LOJISTA
     */
    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<PedidoResponseDTO> confirmarPedido(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.confirmarPedido(id);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Cancelar pedido - ADMIN, LOJISTA ou próprio usuário
     */
    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(
            @PathVariable UUID id,
            @RequestParam(required = false) String motivo) {
        PedidoResponseDTO pedido = pedidoService.cancelarPedido(id, motivo);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Atribuir motorista - ADMIN ou LOJISTA
     */
    @PatchMapping("/{id}/atribuir-motorista")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<PedidoResponseDTO> atribuirMotorista(
            @PathVariable UUID id,
            @RequestParam UUID motoristaId) {
        PedidoResponseDTO pedido = pedidoService.atribuirMotorista(id, motoristaId);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Marcar como preparando - ADMIN ou LOJISTA
     */
    @PatchMapping("/{id}/preparando")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<PedidoResponseDTO> marcarComoPreparando(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.marcarComoPreparando(id);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Marcar como pronto - ADMIN ou LOJISTA
     */
    @PatchMapping("/{id}/pronto")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA')")
    public ResponseEntity<PedidoResponseDTO> marcarComoPronto(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.marcarComoPronto(id);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Marcar como em trânsito - ADMIN, LOJISTA ou MOTORISTA
     */
    @PatchMapping("/{id}/em-transito")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA', 'MOTORISTA')")
    public ResponseEntity<PedidoResponseDTO> marcarComoEmTransito(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.marcarComoEmTransito(id);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Marcar como entregue - ADMIN, LOJISTA ou MOTORISTA
     */
    @PatchMapping("/{id}/entregar")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOJISTA', 'MOTORISTA')")
    public ResponseEntity<PedidoResponseDTO> marcarComoEntregue(
            @PathVariable UUID id,
            @RequestParam String codigoEntrega) {
        PedidoResponseDTO pedido = pedidoService.marcarComoEntregue(id, codigoEntrega);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Listar todos os pedidos - Apenas ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PedidoResponseDTO>> listarTodos() {
        List<PedidoResponseDTO> pedidos = pedidoService.listarTodos();
        return ResponseEntity.ok(pedidos);
    }
}
