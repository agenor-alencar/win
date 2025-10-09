package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pedido")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/create/cliente/{clienteId}")
    public ResponseEntity<PedidoResponseDTO> criarPedido(@PathVariable UUID clienteId, @RequestBody PedidoCreateRequestDTO requestDTO) {
        PedidoResponseDTO response = pedidoService.criarPedido(clienteId, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorCliente(@PathVariable UUID clienteId) {
        List<PedidoResponseDTO> pedidos = pedidoService.listarPedidosPorCliente(clienteId);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/list/status/{status}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorStatus(@PathVariable String status) {
        Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(status.toUpperCase());
        List<PedidoResponseDTO> pedidos = pedidoService.listarPorStatus(statusEnum);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.buscarPorId(id);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<PedidoResponseDTO> atualizarStatusPedido(@PathVariable UUID id, @RequestParam String novoStatus) {
        Pedido.StatusPedido statusEnum = Pedido.StatusPedido.valueOf(novoStatus.toUpperCase());
        PedidoResponseDTO pedido = pedidoService.atualizarStatusPedido(id, statusEnum);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/confirmar/{id}")
    public ResponseEntity<PedidoResponseDTO> confirmarPedido(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.confirmarPedido(id);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/cancelar/{id}")
    public ResponseEntity<PedidoResponseDTO> cancelarPedido(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.cancelarPedido(id);
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/entregar/{id}")
    public ResponseEntity<PedidoResponseDTO> marcarComoEntregue(@PathVariable UUID id) {
        PedidoResponseDTO pedido = pedidoService.marcarComoEntregue(id);
        return ResponseEntity.ok(pedido);
    }
}
