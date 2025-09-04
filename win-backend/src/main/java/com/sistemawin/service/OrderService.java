package com.sistemawin.service;

import com.sistemawin.domain.entity.*;
import com.sistemawin.domain.enums.OrderStatus;
import com.sistemawin.dto.request.OrderRequest;
import com.sistemawin.dto.request.OrderItemRequest;
import com.sistemawin.dto.response.OrderItemResponse;
import com.sistemawin.dto.response.OrderResponse;
import com.sistemawin.repository.CustomerRepository;
import com.sistemawin.repository.DriverRepository;
import com.sistemawin.repository.OrderRepository;
import com.sistemawin.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, CustomerRepository customerRepository, DriverRepository driverRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.productRepository = productRepository;
    }

    // Cria um novo pedido
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + request.getCustomerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setStatus(OrderStatus.PENDING); // Status inicial

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + itemRequest.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice()); // Captura o preço atual do produto
            orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    // Busca todos os pedidos
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // Busca um pedido por ID
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + id));
        return mapToOrderResponse(order);
    }

    // Atualiza o status de um pedido
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + id));
        existingOrder.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(existingOrder);
        return mapToOrderResponse(updatedOrder);
    }

    // Atribui um motorista a um pedido
    @Transactional
    public OrderResponse assignDriverToOrder(Long orderId, Long driverId) {
        Order existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + orderId));
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com ID: " + driverId));

        existingOrder.setDriver(driver);
        Order updatedOrder = orderRepository.save(existingOrder);
        return mapToOrderResponse(updatedOrder);
    }

    // Deleta um pedido
    @Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new EntityNotFoundException("Pedido não encontrado com ID: " + id);
        }
        orderRepository.deleteById(id);
    }

    // Busca pedidos por cliente
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + customerId));
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // Busca pedidos por motorista
    public List<OrderResponse> getOrdersByDriver(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com ID: " + driverId));
        return orderRepository.findByDriverId(driverId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // Método para mapear a entidade Order para o DTO de resposta
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerId(order.getCustomer().getId());
        response.setCustomerName(order.getCustomer().getName());
        if (order.getDriver() != null) {
            response.setDriverId(order.getDriver().getId());
            response.setDriverName(order.getDriver().getName());
        }
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        // Mapeia os itens do pedido
        response.setItems(order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList()));

        return response;
    }

    // Método para mapear a entidade OrderItem para o DTO de resposta
    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setSubtotal(item.getSubtotal());
        return response;
    }
}
