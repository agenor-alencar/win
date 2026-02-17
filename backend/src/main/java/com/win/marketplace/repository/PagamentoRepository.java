package com.win.marketplace.repository;

import com.win.marketplace.model.Pagamento;
import com.win.marketplace.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {
    
    Optional<Pagamento> findByPedidoId(UUID pedidoId);
    
    Optional<Pagamento> findTopByPedidoOrderByCriadoEmDesc(Pedido pedido);
    
    List<Pagamento> findByStatus(Pagamento.StatusPagamento status);
    
    List<Pagamento> findByMetodoPagamento(String metodoPagamento);
    
    Optional<Pagamento> findByTransacaoId(String transacaoId);
    
    // Query para relatórios financeiros
    @Query("SELECT pg.metodoPagamento, COUNT(pg), SUM(pg.valor) FROM Pagamento pg JOIN pg.pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND pg.criadoEm >= :dataInicio AND pg.criadoEm <= :dataFim GROUP BY pg.metodoPagamento ORDER BY SUM(pg.valor) DESC")
    List<Object[]> findPagamentosPorMetodo(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
}