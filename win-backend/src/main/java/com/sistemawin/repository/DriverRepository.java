package com.sistemawin.repository;

import com.sistemawin.domain.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    // Métodos adicionais específicos para Driver, se necessário
}
