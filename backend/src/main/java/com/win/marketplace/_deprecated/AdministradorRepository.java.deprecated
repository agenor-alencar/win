package com.win.marketplace.repository;

import com.win.marketplace.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, UUID> {
    Optional<Administrador> findByUsuarioId(UUID usuarioId);
    List<Administrador> findByUsuarioAtivoTrue();
}
