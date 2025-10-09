package com.win.marketplace.repository;

import com.win.marketplace.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {
    List<Notificacao> findByUsuarioIdOrderByDataCriacaoDesc(UUID usuarioId);
    List<Notificacao> findByUsuarioIdAndLidaFalseOrderByDataCriacaoDesc(UUID usuarioId);
    long countByUsuarioIdAndLidaFalse(UUID usuarioId);
}
