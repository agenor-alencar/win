package com.win.marketplace.repository;

import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import com.win.marketplace.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioPerfilRepository extends JpaRepository<UsuarioPerfil, UsuarioPerfilId> {
    List<UsuarioPerfil> findByUsuarioId(UUID usuarioId);
    List<UsuarioPerfil> findByPerfilId(UUID perfilId);
    List<UsuarioPerfil> findByUsuarioIdAndPerfilTipo(UUID usuarioId, Perfil.TipoPerfil tipoPerfil);
    boolean existsByUsuarioIdAndPerfilTipo(UUID usuarioId, Perfil.TipoPerfil tipoPerfil);
}
