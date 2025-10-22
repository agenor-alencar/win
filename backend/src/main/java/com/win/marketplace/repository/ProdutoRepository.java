package com.win.marketplace.repository;

import com.win.marketplace.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    
    /**
     * Busca produtos ativos ordenados por data de criação
     */
    Page<Produto> findByAtivoTrueOrderByCriadoEmDesc(Pageable pageable);
    
    /**
     * Busca produtos por lojista
     */
    List<Produto> findByLojistaId(UUID lojistaId);
    
    /**
     * Busca produtos por categoria (apenas ativos)
     */
    List<Produto> findByCategoriaIdAndAtivoTrue(UUID categoriaId);
    
    /**
     * Busca produtos por nome (busca parcial, case insensitive, apenas ativos)
     */
    List<Produto> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);
    
    /**
     * Conta quantos itens de pedido estão associados a este produto
     */
    @Query("SELECT COUNT(ip) FROM ItemPedido ip WHERE ip.produto.id = :produtoId")
    long countItensPedidoByProdutoId(@Param("produtoId") UUID produtoId);
    
    /**
     * Busca produtos com estoque baixo
     */
    @Query("SELECT p FROM Produto p WHERE p.estoque <= :quantidade AND p.ativo = true")
    List<Produto> findProdutosComEstoqueBaixo(@Param("quantidade") Integer quantidade);
    
    /**
     * Busca produtos mais vendidos (baseado em quantidade de itens de pedido)
     */
    @Query("SELECT p FROM Produto p " +
           "LEFT JOIN ItemPedido ip ON p.id = ip.produto.id " +
           "WHERE p.ativo = true " +
           "GROUP BY p.id " +
           "ORDER BY COUNT(ip.id) DESC")
    List<Produto> findProdutosMaisVendidos(Pageable pageable);
    
    /**
     * Busca produtos mais bem avaliados
     */
    @Query("SELECT p FROM Produto p " +
           "WHERE p.ativo = true AND p.quantidadeAvaliacoes > 0 " +
           "ORDER BY p.avaliacao DESC, p.quantidadeAvaliacoes DESC")
    List<Produto> findProdutosMaisAvaliados(Pageable pageable);
}
