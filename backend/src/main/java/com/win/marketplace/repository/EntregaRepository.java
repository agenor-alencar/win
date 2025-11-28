package com.win.marketplace.repository;

import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.enums.StatusEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EntregaRepository extends JpaRepository<Entrega, UUID> {

    /**
     * Busca entrega por ID do pedido.
     */
    Optional<Entrega> findByPedidoId(UUID pedidoId);

    /**
     * Busca entrega por ID da corrida Uber.
     */
    Optional<Entrega> findByIdCorridaUber(String idCorridaUber);

    /**
     * Lista entregas por status.
     */
    List<Entrega> findByStatusEntrega(StatusEntrega status);

    /**
     * Lista entregas por lojista.
     */
    @Query("SELECT e FROM Entrega e WHERE e.pedido.lojista.id = :lojistaId ORDER BY e.criadoEm DESC")
    List<Entrega> findByLojistaId(@Param("lojistaId") UUID lojistaId);

    /**
     * Lista entregas em andamento por lojista.
     */
    @Query("SELECT e FROM Entrega e WHERE e.pedido.lojista.id = :lojistaId " +
           "AND e.statusEntrega IN ('AGUARDANDO_MOTORISTA', 'MOTORISTA_A_CAMINHO_RETIRADA', 'EM_TRANSITO') " +
           "ORDER BY e.criadoEm DESC")
    List<Entrega> findEntregasEmAndamentoByLojistaId(@Param("lojistaId") UUID lojistaId);

    /**
     * Lista entregas por cliente.
     */
    @Query("SELECT e FROM Entrega e WHERE e.pedido.usuario.id = :clienteId ORDER BY e.criadoEm DESC")
    List<Entrega> findByClienteId(@Param("clienteId") UUID clienteId);

    /**
     * Conta entregas por status e período.
     */
    @Query("SELECT COUNT(e) FROM Entrega e WHERE e.statusEntrega = :status " +
           "AND e.criadoEm BETWEEN :dataInicio AND :dataFim")
    Long countByStatusAndPeriodo(@Param("status") StatusEntrega status,
                                   @Param("dataInicio") OffsetDateTime dataInicio,
                                   @Param("dataFim") OffsetDateTime dataFim);

    /**
     * Busca entregas que falharam na solicitação para retry.
     */
    @Query("SELECT e FROM Entrega e WHERE e.statusEntrega = 'FALHA_SOLICITACAO' " +
           "AND e.criadoEm > :dataLimite ORDER BY e.criadoEm DESC")
    List<Entrega> findFalhasRecentesParaRetry(@Param("dataLimite") OffsetDateTime dataLimite);
}
