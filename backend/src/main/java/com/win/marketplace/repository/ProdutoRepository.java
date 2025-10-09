package com.win.marketplace.repository;

import com.win.marketplace.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
    List<Produto> findByLojistaId(UUID lojistaId);
    List<Produto> findByCategoriaId(UUID categoriaId);
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    List<Produto> findByStatus(Produto.StatusProduto status);
    Page<Produto> findByStatusOrderByDataCriacaoDesc(Produto.StatusProduto status, Pageable pageable);
}
