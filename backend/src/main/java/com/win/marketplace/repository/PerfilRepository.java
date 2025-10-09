package com.win.marketplace.repository;

import com.win.marketplace.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, UUID> {
    Optional<Perfil> findByTipo(Perfil.TipoPerfil tipo);
    List<Perfil> findByAtivoTrue();
}
