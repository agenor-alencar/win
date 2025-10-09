package com.win.marketplace.repository;

import com.win.marketplace.model.PedidoCupom;
import com.win.marketplace.model.PedidoCupomId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoCupomRepository extends JpaRepository<PedidoCupom, PedidoCupomId> {
    List<PedidoCupom> findByPedidoId(UUID pedidoId);
    List<PedidoCupom> findByCupomId(UUID cupomId);
}
