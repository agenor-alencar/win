package com.win.marketplace.controller;

import com.win.marketplace.dto.request.FavoritoRequestDTO;
import com.win.marketplace.dto.response.FavoritoResponseDTO;
import com.win.marketplace.service.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller para gerenciamento de produtos favoritos
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/favoritos")
@RequiredArgsConstructor
@Tag(name = "Favoritos", description = "Endpoints para gerenciar produtos favoritos do usuário")
public class FavoritoController {

    private final FavoritoService favoritoService;

    /**
     * Lista todos os favoritos do usuário autenticado
     */
    @GetMapping("/meus")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Meus favoritos", description = "Lista todos os produtos favoritos do usuário autenticado")
    public ResponseEntity<List<FavoritoResponseDTO>> listarMeusFavoritos() {
        log.info("GET /api/v1/favoritos/meus - Listando favoritos do usuário");
        List<FavoritoResponseDTO> favoritos = favoritoService.listarMeusFavoritos();
        return ResponseEntity.ok(favoritos);
    }

    /**
     * Adiciona um produto aos favoritos
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Adicionar favorito", description = "Adiciona um produto aos favoritos")
    public ResponseEntity<FavoritoResponseDTO> adicionarFavorito(
            @Valid @RequestBody FavoritoRequestDTO request) {
        log.info("POST /api/v1/favoritos - Adicionando produto aos favoritos");
        FavoritoResponseDTO favorito = favoritoService.adicionarFavorito(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(favorito);
    }

    /**
     * Remove um produto dos favoritos
     */
    @DeleteMapping("/{produtoId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remover favorito", description = "Remove um produto dos favoritos")
    public ResponseEntity<Void> removerFavorito(@PathVariable UUID produtoId) {
        log.info("DELETE /api/v1/favoritos/{} - Removendo produto dos favoritos", produtoId);
        favoritoService.removerFavorito(produtoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verifica se um produto está nos favoritos
     */
    @GetMapping("/verifica/{produtoId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verificar favorito", description = "Verifica se um produto está nos favoritos")
    public ResponseEntity<Boolean> verificarFavorito(@PathVariable UUID produtoId) {
        log.info("GET /api/v1/favoritos/verifica/{} - Verificando se produto é favorito", produtoId);
        boolean isFavorito = favoritoService.isFavorito(produtoId);
        return ResponseEntity.ok(isFavorito);
    }
}
