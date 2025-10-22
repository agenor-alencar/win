package com.win.marketplace.repository;

import com.win.marketplace.model.Lojista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LojistaRepository extends JpaRepository<Lojista, UUID> {
    
    Optional<Lojista> findByUsuarioId(UUID usuarioId);
    
    Optional<Lojista> findByCnpj(String cnpj);
    
    boolean existsByCnpj(String cnpj);
    
    List<Lojista> findByAtivoTrue();
    
    List<Lojista> findByNomeFantasiaContainingIgnoreCase(String nomeFantasia);
}
