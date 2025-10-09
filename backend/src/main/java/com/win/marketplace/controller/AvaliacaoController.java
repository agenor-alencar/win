package com.win.marketplace.controller;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.service.AvaliacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/avaliacao")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping("/lojista/usuario/{clienteId}")
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacaoLojista(@PathVariable UUID clienteId, @RequestBody AvaliacaoRequestDTO requestDTO) {
        AvaliacaoResponseDTO response = avaliacaoService.criarAvaliacaoLojista(clienteId, requestDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/produto/usuario/{clienteId}")
    public ResponseEntity<AvaliacaoResponseDTO> criarAvaliacaoProduto(@PathVariable UUID clienteId, @RequestBody AvaliacaoRequestDTO requestDTO) {
        AvaliacaoResponseDTO response = avaliacaoService.criarAvaliacaoProduto(clienteId, requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/lojista/{lojistaId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorLojista(@PathVariable UUID lojistaId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorLojista(lojistaId);
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorUsuario(@PathVariable UUID usuarioId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorUsuario(usuarioId);
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/list/produto/{produtoId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPorProduto(@PathVariable UUID produtoId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.listarAvaliacoesPorProduto(produtoId);
        return ResponseEntity.ok(avaliacoes);
    }
}
