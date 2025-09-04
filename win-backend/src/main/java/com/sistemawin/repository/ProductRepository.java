package com.sistemawin.repository;

import com.sistemawin.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Encontra produtos por uma determinada loja
    List<Product> findByStoreId(Long storeId);
}
