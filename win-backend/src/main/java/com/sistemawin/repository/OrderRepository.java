package com.sistemawin.repository;

import com.sistemawin.domain.entity.Order;
import com.sistemawin.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Encontra pedidos por um determinado cliente
    List<Order> findByCustomerId(Long customerId);

    // Encontra pedidos por um determinado motorista
    List<Order> findByDriverId(Long driverId);

    // Encontra pedidos por status
    List<Order> findByStatus(OrderStatus status);
}
