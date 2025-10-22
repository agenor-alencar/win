package com.win.marketplace.controller;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacao(
            @Valid @RequestBody AvaliacaoRequestDTO requestDTO) {
        AvaliacaoResponseDTO response = avaliacaoService.criarAvaliacao(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorProduto(
            @PathVariable UUID produtoId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorProduto(produtoId);
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorUsuario(
            @PathVariable UUID usuarioId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorUsuario(usuarioId);
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorPedido(
            @PathVariable UUID pedidoId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorPedido(pedidoId);
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarPorId(@PathVariable UUID id) {
        AvaliacaoResponseDTO avaliacao = avaliacaoService.buscarPorId(id);
        return ResponseEntity.ok(avaliacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> atualizarAvaliacao(
            @PathVariable UUID id,
            @Valid @RequestBody AvaliacaoRequestDTO requestDTO) {
        AvaliacaoResponseDTO avaliacao = avaliacaoService.atualizarAvaliacao(id, requestDTO);
        return ResponseEntity.ok(avaliacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAvaliacao(
            @PathVariable UUID id,
            @RequestParam UUID usuarioId) {
        avaliacaoService.deletarAvaliacao(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
