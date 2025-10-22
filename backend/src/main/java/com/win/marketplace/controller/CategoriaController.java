package com.win.marketplace.controller;

import com.win.marketplace.dto.request.CategoriaCreateRequestDTO;
import com.win.marketplace.dto.response.CategoriaResponseDTO;
import com.win.marketplace.service.CategoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller de Categorias
 * 
 * Permissões:
 * - Criar/Editar/Deletar: Apenas ADMIN
 * - Listar/Buscar: Público (já está liberado no SecurityConfig)
 */
@RestController
@RequestMapping("/api/v1/categoria")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    /**
     * Criar categoria - Apenas ADMIN
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaResponseDTO> criarCategoria(@RequestBody CategoriaCreateRequestDTO requestDTO) {
        CategoriaResponseDTO response = categoriaService.criarCategoria(requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Criar subcategoria - Apenas ADMIN
     */
    @PostMapping("/create/sub/{categoriaPaiId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaResponseDTO> criarSubCategoria(@PathVariable UUID categoriaPaiId, @RequestBody CategoriaCreateRequestDTO requestDTO) {
        CategoriaResponseDTO response = categoriaService.criarSubCategoria(categoriaPaiId, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<CategoriaResponseDTO>> listarCategorias() {
        List<CategoriaResponseDTO> categorias = categoriaService.listarCategorias();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/list/principais")
    public ResponseEntity<List<CategoriaResponseDTO>> listarCategoriasPrincipais() {
        List<CategoriaResponseDTO> categorias = categoriaService.listarCategoriasPrincipais();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/list/sub/{categoriaPaiId}")
    public ResponseEntity<List<CategoriaResponseDTO>> listarSubCategorias(@PathVariable UUID categoriaPaiId) {
        List<CategoriaResponseDTO> categorias = categoriaService.listarSubCategorias(categoriaPaiId);
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable UUID id) {
        CategoriaResponseDTO categoria = categoriaService.buscarPorId(id);
        return ResponseEntity.ok(categoria);
    }

    @GetMapping("/list/nome")
    public ResponseEntity<List<CategoriaResponseDTO>> buscarPorNome(@RequestParam String nome) {
        List<CategoriaResponseDTO> categorias = categoriaService.buscarPorNome(nome);
        return ResponseEntity.ok(categorias);
    }

    /**
     * Atualizar categoria - Apenas ADMIN
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaResponseDTO> atualizarCategoria(@PathVariable UUID id, @RequestBody CategoriaCreateRequestDTO requestDTO) {
        CategoriaResponseDTO categoria = categoriaService.atualizarCategoria(id, requestDTO);
        return ResponseEntity.ok(categoria);
    }

    /**
     * Deletar categoria - Apenas ADMIN
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarCategoria(@PathVariable UUID id) {
        categoriaService.deletarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}

