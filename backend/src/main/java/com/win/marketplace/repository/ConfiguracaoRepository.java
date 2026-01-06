package com.win.marketplace.repository;

import com.win.marketplace.model.Configuracao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfiguracaoRepository extends JpaRepository<Configuracao, UUID> {
    
    /**
     * Busca a configuração ativa do sistema
     */
    @Query("SELECT c FROM Configuracao c WHERE c.ativo = true ORDER BY c.criadoEm DESC")
    Optional<Configuracao> findConfigAtiva();
}
