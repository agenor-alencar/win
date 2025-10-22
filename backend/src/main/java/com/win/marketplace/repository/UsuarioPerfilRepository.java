package com.win.marketplace.repository;

import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioPerfilRepository extends JpaRepository<UsuarioPerfil, UsuarioPerfilId> {
    
    /**
     * Busca todos os perfis de um usuário
     */
    List<UsuarioPerfil> findByUsuarioId(UUID usuarioId);
    
    /**
     * Busca todos os usuários com um determinado perfil
     */
    List<UsuarioPerfil> findByPerfilId(UUID perfilId);
    
    /**
     * Busca perfis de um usuário pelo nome do perfil (ex: "ADMIN", "CLIENTE")
     */
    @Query("SELECT up FROM UsuarioPerfil up WHERE up.usuario.id = :usuarioId AND up.perfil.nome = :nomePerfil")
    List<UsuarioPerfil> findByUsuarioIdAndPerfilNome(
            @Param("usuarioId") UUID usuarioId, 
            @Param("nomePerfil") String nomePerfil
    );
    
    /**
     * Verifica se usuário tem um perfil específico pelo nome
     */
    @Query("SELECT COUNT(up) > 0 FROM UsuarioPerfil up WHERE up.usuario.id = :usuarioId AND up.perfil.nome = :nomePerfil")
    boolean existsByUsuarioIdAndPerfilNome(
            @Param("usuarioId") UUID usuarioId, 
            @Param("nomePerfil") String nomePerfil
    );
    
    /**
     * Busca usuários ativos com um determinado perfil
     */
    @Query("SELECT up FROM UsuarioPerfil up " +
           "WHERE up.perfil.nome = :nomePerfil " +
           "AND up.usuario.ativo = true " +
           "AND up.perfil.ativo = true")
    List<UsuarioPerfil> findUsuariosAtivosByPerfilNome(@Param("nomePerfil") String nomePerfil);
    
    /**
     * Conta quantos usuários tem um determinado perfil
     */
    @Query("SELECT COUNT(up) FROM UsuarioPerfil up WHERE up.perfil.nome = :nomePerfil")
    long countByPerfilNome(@Param("nomePerfil") String nomePerfil);
    
    /**
     * Verifica se usuário tem perfil de ADMIN
     */
    @Query("SELECT COUNT(up) > 0 FROM UsuarioPerfil up " +
           "WHERE up.usuario.id = :usuarioId " +
           "AND up.perfil.nome = 'ADMIN'")
    boolean isUsuarioAdmin(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Verifica se usuário tem perfil de LOJISTA
     */
    @Query("SELECT COUNT(up) > 0 FROM UsuarioPerfil up " +
           "WHERE up.usuario.id = :usuarioId " +
           "AND up.perfil.nome = 'LOJISTA'")
    boolean isUsuarioLojista(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Verifica se usuário tem perfil de MOTORISTA
     */
    @Query("SELECT COUNT(up) > 0 FROM UsuarioPerfil up " +
           "WHERE up.usuario.id = :usuarioId " +
           "AND up.perfil.nome = 'MOTORISTA'")
    boolean isUsuarioMotorista(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Verifica se usuário tem perfil de CLIENTE
     */
    @Query("SELECT COUNT(up) > 0 FROM UsuarioPerfil up " +
           "WHERE up.usuario.id = :usuarioId " +
           "AND up.perfil.nome = 'CLIENTE'")
    boolean isUsuarioCliente(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Deleta todos os perfis de um usuário
     */
    void deleteByUsuarioId(UUID usuarioId);
    
    /**
     * Deleta todos os usuários de um perfil
     */
    void deleteByPerfilId(UUID perfilId);
}
