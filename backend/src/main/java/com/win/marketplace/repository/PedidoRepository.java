package com.win.marketplace.repository;

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
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    
    List<Pedido> findByUsuarioId(UUID usuarioId);
    
    List<Pedido> findByMotoristaId(UUID motoristaId);
    
    List<Pedido> findByStatus(Pedido.StatusPedido status);
    
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    
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
}