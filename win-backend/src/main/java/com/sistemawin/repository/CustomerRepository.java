package com.sistemawin.repository;

import com.sistemawin.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Métodos adicionais específicos para Customer, se necessário
}
