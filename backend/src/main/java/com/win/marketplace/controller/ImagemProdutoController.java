package com.win.marketplace.controller;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.service.ImagemProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/imagens-produto")
@RequiredArgsConstructor
public class ImagemProdutoController {

    private final ImagemProdutoService imagemProdutoService;

    @PostMapping(value = "/produto/{produtoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagemProdutoResponseDTO> adicionarImagem(
            @PathVariable UUID produtoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(required = false) Integer ordemExibicao) {
        ImagemProdutoResponseDTO response = imagemProdutoService.adicionarImagem(produtoId, arquivo, ordemExibicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/produto/{produtoId}/url")
    public ResponseEntity<ImagemProdutoResponseDTO> adicionarImagemComUrl(
            @PathVariable UUID produtoId,
            @RequestParam String url,
            @RequestParam(required = false) String textoAlternativo,
            @RequestParam(required = false) Integer ordemExibicao) {
        ImagemProdutoResponseDTO response = imagemProdutoService.adicionarImagemComUrl(produtoId, url, textoAlternativo, ordemExibicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<ImagemProdutoResponseDTO>> listarImagensPorProduto(@PathVariable UUID produtoId) {
        List<ImagemProdutoResponseDTO> imagens = imagemProdutoService.listarImagensPorProduto(produtoId);
        return ResponseEntity.ok(imagens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImagemProdutoResponseDTO> buscarPorId(@PathVariable UUID id) {
        ImagemProdutoResponseDTO imagem = imagemProdutoService.buscarPorId(id);
        return ResponseEntity.ok(imagem);
    }

    @PatchMapping("/{id}/ordem")
    public ResponseEntity<ImagemProdutoResponseDTO> atualizarOrdemExibicao(
            @PathVariable UUID id,
            @RequestParam Integer novaOrdem) {
        ImagemProdutoResponseDTO imagem = imagemProdutoService.atualizarOrdemExibicao(id, novaOrdem);
        return ResponseEntity.ok(imagem);
    }

    @PatchMapping("/{id}/texto-alternativo")
    public ResponseEntity<ImagemProdutoResponseDTO> atualizarTextoAlternativo(
            @PathVariable UUID id,
            @RequestParam String novoTexto) {
        ImagemProdutoResponseDTO imagem = imagemProdutoService.atualizarTextoAlternativo(id, novoTexto);
        return ResponseEntity.ok(imagem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarImagem(@PathVariable UUID id) {
        imagemProdutoService.deletarImagem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/produto/{produtoId}")
    public ResponseEntity<Void> deletarTodasImagensProduto(@PathVariable UUID produtoId) {
        imagemProdutoService.deletarTodasImagensProduto(produtoId);
        return ResponseEntity.noContent().build();
    }
}
