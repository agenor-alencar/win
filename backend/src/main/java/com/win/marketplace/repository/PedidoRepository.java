package com.win.marketplace.repository;

import com.win.marketplace.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    
    /**
     * Busca pedidos do usuário com join fetch de itens, produtos e imagens
     * Evita problema de LazyInitializationException ao mapear para DTO
     */
    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto prod " +
           "LEFT JOIN FETCH prod.imagens " +
           "WHERE p.usuario.id = :usuarioId " +
           "ORDER BY p.criadoEm DESC")
    List<Pedido> findByUsuarioIdWithDetails(@Param("usuarioId") UUID usuarioId);
    
    List<Pedido> findByUsuarioId(UUID usuarioId);
    
    List<Pedido> findByMotoristaId(UUID motoristaId);
    
    List<Pedido> findByStatus(Pedido.StatusPedido status);
    
    Optional<Pedido> findByNumeroPedido(String numeroPedido);

       boolean existsByCodigoEntrega(String codigoEntrega);
    
    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId AND p.status = :status")
    List<Pedido> findByUsuarioIdAndStatus(@Param("usuarioId") UUID usuarioId, @Param("status") Pedido.StatusPedido status);
    
    @Query("SELECT p FROM Pedido p WHERE p.motorista.id = :motoristaId AND p.status = :status")
    List<Pedido> findByMotoristaIdAndStatus(@Param("motoristaId") UUID motoristaId, @Param("status") Pedido.StatusPedido status);
    
    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId ORDER BY p.criadoEm DESC")
    List<Pedido> findByUsuarioIdOrderByCriadoEmDesc(@Param("usuarioId") UUID usuarioId);
    
    @Query("SELECT p FROM Pedido p WHERE p.motorista.id = :motoristaId ORDER BY p.criadoEm DESC")
    List<Pedido> findByMotoristaIdOrderByCriadoEmDesc(@Param("motoristaId") UUID motoristaId);
    
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.id = :usuarioId")
    long countByUsuarioId(@Param("usuarioId") UUID usuarioId);
    
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.motorista.id = :motoristaId")
    long countByMotoristaId(@Param("motoristaId") UUID motoristaId);
    
    @Query("SELECT p FROM Pedido p WHERE p.status = :status AND p.motorista IS NULL")
    List<Pedido> findPedidosSemMotorista(@Param("status") Pedido.StatusPedido status);
    
    @Query("SELECT DISTINCT p FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId ORDER BY p.criadoEm DESC")
    List<Pedido> findByLojistaId(@Param("lojistaId") UUID lojistaId);
    
    @Query("SELECT DISTINCT p FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.status = :status ORDER BY p.criadoEm DESC")
    List<Pedido> findByLojistaIdAndStatus(@Param("lojistaId") UUID lojistaId, @Param("status") Pedido.StatusPedido status);

    @Query("SELECT DISTINCT p FROM Pedido p JOIN p.itens i " +
          "WHERE i.lojista.id = :lojistaId " +
          "AND p.statusPagamento = :statusPagamento " +
          "AND p.status IN :statuses " +
          "ORDER BY p.criadoEm DESC")
    List<Pedido> findByLojistaIdAndStatusPagamentoAndStatusIn(
           @Param("lojistaId") UUID lojistaId,
           @Param("statusPagamento") Pedido.StatusPagamento statusPagamento,
           @Param("statuses") List<Pedido.StatusPedido> statuses);
    
    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId")
    long countByLojistaId(@Param("lojistaId") UUID lojistaId);
    
    // Queries para relatórios financeiros
    @Query("SELECT p.total, p.status FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.criadoEm >= :dataInicio AND p.criadoEm <= :dataFim")
    List<Object[]> findPedidosFinanceirosPorLojista(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
    
    @Query("SELECT CAST(p.criadoEm AS date) as dia, SUM(p.total), COUNT(p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.criadoEm >= :dataInicio AND p.criadoEm <= :dataFim GROUP BY CAST(p.criadoEm AS date) ORDER BY dia")
    List<Object[]> findReceitaPorDia(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
    
    @Query("SELECT YEAR(p.criadoEm), MONTH(p.criadoEm), SUM(p.total), COUNT(p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.criadoEm >= :dataInicio AND p.criadoEm <= :dataFim GROUP BY YEAR(p.criadoEm), MONTH(p.criadoEm) ORDER BY YEAR(p.criadoEm), MONTH(p.criadoEm)")
    List<Object[]> findReceitaPorMes(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
    
    @Query("SELECT i.produto.id, i.produto.nome, SUM(i.quantidade), SUM(i.precoUnitario * i.quantidade), AVG(i.precoUnitario) FROM ItemPedido i WHERE i.lojista.id = :lojistaId AND i.pedido.criadoEm >= :dataInicio AND i.pedido.criadoEm <= :dataFim GROUP BY i.produto.id, i.produto.nome ORDER BY SUM(i.precoUnitario * i.quantidade) DESC")
    List<Object[]> findTopProdutosPorLojista(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
    
    // Queries para estatísticas do dashboard
    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.criadoEm BETWEEN :start AND :end")
    Long countByLojistaIdAndCriadoEmBetween(@Param("lojistaId") UUID lojistaId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.statusPagamento = :statusPagamento AND p.criadoEm BETWEEN :start AND :end")
    Long countByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
           @Param("lojistaId") UUID lojistaId,
           @Param("statusPagamento") Pedido.StatusPagamento statusPagamento,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end);
    
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.criadoEm BETWEEN :start AND :end")
    BigDecimal sumTotalByLojistaIdAndCriadoEmBetween(@Param("lojistaId") UUID lojistaId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.statusPagamento = :statusPagamento AND p.criadoEm BETWEEN :start AND :end")
    BigDecimal sumTotalByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
           @Param("lojistaId") UUID lojistaId,
           @Param("statusPagamento") Pedido.StatusPagamento statusPagamento,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.status IN :statuses")
    Long countByLojistaIdAndStatusIn(@Param("lojistaId") UUID lojistaId, @Param("statuses") List<Pedido.StatusPedido> statuses);

    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.itens i WHERE i.lojista.id = :lojistaId AND p.statusPagamento = :statusPagamento AND p.status IN :statuses")
    Long countByLojistaIdAndStatusPagamentoAndStatusIn(
           @Param("lojistaId") UUID lojistaId,
           @Param("statusPagamento") Pedido.StatusPagamento statusPagamento,
           @Param("statuses") List<Pedido.StatusPedido> statuses);
    
    // ========================================
    // QUERIES OTIMIZADAS PARA DASHBOARD ADMIN
    // ========================================
    
    /**
     * Conta pedidos em um período específico
     */
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.criadoEm >= :inicio AND p.criadoEm <= :fim")
    Long countPedidosPorPeriodo(@Param("inicio") OffsetDateTime inicio, @Param("fim") OffsetDateTime fim);
    
    /**
     * Calcula receita total em um período específico (excluindo cancelados)
     */
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.criadoEm >= :inicio AND p.criadoEm <= :fim AND p.status <> :statusCancelado")
    BigDecimal somarReceitaPorPeriodo(@Param("inicio") OffsetDateTime inicio, @Param("fim") OffsetDateTime fim, @Param("statusCancelado") Pedido.StatusPedido statusCancelado);
    
    /**
     * Calcula receita total de todos os pedidos (excluindo cancelados)
     */
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.status <> :statusCancelado")
    BigDecimal somarReceitaTotal(@Param("statusCancelado") Pedido.StatusPedido statusCancelado);
    
    /**
     * Busca quantidade de vendas agrupadas por mês/ano (últimos N meses)
     */
    @Query("SELECT YEAR(p.criadoEm) as ano, MONTH(p.criadoEm) as mes, COUNT(p) as quantidade " +
           "FROM Pedido p " +
           "WHERE p.status <> :statusCancelado AND p.criadoEm >= :dataInicio " +
           "GROUP BY YEAR(p.criadoEm), MONTH(p.criadoEm) " +
           "ORDER BY ano, mes")
    List<Object[]> contarVendasPorMes(@Param("dataInicio") OffsetDateTime dataInicio, @Param("statusCancelado") Pedido.StatusPedido statusCancelado);
    
    /**
     * Busca receita agrupada por mês/ano (últimos N meses)
     */
    @Query("SELECT YEAR(p.criadoEm) as ano, MONTH(p.criadoEm) as mes, COALESCE(SUM(p.total), 0) as receita " +
           "FROM Pedido p " +
           "WHERE p.status <> :statusCancelado AND p.criadoEm >= :dataInicio " +
           "GROUP BY YEAR(p.criadoEm), MONTH(p.criadoEm) " +
           "ORDER BY ano, mes")
    List<Object[]> somarReceitaPorMes(@Param("dataInicio") OffsetDateTime dataInicio, @Param("statusCancelado") Pedido.StatusPedido statusCancelado);
}
