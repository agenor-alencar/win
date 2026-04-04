package com.win.marketplace.repository;

import com.win.marketplace.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    
    /**
     * Busca produtos ativos ordenados por data de criação
     * ✅ FIX-004: @EntityGraph carrega Lojista + Categoria em uma query (evita N+1)
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    Page<Produto> findByAtivoTrueOrderByCriadoEmDesc(Pageable pageable);
    
    /**
     * Busca produtos por lojista
     * ✅ FIX-004: @EntityGraph carrega Lojista + Categoria
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    List<Produto> findByLojistaId(UUID lojistaId);
    
    /**
     * Busca produtos ativos por lojista ordenados por data de criação
     * ✅ FIX-004: @EntityGraph otimiza queries de relacionamento
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    List<Produto> findByLojistaIdAndAtivoTrueOrderByCriadoEmDesc(UUID lojistaId, Pageable pageable);
    
    /**
     * Busca produtos ativos por lojista excluindo IDs específicos (para sugestões)
     * ✅ FIX-004: @EntityGraph reduz queries de 1+N para 1-2
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    List<Produto> findByLojistaIdAndAtivoTrueAndIdNotInOrderByCriadoEmDesc(UUID lojistaId, List<UUID> excluirIds, Pageable pageable);
    
    /**
     * Busca produtos por categoria (apenas ativos)
     * ✅ FIX-004: @EntityGraph carrega Categoria + Lojista
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    List<Produto> findByCategoriaIdAndAtivoTrue(UUID categoriaId);
    
    /**
     * Busca produtos por nome (busca parcial, case insensitive, apenas ativos)
     * ✅ FIX-004: Carrega relacionamentos mesmo em buscas textuais
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
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
     * ✅ FIX-004: @EntityGraph com @Query para evitar lazy loading em grupo
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    @Query("SELECT p FROM Produto p " +
           "LEFT JOIN ItemPedido ip ON p.id = ip.produto.id " +
           "WHERE p.ativo = true " +
           "GROUP BY p.id " +
           "ORDER BY COUNT(ip.id) DESC")
    List<Produto> findProdutosMaisVendidos(Pageable pageable);
    
    /**
     * Busca produtos mais bem avaliados
     * ✅ FIX-004: @EntityGraph com @Query
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    @Query("SELECT p FROM Produto p " +
           "WHERE p.ativo = true AND p.quantidadeAvaliacoes > 0 " +
           "ORDER BY p.avaliacao DESC, p.quantidadeAvaliacoes DESC")
    List<Produto> findProdutosMaisAvaliados(Pageable pageable);
    
    /**
     * Conta produtos ativos/inativos por lojista
     */
    Long countByLojistaIdAndAtivo(UUID lojistaId, Boolean ativo);
    
    /**
     * Busca produtos de um lojista que estão vinculados a um ERP (possuem erpSku)
     * ✅ FIX-004: @EntityGraph para relacionamentos
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    List<Produto> findByLojistaIdAndErpSkuIsNotNull(UUID lojistaId);
    
    /**
     * ✅ Busca produto por erpSku (para validar duplicação)
     * ✅ FIX-004: @EntityGraph carrega relacionamentos
     */
    @EntityGraph(attributePaths = {"lojista", "categoria"})
    @Query("SELECT p FROM Produto p WHERE p.erpSku = :erpSku")
    Optional<Produto> findByErpSku(@Param("erpSku") String erpSku);
    
    /**
     * Conta produtos por categoria (otimizado para gráficos do dashboard)
     */
    @Query("SELECT COALESCE(c.nome, 'Sem Categoria') as categoria, COUNT(p) as quantidade " +
           "FROM Produto p " +
           "LEFT JOIN p.categoria c " +
           "GROUP BY c.nome " +
           "ORDER BY quantidade DESC")
    List<Object[]> contarProdutosPorCategoria();
}
