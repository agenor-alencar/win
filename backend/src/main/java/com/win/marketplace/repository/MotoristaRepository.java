package com.win.marketplace.repository;

import com.win.marketplace.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, UUID> {
    Optional<Motorista> findByUsuarioId(UUID usuarioId);
    Optional<Motorista> findByCnh(String cnh);
    List<Motorista> findByDisponivelTrueAndAtivoTrue();
}
