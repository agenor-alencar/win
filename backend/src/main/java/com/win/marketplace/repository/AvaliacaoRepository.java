package com.win.marketplace.repository;

import com.win.marketplace.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {
    
    List<Avaliacao> findByProdutoId(UUID produtoId);
    
    List<Avaliacao> findByUsuarioId(UUID usuarioId);
    
    List<Avaliacao> findByPedidoId(UUID pedidoId);
    
    boolean existsByUsuarioIdAndPedidoIdAndProdutoId(UUID usuarioId, UUID pedidoId, UUID produtoId);
    
    boolean existsByUsuarioIdAndProdutoIdAndPedidoIsNull(UUID usuarioId, UUID produtoId);
    
    List<Avaliacao> findByProdutoIdOrderByCriadoEmDesc(UUID produtoId);
    
    List<Avaliacao> findByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);
}