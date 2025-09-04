package com.sistemawin.repository;

import com.sistemawin.domain.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    // Métodos adicionais específicos para Merchant, se necessário
}
