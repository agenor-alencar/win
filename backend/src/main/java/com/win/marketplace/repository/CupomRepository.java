package com.win.marketplace.repository;

import com.win.marketplace.model.Cupom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CupomRepository extends JpaRepository<Cupom, UUID> {
    
    Optional<Cupom> findByCodigo(String codigo);
    
    List<Cupom> findByAtivoTrue();
    
    List<Cupom> findByAtivoTrueAndDataInicioBeforeAndDataFimAfter(
            OffsetDateTime dataInicio, 
            OffsetDateTime dataFim
    );
    
    List<Cupom> findByDataFimBefore(OffsetDateTime data);
}

