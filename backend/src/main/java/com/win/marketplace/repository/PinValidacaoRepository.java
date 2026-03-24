package com.win.marketplace.repository;

import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.PinValidacao;
import com.win.marketplace.model.enums.TipoPinValidacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository para acesso a dados de PinValidacao.
 */
@Repository
public interface PinValidacaoRepository extends JpaRepository<PinValidacao, UUID> {

    /**
     * Busca o PIN de validação ativo (não validado ainda) para uma entrega específica.
     * 
     * @param entrega A entrega
     * @param tipo Tipo de PIN (COLETA ou ENTREGA)
     * @return Optional contendo o PIN se existir
     */
    Optional<PinValidacao> findByEntregaAndTipoPinValidacaoAndValidadoFalse(
            Entrega entrega, 
            TipoPinValidacao tipo
    );

    /**
     * Busca todos os PINs de uma entrega específica.
     * 
     * @param entregaId ID da entrega
     * @return Lista de PINs associados à entrega
     */
    List<PinValidacao> findByEntregaId(UUID entregaId);

    /**
     * Busca PINs que já expiraram e ainda não foram validados.
     * 
     * @param agora Data/hora atual
     * @return Lista de PINs expirados
     */
    @Query("""
        SELECT p FROM PinValidacao p 
        WHERE p.expiraEm < :agora AND p.validado = false
    """)
    List<PinValidacao> findExpiredUnvalidatedPins(@Param("agora") OffsetDateTime agora);

    /**
     * Busca tentativas de validação recentes para calcular brute force.
     * 
     * @param entregaId ID da entrega
     * @param tipo Tipo de PIN
     * @param desde Data/hora de início da busca
     * @return Lista de tentativas recentes
     */
    @Query("""
        SELECT p FROM PinValidacao p 
        WHERE p.entrega.id = :entregaId 
        AND p.tipoPinValidacao = :tipo 
        AND p.atualizadoEm >= :desde
        ORDER BY p.atualizadoEm DESC
    """)
    List<PinValidacao> findRecentAttempts(
            @Param("entregaId") UUID entregaId,
            @Param("tipo") TipoPinValidacao tipo,
            @Param("desde") OffsetDateTime desde
    );

    /**
     * Conta quantas tentativas falhadas existem para uma entrega/tipo de PIN.
     * 
     * @param entregaId ID da entrega
     * @param tipo Tipo de PIN
     * @return Número de tentativas falhadas
     */
    @Query("""
        SELECT COUNT(p) FROM PinValidacao p 
        WHERE p.entrega.id = :entregaId 
        AND p.tipoPinValidacao = :tipo 
        AND p.validado = false
        AND p.numeroTentativas > 0
    """)
    long countFailedAttempts(
            @Param("entregaId") UUID entregaId,
            @Param("tipo") TipoPinValidacao tipo
    );
}
