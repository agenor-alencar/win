package com.win.marketplace.controller;

import com.win.marketplace.dto.request.AvaliacaoProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.AvaliacaoProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoProdutoResponseDTO;
import com.win.marketplace.service.AvaliacaoProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/avaliacoes-produtos")
@RequiredArgsConstructor
@Tag(name = "Avaliações de Produtos", description = "Endpoints para gerenciamento de avaliações de produtos")
public class AvaliacaoProdutoController {

    private final AvaliacaoProdutoService avaliacaoService;

    /**
     * Cria uma nova avaliação
     */
    @PostMapping("/usuario/{usuarioId}")
    @Operation(summary = "Criar avaliação", description = "Cria uma nova avaliação para um produto")
    public ResponseEntity<AvaliacaoProdutoResponseDTO> criar(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Valid @RequestBody AvaliacaoProdutoCreateRequestDTO requestDTO) {
        
        log.info("POST /api/v1/avaliacoes/usuario/{} - Criando avaliação", usuarioId);
        AvaliacaoProdutoResponseDTO response = avaliacaoService.criar(usuarioId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista avaliações de um produto
     */
    @GetMapping("/produto/{produtoId}")
    @Operation(summary = "Listar avaliações do produto", description = "Lista todas as avaliações de um produto específico")
    public ResponseEntity<Page<AvaliacaoProdutoResponseDTO>> listarPorProduto(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        
        log.info("GET /api/v1/avaliacoes/produto/{}", produtoId);
        Page<AvaliacaoProdutoResponseDTO> avaliacoes = avaliacaoService.listarPorProduto(produtoId, pageable);
        return ResponseEntity.ok(avaliacoes);
    }

    /**
     * Lista avaliações feitas por um usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar avaliações do usuário", description = "Lista todas as avaliações feitas por um usuário")
    public ResponseEntity<List<AvaliacaoProdutoResponseDTO>> listarPorUsuario(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/avaliacoes/usuario/{}", usuarioId);
        List<AvaliacaoProdutoResponseDTO> avaliacoes = avaliacaoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(avaliacoes);
    }

    /**
     * Busca avaliação por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar avaliação por ID", description = "Retorna uma avaliação específica")
    public ResponseEntity<AvaliacaoProdutoResponseDTO> buscarPorId(
            @Parameter(description = "ID da avaliação") @PathVariable UUID id) {
        
        log.info("GET /api/v1/avaliacoes/{}", id);
        AvaliacaoProdutoResponseDTO avaliacao = avaliacaoService.buscarPorId(id);
        return ResponseEntity.ok(avaliacao);
    }

    /**
     * Atualiza avaliação
     */
    @PutMapping("/{id}/usuario/{usuarioId}")
    @Operation(summary = "Atualizar avaliação", description = "Atualiza uma avaliação existente (apenas o próprio usuário)")
    public ResponseEntity<AvaliacaoProdutoResponseDTO> atualizar(
            @Parameter(description = "ID da avaliação") @PathVariable UUID id,
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Valid @RequestBody AvaliacaoProdutoUpdateRequestDTO requestDTO) {
        
        log.info("PUT /api/v1/avaliacoes/{}/usuario/{}", id, usuarioId);
        AvaliacaoProdutoResponseDTO avaliacao = avaliacaoService.atualizar(id, usuarioId, requestDTO);
        return ResponseEntity.ok(avaliacao);
    }

    /**
     * Deleta avaliação
     */
    @DeleteMapping("/{id}/usuario/{usuarioId}")
    @Operation(summary = "Deletar avaliação", description = "Remove uma avaliação (apenas o próprio usuário)")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID da avaliação") @PathVariable UUID id,
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("DELETE /api/v1/avaliacoes/{}/usuario/{}", id, usuarioId);
        avaliacaoService.deletar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
