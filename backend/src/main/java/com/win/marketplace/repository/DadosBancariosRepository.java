package com.win.marketplace.repository;

import com.win.marketplace.model.DadosBancarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DadosBancariosRepository extends JpaRepository<DadosBancarios, UUID> {
    
    Optional<DadosBancarios> findByLojistaId(UUID lojistaId);
    
    boolean existsByLojistaId(UUID lojistaId);
}
