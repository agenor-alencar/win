package com.sistemawin.repository;

import com.sistemawin.domain.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    // Encontra lojas por um determinado lojista (merchant)
    List<Store> findByMerchantId(Long merchantId);
}
