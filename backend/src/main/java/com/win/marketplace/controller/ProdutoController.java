package com.win.marketplace.controller;

import com.win.marketplace.dto.request.ProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.ProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.ProdutoResponseDTO;
import com.win.marketplace.dto.response.ProdutoSummaryResponseDTO;
import com.win.marketplace.model.Produto;
import com.win.marketplace.service.ProdutoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/produto")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping("/create/lojista/{lojistaId}")
    public ResponseEntity<ProdutoResponseDTO> criarProduto(@PathVariable UUID lojistaId, @RequestBody ProdutoCreateRequestDTO requestDTO) {
        ProdutoResponseDTO response = produtoService.criarProduto(lojistaId, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/paginados")
    public ResponseEntity<Page<ProdutoSummaryResponseDTO>> listarProdutosPaginados(Pageable pageable) {
        Page<ProdutoSummaryResponseDTO> produtos = produtoService.listarProdutosPaginados(pageable);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/list/lojista/{lojistaId}")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorLojista(@PathVariable UUID lojistaId) {
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosPorLojista(lojistaId);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/list/categoria/{categoriaId}")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorCategoria(@PathVariable UUID categoriaId) {
        List<ProdutoResponseDTO> produtos = produtoService.listarProdutosPorCategoria(categoriaId);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/list/nome")
    public ResponseEntity<List<ProdutoResponseDTO>> buscarProdutosPorNome(@RequestParam String nome) {
        List<ProdutoResponseDTO> produtos = produtoService.buscarProdutosPorNome(nome);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable UUID id) {
        ProdutoResponseDTO produto = produtoService.buscarPorId(id);
        return ResponseEntity.ok(produto);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(@PathVariable UUID id, @RequestBody ProdutoUpdateRequestDTO requestDTO) {
        ProdutoResponseDTO produto = produtoService.atualizarProduto(id, requestDTO);
        return ResponseEntity.ok(produto);
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<Void> atualizarStatusProduto(@PathVariable UUID id, @RequestParam String novoStatus) {
        Produto.StatusProduto statusEnum = Produto.StatusProduto.valueOf(novoStatus.toUpperCase());
        produtoService.atualizarStatusProduto(id, statusEnum);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/estoque/{produtoId}")
    public ResponseEntity<Void> atualizarEstoque(@PathVariable UUID produtoId, @RequestParam Integer novaQuantidade) {
        produtoService.atualizarEstoque(produtoId, novaQuantidade);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/avaliacao/{produtoId}")
    public ResponseEntity<Void> atualizarAvaliacaoMedia(@PathVariable UUID produtoId) {
        produtoService.atualizarAvaliacaoMedia(produtoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable UUID id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }
}
