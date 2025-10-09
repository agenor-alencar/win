package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PromocaoRequestDTO;
import com.win.marketplace.dto.response.PromocaoResponseDTO;
import com.win.marketplace.service.PromocaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promocoes")
@RequiredArgsConstructor
public class PromocaoController {

    private final PromocaoService promocaoService;

    @PostMapping
    @PreAuthorize("hasRole('LOJISTA') or hasRole('ADMIN')")
    public ResponseEntity<PromocaoResponseDTO> criarPromocao(@Valid @RequestBody PromocaoRequestDTO requestDTO) {
        PromocaoResponseDTO response = promocaoService.criarPromocao(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PromocaoResponseDTO>> listarPromocoes() {
        List<PromocaoResponseDTO> promocoes = promocaoService.listarPromocoes();
        return ResponseEntity.ok(promocoes);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<PromocaoResponseDTO>> listarPromocoesAtivas() {
        List<PromocaoResponseDTO> promocoes = promocaoService.listarPromocoesAtivas();
        return ResponseEntity.ok(promocoes);
    }

    @GetMapping("/vigentes")
    public ResponseEntity<List<PromocaoResponseDTO>> listarPromocoesVigentes() {
        List<PromocaoResponseDTO> promocoes = promocaoService.listarPromocoesVigentes();
        return ResponseEntity.ok(promocoes);
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<PromocaoResponseDTO>> listarPromocoesPorProduto(@PathVariable UUID produtoId) {
        List<PromocaoResponseDTO> promocoes = promocaoService.listarPromocoesPorProduto(produtoId);
        return ResponseEntity.ok(promocoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromocaoResponseDTO> buscarPorId(@PathVariable UUID id) {
        PromocaoResponseDTO promocao = promocaoService.buscarPorId(id);
        return ResponseEntity.ok(promocao);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LOJISTA') or hasRole('ADMIN')")
    public ResponseEntity<PromocaoResponseDTO> atualizarPromocao(
            @PathVariable UUID id,
            @Valid @RequestBody PromocaoRequestDTO requestDTO) {
        PromocaoResponseDTO promocao = promocaoService.atualizarPromocao(id, requestDTO);
        return ResponseEntity.ok(promocao);
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('LOJISTA') or hasRole('ADMIN')")
    public ResponseEntity<PromocaoResponseDTO> ativarPromocao(@PathVariable UUID id) {
        PromocaoResponseDTO promocao = promocaoService.ativarPromocao(id);
        return ResponseEntity.ok(promocao);
    }

    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasRole('LOJISTA') or hasRole('ADMIN')")
    public ResponseEntity<PromocaoResponseDTO> desativarPromocao(@PathVariable UUID id) {
        PromocaoResponseDTO promocao = promocaoService.desativarPromocao(id);
        return ResponseEntity.ok(promocao);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LOJISTA') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletarPromocao(@PathVariable UUID id) {
        promocaoService.deletarPromocao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verificar-expiradas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> verificarEAtualizarPromocoesExpiradas() {
        promocaoService.verificarEAtualizarPromocoesExpiradas();
        return ResponseEntity.ok().build();
    }
}
