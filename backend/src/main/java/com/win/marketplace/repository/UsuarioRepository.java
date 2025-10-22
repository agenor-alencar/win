package com.win.marketplace.repository;

import com.win.marketplace.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    
    /**
     * Busca usuário por email
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Busca usuário por email com perfis carregados (EAGER)
     * Usado para autenticação JWT
     */
    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.usuarioPerfis up LEFT JOIN FETCH up.perfil WHERE u.email = :email")
    Optional<Usuario> findByEmailWithPerfis(@Param("email") String email);
    
    /**
     * Busca nomes dos perfis de um usuário diretamente
     * Usado para evitar ConcurrentModificationException com collections Hibernate
     */
    @Query("SELECT p.nome FROM Usuario u JOIN u.usuarioPerfis up JOIN up.perfil p WHERE u.email = :email")
    List<String> findPerfisByEmail(@Param("email") String email);
    
    /**
     * Busca usuário por CPF
     */
    Optional<Usuario> findByCpf(String cpf);
    
    /**
     * Lista todos os usuários ativos
     */
    List<Usuario> findByAtivoTrue();
    
    /**
     * Lista todos os usuários inativos
     */
    List<Usuario> findByAtivoFalse();
    
    /**
     * Lista usuários por status ativo/inativo
     */
    List<Usuario> findByAtivo(Boolean ativo);
    
    /**
     * Verifica se existe usuário com o email
     */
    boolean existsByEmail(String email);
    
    /**
     * Verifica se existe usuário com o CPF
     */
    boolean existsByCpf(String cpf);
    
    /**
     * Busca usuários cujo nome contém o texto (case-insensitive)
     */
    List<Usuario> findByNomeContainingIgnoreCase(String nome);
    
    /**
     * Busca usuários ativos cujo nome contém o texto
     */
    List<Usuario> findByAtivoTrueAndNomeContainingIgnoreCase(String nome);
    
    /**
     * Atualiza o último acesso do usuário
     */
    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcesso = :dataAcesso WHERE u.id = :usuarioId")
    void atualizarUltimoAcesso(@Param("usuarioId") UUID usuarioId, @Param("dataAcesso") OffsetDateTime dataAcesso);
    
    /**
     * Ativa um usuário
     */
    @Modifying
    @Query("UPDATE Usuario u SET u.ativo = true WHERE u.id = :usuarioId")
    void ativarUsuario(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Desativa um usuário
     */
    @Modifying
    @Query("UPDATE Usuario u SET u.ativo = false WHERE u.id = :usuarioId")
    void desativarUsuario(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Conta usuários ativos
     */
    Long countByAtivoTrue();
    
    /**
     * Conta usuários inativos
     */
    Long countByAtivoFalse();
}
