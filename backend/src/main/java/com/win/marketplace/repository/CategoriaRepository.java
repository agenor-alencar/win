package com.win.marketplace.repository;

import com.win.marketplace.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    List<Categoria> findByCategoriaPaiIsNull();
    List<Categoria> findByCategoriaPaiId(UUID categoriaPaiId);
    List<Categoria> findByNomeContainingIgnoreCase(String nome);
    Optional<Categoria> findByNome(String nome);
}

