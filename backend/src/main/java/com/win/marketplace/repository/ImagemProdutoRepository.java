package com.win.marketplace.repository;

import com.win.marketplace.model.ImagemProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImagemProdutoRepository extends JpaRepository<ImagemProduto, UUID> {
    List<ImagemProduto> findByProdutoIdOrderByOrdemExibicao(UUID produtoId);
    void deleteByProdutoId(UUID produtoId);
}
