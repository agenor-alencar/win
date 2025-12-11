package com.win.marketplace.repository;

import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.LojistaErpConfig;
import com.win.marketplace.model.enums.ErpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LojistaErpConfigRepository extends JpaRepository<LojistaErpConfig, UUID> {
    
    /**
     * Busca configuração ERP de um lojista
     */
    Optional<LojistaErpConfig> findByLojistaId(UUID lojistaId);
    
    /**
     * Busca configuração ERP ativa de um lojista
     */
    Optional<LojistaErpConfig> findByLojistaIdAndAtivoTrue(UUID lojistaId);
    
    /**
     * Lista todas as configurações ativas que devem ser sincronizadas
     */
    @Query("SELECT c FROM LojistaErpConfig c WHERE c.ativo = true AND c.syncEnabled = true AND c.erpType != 'MANUAL'")
    List<LojistaErpConfig> findAllActiveForSync();
    
    /**
     * Lista configurações por tipo de ERP
     */
    List<LojistaErpConfig> findByErpTypeAndAtivoTrue(ErpType erpType);
    
    /**
     * Verifica se lojista já tem configuração ERP
     */
    boolean existsByLojistaId(UUID lojistaId);
}
