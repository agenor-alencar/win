package com.win.marketplace.controller;

import com.win.marketplace.dto.request.ProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.ProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.ProdutoResponseDTO;
import com.win.marketplace.dto.response.ProdutoSummaryResponseDTO;
import com.win.marketplace.service.ProdutoService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller de Produtos
 * 
 * Permissões:
 * - Criar/Editar/Deletar/Gerenciar Estoque: LOJISTA ou ADMIN
 * - Listar/Buscar: Público (já está liberado no SecurityConfig)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Endpoints para gerenciamento de produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    /**
     * Cria um novo produto para um lojista - LOJISTA ou ADMIN
     */
    @PostMapping("/lojista/{lojistaId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Criar produto", description = "Cria um novo produto para um lojista específico")
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId,
            @Valid @RequestBody ProdutoCreateRequestDTO requestDTO) {
        
        log.info("POST /api/v1/produtos/lojista/{} - Criando produto", lojistaId);
        ProdutoResponseDTO response = produtoService.criarProduto(lojistaId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista produtos com paginação (apenas ativos)
     */
    @GetMapping
    @Operation(summary = "Listar produtos", description = "Lista todos os produtos ativos com paginação")
    public ResponseEntity<Page<ProdutoSummaryResponseDTO>> listarProdutosPaginados(
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        
        log.info("GET /api/v1/produtos - Página: {}, Tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<ProdutoSummaryResponseDTO> produtos = produtoService.listarProdutosPaginados(pageable);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Lista produtos de um lojista específico
     */
    @GetMapping("/lojista/{lojistaId}")
    @Operation(summary = "Produtos por lojista", description = "Lista todos os produtos de um lojista")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorLojista(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId) {
        
        log.info("GET /api/v1/produtos/lojista/{}", lojistaId);
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosPorLojista(lojistaId);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Lista produtos de uma categoria específica
     */
    @GetMapping("/categoria/{categoriaId}")
    @Operation(summary = "Produtos por categoria", description = "Lista todos os produtos ativos de uma categoria")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorCategoria(
            @Parameter(description = "ID da categoria") @PathVariable UUID categoriaId) {
        
        log.info("GET /api/v1/produtos/categoria/{}", categoriaId);
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosPorCategoria(categoriaId);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Busca produtos por nome (busca parcial)
     */
    @GetMapping("/buscar")
    @Operation(summary = "Buscar produtos", description = "Busca produtos pelo nome (busca parcial, case insensitive)")
    public ResponseEntity<List<ProdutoResponseDTO>> buscarProdutosPorNome(
            @Parameter(description = "Nome ou parte do nome do produto") @RequestParam String nome) {
        
        log.info("GET /api/v1/produtos/buscar?nome={}", nome);
        List<ProdutoResponseDTO> produtos = produtoService.buscarProdutosPorNome(nome);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Busca produto por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID", description = "Retorna detalhes completos de um produto")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(
            @Parameter(description = "ID do produto") @PathVariable UUID id) {
        
        log.info("GET /api/v1/produtos/{}", id);
        ProdutoResponseDTO produto = produtoService.buscarPorId(id);
        return ResponseEntity.ok(produto);
    }

    /**
     * Atualiza dados de um produto - LOJISTA ou ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Atualizar produto", description = "Atualiza informações de um produto existente")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @Parameter(description = "ID do produto") @PathVariable UUID id,
            @Valid @RequestBody ProdutoUpdateRequestDTO requestDTO) {
        
        log.info("PUT /api/v1/produtos/{}", id);
        ProdutoResponseDTO produto = produtoService.atualizarProduto(id, requestDTO);
        return ResponseEntity.ok(produto);
    }

    /**
     * Ativa um produto - LOJISTA ou ADMIN
     */
    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Ativar produto", description = "Ativa um produto que estava inativo")
    public ResponseEntity<ProdutoResponseDTO> ativarProduto(
            @Parameter(description = "ID do produto") @PathVariable UUID id) {
        
        log.info("PATCH /api/v1/produtos/{}/ativar", id);
        ProdutoResponseDTO produto = produtoService.ativarProduto(id);
        return ResponseEntity.ok(produto);
    }

    /**
     * Desativa um produto - LOJISTA ou ADMIN
     */
    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Desativar produto", description = "Desativa um produto (não aparecerá nas listagens públicas)")
    public ResponseEntity<ProdutoResponseDTO> desativarProduto(
            @Parameter(description = "ID do produto") @PathVariable UUID id) {
        
        log.info("PATCH /api/v1/produtos/{}/desativar", id);
        ProdutoResponseDTO produto = produtoService.desativarProduto(id);
        return ResponseEntity.ok(produto);
    }

    /**
     * Atualiza estoque do produto (define novo valor) - LOJISTA ou ADMIN
     */
    @PatchMapping("/{id}/estoque")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Atualizar estoque", description = "Define uma nova quantidade de estoque para o produto")
    public ResponseEntity<ProdutoResponseDTO> atualizarEstoque(
            @Parameter(description = "ID do produto") @PathVariable UUID id,
            @Parameter(description = "Nova quantidade de estoque") @RequestParam Integer quantidade) {
        
        log.info("PATCH /api/v1/produtos/{}/estoque?quantidade={}", id, quantidade);
        ProdutoResponseDTO produto = produtoService.atualizarEstoque(id, quantidade);
        return ResponseEntity.ok(produto);
    }

    /**
     * Incrementa estoque do produto - LOJISTA ou ADMIN
     */
    @PatchMapping("/{id}/estoque/incrementar")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Incrementar estoque", description = "Adiciona unidades ao estoque atual")
    public ResponseEntity<ProdutoResponseDTO> incrementarEstoque(
            @Parameter(description = "ID do produto") @PathVariable UUID id,
            @Parameter(description = "Quantidade a adicionar") @RequestParam Integer quantidade) {
        
        log.info("PATCH /api/v1/produtos/{}/estoque/incrementar?quantidade={}", id, quantidade);
        ProdutoResponseDTO produto = produtoService.incrementarEstoque(id, quantidade);
        return ResponseEntity.ok(produto);
    }

    /**
     * Decrementa estoque do produto - LOJISTA ou ADMIN
     */
    @PatchMapping("/{id}/estoque/decrementar")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Decrementar estoque", description = "Remove unidades do estoque atual")
    public ResponseEntity<ProdutoResponseDTO> decrementarEstoque(
            @Parameter(description = "ID do produto") @PathVariable UUID id,
            @Parameter(description = "Quantidade a remover") @RequestParam Integer quantidade) {
        
        log.info("PATCH /api/v1/produtos/{}/estoque/decrementar?quantidade={}", id, quantidade);
        ProdutoResponseDTO produto = produtoService.decrementarEstoque(id, quantidade);
        return ResponseEntity.ok(produto);
    }

    /**
     * Lista produtos mais vendidos
     */
    @GetMapping("/mais-vendidos")
    @Operation(summary = "Produtos mais vendidos", description = "Lista os produtos mais vendidos")
    public ResponseEntity<List<ProdutoSummaryResponseDTO>> listarMaisVendidos(
            @Parameter(description = "Limite de produtos a retornar") @RequestParam(defaultValue = "10") int limite) {
        
        log.info("GET /api/v1/produtos/mais-vendidos?limite={}", limite);
        List<ProdutoSummaryResponseDTO> produtos = produtoService.listarMaisVendidos(limite);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Lista produtos mais bem avaliados
     */
    @GetMapping("/mais-avaliados")
    @Operation(summary = "Produtos mais avaliados", description = "Lista os produtos com melhor avaliação média")
    public ResponseEntity<List<ProdutoSummaryResponseDTO>> listarMaisAvaliados(
            @Parameter(description = "Limite de produtos a retornar") @RequestParam(defaultValue = "10") int limite) {
        
        log.info("GET /api/v1/produtos/mais-avaliados?limite={}", limite);
        List<ProdutoSummaryResponseDTO> produtos = produtoService.listarMaisAvaliados(limite);
        return ResponseEntity.ok(produtos);
    }

    /**
     * Deleta produto (soft delete - apenas desativa) - LOJISTA ou ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Deletar produto", description = "Deleta um produto (soft delete - apenas desativa)")
    public ResponseEntity<Void> deletarProduto(
            @Parameter(description = "ID do produto") @PathVariable UUID id) {
        
        log.info("DELETE /api/v1/produtos/{}", id);
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deleta produto permanentemente (hard delete) - Apenas ADMIN
     */
    @DeleteMapping("/{id}/permanente")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar produto permanentemente", description = "Remove o produto permanentemente do banco (use com cuidado)")
    public ResponseEntity<Void> deletarProdutoPermanentemente(
            @Parameter(description = "ID do produto") @PathVariable UUID id) {
        
        log.warn("DELETE /api/v1/produtos/{}/permanente - ATENÇÃO: Deleção permanente!", id);
        produtoService.deletarProdutoPermanentemente(id);
        return ResponseEntity.noContent().build();
    }
}
