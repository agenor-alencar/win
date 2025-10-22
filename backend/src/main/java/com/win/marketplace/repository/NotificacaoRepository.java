package com.win.marketplace.repository;

import com.win.marketplace.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {
    
    /**
     * Busca notificações de um usuário
     */
    List<Notificacao> findByUsuarioId(UUID usuarioId);
    
    /**
     * Busca notificações de um usuário ordenadas por data de criação (mais recente primeiro)
     */
    List<Notificacao> findByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);
    
    /**
     * Busca notificações não lidas de um usuário ordenadas por data
     */
    List<Notificacao> findByUsuarioIdAndLidaFalseOrderByCriadoEmDesc(UUID usuarioId);
    
    /**
     * Busca notificações lidas de um usuário ordenadas por data
     */
    List<Notificacao> findByUsuarioIdAndLidaTrueOrderByCriadoEmDesc(UUID usuarioId);
    
    /**
     * Conta notificações não lidas de um usuário
     */
    Long countByUsuarioIdAndLidaFalse(UUID usuarioId);
    
    /**
     * Busca notificações por tipo
     */
    List<Notificacao> findByTipo(String tipo);
    
    /**
     * Busca notificações por canal
     */
    List<Notificacao> findByCanal(String canal);
    
    /**
     * Busca notificações de um usuário por tipo
     */
    List<Notificacao> findByUsuarioIdAndTipo(UUID usuarioId, String tipo);
    
    /**
     * Busca notificações de um usuário por canal
     */
    List<Notificacao> findByUsuarioIdAndCanal(UUID usuarioId, String canal);
    
    /**
     * Deleta todas as notificações de um usuário
     */
    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.usuario.id = :usuarioId")
    void deleteByUsuarioId(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Deleta todas as notificações lidas de um usuário
     */
    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.usuario.id = :usuarioId AND n.lida = true")
    void deleteByUsuarioIdAndLidaTrue(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Marca todas as notificações de um usuário como lidas
     */
    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true, n.dataLeitura = CURRENT_TIMESTAMP WHERE n.usuario.id = :usuarioId AND n.lida = false")
    void marcarTodasComoLidasByUsuarioId(@Param("usuarioId") UUID usuarioId);
    
    /**
     * Verifica se usuário tem notificações não lidas
     */
    boolean existsByUsuarioIdAndLidaFalse(UUID usuarioId);
    
    /**
     * Busca últimas N notificações de um usuário
     */
    @Query("SELECT n FROM Notificacao n WHERE n.usuario.id = :usuarioId ORDER BY n.criadoEm DESC LIMIT :limit")
    List<Notificacao> findTopNByUsuarioId(@Param("usuarioId") UUID usuarioId, @Param("limit") int limit);
}
