package com.win.marketplace.repository;

import com.win.marketplace.model.Favorito;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, UUID> {
    
    List<Favorito> findByUsuarioOrderByCriadoEmDesc(Usuario usuario);
    
    Optional<Favorito> findByUsuarioAndProduto(Usuario usuario, Produto produto);
    
    boolean existsByUsuarioAndProduto(Usuario usuario, Produto produto);
    
    void deleteByUsuarioAndProduto(Usuario usuario, Produto produto);
    
    long countByUsuario(Usuario usuario);
}
