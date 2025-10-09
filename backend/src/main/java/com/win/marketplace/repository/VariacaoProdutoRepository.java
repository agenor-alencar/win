package com.win.marketplace.repository;

import com.win.marketplace.model.VariacaoProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VariacaoProdutoRepository extends JpaRepository<VariacaoProduto, UUID> {
    List<VariacaoProduto> findByProdutoId(UUID produtoId);
    List<VariacaoProduto> findByProdutoIdAndAtivoTrue(UUID produtoId);
}
