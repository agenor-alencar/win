package com.win.marketplace.repository;

import com.win.marketplace.model.UberOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository para gerenciar tokens OAuth da Uber
 */
@Repository
public interface UberOAuthTokenRepository extends JpaRepository<UberOAuthToken, UUID> {
    
    /**
     * Busca o token ativo mais recente para um Customer ID
     * 
     * @param customerId Customer ID da Uber
     * @return Token se encontrado e ainda válido
     */
    @Query("""
        SELECT t FROM UberOAuthToken t 
        WHERE t.customerId = :customerId 
        AND t.ativo = true
        AND t.expiraEm > CURRENT_TIMESTAMP
        ORDER BY t.criadoEm DESC
        LIMIT 1
    """)
    Optional<UberOAuthToken> findLatestValidToken(@Param("customerId") String customerId);
    
    /**
     * Busca todos os tokens ativos para um Customer ID
     */
    List<UberOAuthToken> findByCustomerIdAndAtivoTrue(String customerId);
    
    /**
     * Busca tokens expirados para limpeza
     */
    @Query("""
        SELECT t FROM UberOAuthToken t 
        WHERE t.ativo = false 
        AND t.criadoEm < :dataLimite
    """)
    List<UberOAuthToken> findExiredTokensBefore(@Param("dataLimite") OffsetDateTime dataLimite);
    
    /**
     * Busca tokens que vão expirar em breve (próximos 5 minutos)
     */
    @Query("""
        SELECT t FROM UberOAuthToken t 
        WHERE t.ativo = true
        AND t.expiraEm BETWEEN CURRENT_TIMESTAMP 
                          AND CURRENT_TIMESTAMP + INTERVAL '5 minutes'
    """)
    List<UberOAuthToken> findTokensExpiringsoon();
}
