package com.win.marketplace.controller;

import com.win.marketplace.dto.request.DadosBancariosRequestDTO;
import com.win.marketplace.dto.response.DadosBancariosResponseDTO;
import com.win.marketplace.service.DadosBancariosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller para gerenciamento de dados bancários dos lojistas
 * E criação automática de recipients no Pagar.me
 */
@RestController
@RequestMapping("/api/v1/lojistas/{lojistaId}/dados-bancarios")
@RequiredArgsConstructor
public class DadosBancariosController {

    private final DadosBancariosService dadosBancariosService;

    /**
     * Cadastra ou atualiza dados bancários do lojista
     * E cria automaticamente o recipient no Pagar.me
     * 
     * POST /api/v1/lojistas/{lojistaId}/dados-bancarios
     */
    @PostMapping
    // @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')") // Temporariamente desabilitado para teste
    public ResponseEntity<DadosBancariosResponseDTO> cadastrarDadosBancarios(
        @PathVariable UUID lojistaId,
        @Valid @RequestBody DadosBancariosRequestDTO request
    ) {
        DadosBancariosResponseDTO response = dadosBancariosService.cadastrarDadosBancarios(lojistaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Busca dados bancários do lojista
     * 
     * GET /api/v1/lojistas/{lojistaId}/dados-bancarios
     */
    @GetMapping
    // @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')") // Temporariamente desabilitado para teste
    public ResponseEntity<DadosBancariosResponseDTO> buscarDadosBancarios(
        @PathVariable UUID lojistaId
    ) {
        DadosBancariosResponseDTO response = dadosBancariosService.buscarDadosBancarios(lojistaId);
        return ResponseEntity.ok(response);
    }

    /**
     * Recria o recipient no Pagar.me
     * Útil se houve erro na primeira tentativa
     * 
     * POST /api/v1/lojistas/{lojistaId}/dados-bancarios/recriar-recipient
     */
    @PostMapping("/recriar-recipient")
    // @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')") // Temporariamente desabilitado para teste
    public ResponseEntity<DadosBancariosResponseDTO> recriarRecipient(
        @PathVariable UUID lojistaId
    ) {
        DadosBancariosResponseDTO response = dadosBancariosService.recriarRecipient(lojistaId);
        return ResponseEntity.ok(response);
    }

    /**
     * Remove dados bancários do lojista
     * 
     * DELETE /api/v1/lojistas/{lojistaId}/dados-bancarios
     */
    @DeleteMapping
    // @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')") // Temporariamente desabilitado para teste
    public ResponseEntity<Void> removerDadosBancarios(
        @PathVariable UUID lojistaId
    ) {
        dadosBancariosService.removerDadosBancarios(lojistaId);
        return ResponseEntity.noContent().build();
    }
}
