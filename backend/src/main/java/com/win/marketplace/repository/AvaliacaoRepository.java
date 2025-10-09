package com.win.marketplace.repository;

import com.win.marketplace.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {
    List<Avaliacao> findByLojistaId(UUID lojistaId);
    List<Avaliacao> findByClienteId(UUID clienteId);
    List<Avaliacao> findByProdutoId(UUID produtoId);
}

