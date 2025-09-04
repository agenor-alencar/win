package com.sistemawin.repository;

import com.sistemawin.domain.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Métodos adicionais específicos para OrderItem, se necessário
}
