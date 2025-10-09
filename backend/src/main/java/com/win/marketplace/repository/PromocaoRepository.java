package com.win.marketplace.repository;

import com.win.marketplace.model.Promocao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PromocaoRepository extends JpaRepository<Promocao, UUID> {
    List<Promocao> findByProdutoId(UUID produtoId);
    List<Promocao> findByAtivaTrue();
    List<Promocao> findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(LocalDateTime inicio, LocalDateTime fim);
}
