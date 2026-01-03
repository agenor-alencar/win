package com.win.marketplace.repository;

import com.win.marketplace.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository para operações de banco de dados com Banner
 */
@Repository
public interface BannerRepository extends JpaRepository<Banner, UUID> {

    /**
     * Busca todos os banners ativos ordenados por ordem
     */
    List<Banner> findByAtivoTrueOrderByOrdemAsc();

    /**
     * Busca todos os banners ordenados por ordem (incluindo inativos, para admin)
     */
    List<Banner> findAllByOrderByOrdemAsc();
}
