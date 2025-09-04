package com.sistemawin.controller;

import com.sistemawin.domain.enums.OrderStatus;
import com.sistemawin.dto.request.OrderRequest;
import com.sistemawin.dto.response.OrderResponse;
import com.sistemawin.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER')") // Apenas clientes podem criar pedidos
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse order = orderService.createOrder(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT', 'DRIVER')") // ADMIN, Lojistas e Motoristas podem listar todos os pedidos
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER', 'MERCHANT', 'DRIVER')")
    // TODO: Adicionar lógica para verificar se o usuário logado tem permissão para ver este pedido (dono do pedido, lojista de algum produto, motorista atribuído)
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT', 'DRIVER')") // ADMIN, Lojistas e Motoristas podem atualizar o status
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        // TODO: Adicionar lógica de validação de transição de status e permissão (ex: lojista só pode mudar para 'processing', motorista para 'shipped'/'delivered')
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderId}/assign-driver/{driverId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MERCHANT')") // ADMIN e Lojistas podem atribuir motoristas
    public ResponseEntity<OrderResponse> assignDriverToOrder(@PathVariable Long orderId, @PathVariable Long driverId) {
        OrderResponse updatedOrder = orderService.assignDriverToOrder(orderId, driverId);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // Apenas ADMIN pode deletar pedidos
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER') and #customerId == authentication.principal.id or hasAuthority('ADMIN')")
    // Clientes podem ver seus próprios pedidos, ADMIN pode ver qualquer pedido de cliente
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        List<OrderResponse> orders = orderService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/by-driver/{driverId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'DRIVER') and #driverId == authentication.principal.id or hasAuthority('ADMIN')")
    // Motoristas podem ver seus próprios pedidos, ADMIN pode ver qualquer pedido de motorista
    public ResponseEntity<List<OrderResponse>> getOrdersByDriver(@PathVariable Long driverId) {
        List<OrderResponse> orders = orderService.getOrdersByDriver(driverId);
        return ResponseEntity.ok(orders);
    }
}
