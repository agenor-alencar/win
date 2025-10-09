package com.win.marketplace.repository;

import com.win.marketplace.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    List<Pedido> findByClienteIdOrderByDataPedidoDesc(UUID clienteId);
    List<Pedido> findByStatus(Pedido.StatusPedido status);
}
