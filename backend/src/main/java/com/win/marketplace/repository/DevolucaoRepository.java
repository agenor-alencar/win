package com.win.marketplace.repository;

import com.win.marketplace.model.Devolucao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DevolucaoRepository extends JpaRepository<Devolucao, UUID> {
    
    Optional<Devolucao> findByNumeroDevolucao(String numeroDevolucao);
    
    List<Devolucao> findByLojistaId(UUID lojistaId);
    
    List<Devolucao> findByLojistaIdAndStatus(UUID lojistaId, Devolucao.StatusDevolucao status);
    
    List<Devolucao> findByUsuarioId(UUID usuarioId);
    
    List<Devolucao> findByPedidoId(UUID pedidoId);
    
    @Query("SELECT d FROM Devolucao d WHERE d.lojista.id = :lojistaId AND d.criadoEm >= :dataInicio AND d.criadoEm <= :dataFim")
    List<Devolucao> findByLojistaIdAndPeriodo(
        @Param("lojistaId") UUID lojistaId, 
        @Param("dataInicio") OffsetDateTime dataInicio, 
        @Param("dataFim") OffsetDateTime dataFim
    );
    
    long countByLojistaIdAndStatus(UUID lojistaId, Devolucao.StatusDevolucao status);
    
    // Query para relatórios financeiros
    @Query("SELECT d.valorDevolucao, d.status FROM Devolucao d WHERE d.lojista.id = :lojistaId AND d.criadoEm >= :dataInicio AND d.criadoEm <= :dataFim")
    List<Object[]> findDevolucoesPorLojista(@Param("lojistaId") UUID lojistaId, @Param("dataInicio") OffsetDateTime dataInicio, @Param("dataFim") OffsetDateTime dataFim);
}
