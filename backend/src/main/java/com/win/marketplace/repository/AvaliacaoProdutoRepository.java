package com.win.marketplace.repository;

import com.win.marketplace.model.AvaliacaoProduto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvaliacaoProdutoRepository extends JpaRepository<AvaliacaoProduto, UUID> {
    
    /**
     * Busca avaliações de um produto específico
     */
    Page<AvaliacaoProduto> findByProdutoId(UUID produtoId, Pageable pageable);
    
    /**
     * Busca avaliações feitas por um usuário
     */
    List<AvaliacaoProduto> findByUsuarioId(UUID usuarioId);
    
    /**
     * Busca avaliação de um usuário para um produto específico
     */
    Optional<AvaliacaoProduto> findByProdutoIdAndUsuarioId(UUID produtoId, UUID usuarioId);
    
    /**
     * Verifica se usuário já avaliou o produto
     */
    boolean existsByProdutoIdAndUsuarioId(UUID produtoId, UUID usuarioId);
    
    /**
     * Busca avaliações com nota específica
     */
    List<AvaliacaoProduto> findByProdutoIdAndNota(UUID produtoId, Integer nota);
    
    /**
     * Conta quantas avaliações tem um produto
     */
    long countByProdutoId(UUID produtoId);
    
    /**
     * Calcula média de avaliações de um produto
     */
    @Query("SELECT AVG(a.nota) FROM AvaliacaoProduto a WHERE a.produto.id = :produtoId")
    Double calcularMediaAvaliacoes(@Param("produtoId") UUID produtoId);
}
