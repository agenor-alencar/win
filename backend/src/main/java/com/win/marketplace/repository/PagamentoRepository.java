package com.win.marketplace.repository;

import com.win.marketplace.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {
    Optional<Pagamento> findByPedidoId(UUID pedidoId);
    List<Pagamento> findByStatus(Pagamento.StatusPagamento status);
    List<Pagamento> findByMetodoPagamento(Pagamento.MetodoPagamento metodoPagamento);
}
