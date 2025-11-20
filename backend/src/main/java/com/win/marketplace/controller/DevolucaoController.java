package com.win.marketplace.controller;

import com.win.marketplace.dto.request.DevolucaoCreateRequestDTO;
import com.win.marketplace.dto.request.DevolucaoUpdateRequestDTO;
import com.win.marketplace.dto.response.DevolucaoResponseDTO;
import com.win.marketplace.model.Devolucao;
import com.win.marketplace.service.DevolucaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Controller de Devoluções
 * 
 * Permissões:
 * - Criar devolução: Usuários autenticados (USER, LOJISTA, ADMIN)
 * - Listar/Atualizar devoluções: LOJISTA ou ADMIN
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/devolucoes")
@RequiredArgsConstructor
@Tag(name = "Devoluções", description = "Endpoints para gerenciamento de devoluções e reembolsos")
public class DevolucaoController {

    private final DevolucaoService devolucaoService;

    /**
     * Cria uma nova solicitação de devolução
     */
    @PostMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('USER', 'LOJISTA', 'ADMIN')")
    @Operation(summary = "Criar devolução", description = "Cria uma nova solicitação de devolução")
    public ResponseEntity<DevolucaoResponseDTO> criar(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Valid @RequestBody DevolucaoCreateRequestDTO requestDTO) {
        
        log.info("POST /api/v1/devolucoes/usuario/{} - Criando devolução", usuarioId);
        DevolucaoResponseDTO response = devolucaoService.criarDevolucao(usuarioId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Atualiza status de uma devolução (lojista)
     */
    @PatchMapping("/{id}/lojista/{lojistaId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Atualizar status da devolução", description = "Atualiza o status de uma devolução (ação do lojista)")
    public ResponseEntity<DevolucaoResponseDTO> atualizarStatus(
            @Parameter(description = "ID da devolução") @PathVariable UUID id,
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId,
            @Valid @RequestBody DevolucaoUpdateRequestDTO requestDTO) {
        
        log.info("PATCH /api/v1/devolucoes/{}/lojista/{} - Atualizando status", id, lojistaId);
        DevolucaoResponseDTO response = devolucaoService.atualizarStatus(id, lojistaId, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Lista todas as devoluções de um lojista
     */
    @GetMapping("/lojista/{lojistaId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Listar devoluções do lojista", description = "Lista todas as devoluções de um lojista")
    public ResponseEntity<List<DevolucaoResponseDTO>> listarPorLojista(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId) {
        
        log.info("GET /api/v1/devolucoes/lojista/{}", lojistaId);
        List<DevolucaoResponseDTO> devolucoes = devolucaoService.listarPorLojista(lojistaId);
        return ResponseEntity.ok(devolucoes);
    }

    /**
     * Lista devoluções de um lojista filtradas por status
     */
    @GetMapping("/lojista/{lojistaId}/status/{status}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Listar devoluções por status", description = "Lista devoluções de um lojista filtradas por status")
    public ResponseEntity<List<DevolucaoResponseDTO>> listarPorLojistaEStatus(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId,
            @Parameter(description = "Status da devolução") @PathVariable String status) {
        
        log.info("GET /api/v1/devolucoes/lojista/{}/status/{}", lojistaId, status);
        Devolucao.StatusDevolucao statusEnum = Devolucao.StatusDevolucao.valueOf(status.toUpperCase());
        List<DevolucaoResponseDTO> devolucoes = devolucaoService.listarPorLojistaEStatus(lojistaId, statusEnum);
        return ResponseEntity.ok(devolucoes);
    }

    /**
     * Lista devoluções de um usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('USER', 'LOJISTA', 'ADMIN')")
    @Operation(summary = "Listar devoluções do usuário", description = "Lista todas as devoluções de um usuário")
    public ResponseEntity<List<DevolucaoResponseDTO>> listarPorUsuario(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/devolucoes/usuario/{}", usuarioId);
        List<DevolucaoResponseDTO> devolucoes = devolucaoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(devolucoes);
    }

    /**
     * Busca devolução por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'LOJISTA', 'ADMIN')")
    @Operation(summary = "Buscar devolução por ID", description = "Retorna uma devolução específica")
    public ResponseEntity<DevolucaoResponseDTO> buscarPorId(
            @Parameter(description = "ID da devolução") @PathVariable UUID id) {
        
        log.info("GET /api/v1/devolucoes/{}", id);
        DevolucaoResponseDTO devolucao = devolucaoService.buscarPorId(id);
        return ResponseEntity.ok(devolucao);
    }

    /**
     * Busca devolução por número
     */
    @GetMapping("/numero/{numeroDevolucao}")
    @PreAuthorize("hasAnyRole('USER', 'LOJISTA', 'ADMIN')")
    @Operation(summary = "Buscar devolução por número", description = "Busca uma devolução pelo número")
    public ResponseEntity<DevolucaoResponseDTO> buscarPorNumero(
            @Parameter(description = "Número da devolução") @PathVariable String numeroDevolucao) {
        
        log.info("GET /api/v1/devolucoes/numero/{}", numeroDevolucao);
        DevolucaoResponseDTO devolucao = devolucaoService.buscarPorNumero(numeroDevolucao);
        return ResponseEntity.ok(devolucao);
    }

    /**
     * Conta devoluções pendentes de um lojista
     */
    @GetMapping("/lojista/{lojistaId}/pendentes/count")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Contar devoluções pendentes", description = "Retorna quantidade de devoluções pendentes de um lojista")
    public ResponseEntity<Long> contarPendentes(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId) {
        
        log.info("GET /api/v1/devolucoes/lojista/{}/pendentes/count", lojistaId);
        long count = devolucaoService.contarPendentesPorLojista(lojistaId);
        return ResponseEntity.ok(count);
    }
}
