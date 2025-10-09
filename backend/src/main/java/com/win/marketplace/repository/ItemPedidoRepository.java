package com.win.marketplace.repository;

import com.win.marketplace.model.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, UUID> {
    List<ItemPedido> findByPedidoId(UUID pedidoId);
}
