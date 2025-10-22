package com.win.marketplace.repository;

import com.win.marketplace.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, UUID> {
    
    Optional<Perfil> findByNome(String nome);
    
    List<Perfil> findByAtivoTrue();
    
    @Query("SELECT COUNT(up) FROM UsuarioPerfil up WHERE up.perfil.id = :perfilId")
    long countUsuariosByPerfilId(@Param("perfilId") UUID perfilId);
}
