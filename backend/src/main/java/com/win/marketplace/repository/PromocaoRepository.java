package com.win.marketplace.repository;

import com.win.marketplace.model.Promocao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PromocaoRepository extends JpaRepository<Promocao, UUID> {
    
    /**
     * Busca promoções de um produto
     */
    List<Promocao> findByProdutoId(UUID produtoId);
    
    /**
     * Busca promoções ativas
     */
    List<Promocao> findByAtivaTrue();
    
    /**
     * Busca promoções inativas
     */
    List<Promocao> findByAtivaFalse();
    
    /**
     * Busca promoções por status ativo
     */
    List<Promocao> findByAtiva(Boolean ativa);
    
    /**
     * Busca promoções vigentes (dentro do período)
     * dataInicio <= dataAtual <= dataFim
     */
    @Query("SELECT p FROM Promocao p WHERE p.dataInicio <= :dataAtual AND p.dataFim >= :dataAtual")
    List<Promocao> findPromocoesVigentes(@Param("dataAtual") OffsetDateTime dataAtual);
    
    /**
     * Busca promoções vigentes e ativas
     */
    @Query("SELECT p FROM Promocao p WHERE p.dataInicio <= :dataAtual AND p.dataFim >= :dataAtual AND p.ativa = true")
    List<Promocao> findPromocoesVigentesAtivas(@Param("dataAtual") OffsetDateTime dataAtual);
    
    /**
     * Busca promoções que se sobrepõem a um período (para verificar conflitos)
     * Retorna promoções onde:
     * - dataInicio da promoção <= dataFim do período buscado
     * - dataFim da promoção >= dataInicio do período buscado
     */
    @Query("SELECT p FROM Promocao p WHERE p.dataInicio <= :dataFimPeriodo AND p.dataFim >= :dataInicioPeriodo")
    List<Promocao> findPromocoesSobrepostas(
        @Param("dataInicioPeriodo") OffsetDateTime dataInicioPeriodo,
        @Param("dataFimPeriodo") OffsetDateTime dataFimPeriodo
    );
    
    /**
     * Busca promoções ativas de um produto que se sobrepõem a um período
     */
    @Query("SELECT p FROM Promocao p WHERE p.produto.id = :produtoId AND p.ativa = true " +
           "AND p.dataInicio <= :dataFimPeriodo AND p.dataFim >= :dataInicioPeriodo")
    List<Promocao> findPromocoesSobrepostasAtivasPorProduto(
        @Param("produtoId") UUID produtoId,
        @Param("dataInicioPeriodo") OffsetDateTime dataInicioPeriodo,
        @Param("dataFimPeriodo") OffsetDateTime dataFimPeriodo
    );
    
    /**
     * Busca promoções que iniciam após uma data
     */
    List<Promocao> findByDataInicioAfter(OffsetDateTime dataInicio);
    
    /**
     * Busca promoções que terminam antes de uma data
     */
    List<Promocao> findByDataFimBefore(OffsetDateTime dataFim);
    
    /**
     * Busca promoções expiradas e ativas (para desativar automaticamente)
     */
    @Query("SELECT p FROM Promocao p WHERE p.ativa = true AND p.dataFim < :dataAtual")
    List<Promocao> findPromocoesExpiradas(@Param("dataAtual") OffsetDateTime dataAtual);
    
    /**
     * Busca promoções de um produto ordenadas por data de início
     */
    List<Promocao> findByProdutoIdOrderByDataInicioDesc(UUID produtoId);
    
    /**
     * Busca promoções ativas de um produto
     */
    List<Promocao> findByProdutoIdAndAtivaTrue(UUID produtoId);
    
    /**
     * Conta promoções ativas
     */
    Long countByAtivaTrue();
    
    /**
     * Verifica se existe promoção ativa para um produto
     */
    boolean existsByProdutoIdAndAtivaTrue(UUID produtoId);
    
    /**
     * Desativa todas as promoções de um produto
     */
    @Modifying
    @Query("UPDATE Promocao p SET p.ativa = false WHERE p.produto.id = :produtoId")
    void desativarTodasPorProduto(@Param("produtoId") UUID produtoId);
    
    /**
     * Desativa promoções expiradas
     */
    @Modifying
    @Query("UPDATE Promocao p SET p.ativa = false WHERE p.ativa = true AND p.dataFim < :dataAtual")
    int desativarPromocoesExpiradas(@Param("dataAtual") OffsetDateTime dataAtual);
}
