package com.win.marketplace.repository;

import com.win.marketplace.model.NotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, UUID> {
    Optional<NotaFiscal> findByPedidoId(UUID pedidoId);
    List<NotaFiscal> findByLojistaId(UUID lojistaId);
    Optional<NotaFiscal> findByNumero(String numero);
}
