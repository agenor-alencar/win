package com.win.marketplace.controller;

import com.win.marketplace.dto.request.EnderecoRequestDTO;
import com.win.marketplace.dto.response.EnderecoResponseDTO;
import com.win.marketplace.service.EnderecoService;
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
 * Controller para gerenciamento de endereços de usuários
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/enderecos")
@RequiredArgsConstructor
@Tag(name = "Endereços", description = "Endpoints para gerenciar endereços de entrega do usuário")
public class EnderecoController {

    private final EnderecoService enderecoService;

    /**
     * Cria um novo endereço para o usuário
     */
    @PostMapping("/usuario/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Criar endereço", description = "Cria um novo endereço de entrega")
    public ResponseEntity<EnderecoResponseDTO> criar(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Valid @RequestBody EnderecoRequestDTO requestDTO) {
        
        log.info("POST /api/v1/enderecos/usuario/{} - Criando endereço", usuarioId);
        EnderecoResponseDTO response = enderecoService.criarEndereco(usuarioId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todos os endereços do usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar endereços", description = "Lista todos os endereços do usuário")
    public ResponseEntity<List<EnderecoResponseDTO>> listar(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/enderecos/usuario/{}", usuarioId);
        List<EnderecoResponseDTO> enderecos = enderecoService.listarEnderecosPorUsuario(usuarioId);
        return ResponseEntity.ok(enderecos);
    }

    /**
     * Busca o endereço principal do usuário
     */
    @GetMapping("/usuario/{usuarioId}/principal")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Buscar endereço principal", description = "Retorna o endereço principal do usuário")
    public ResponseEntity<EnderecoResponseDTO> buscarPrincipal(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/enderecos/usuario/{}/principal", usuarioId);
        EnderecoResponseDTO endereco = enderecoService.buscarEnderecoPrincipal(usuarioId);
        return ResponseEntity.ok(endereco);
    }

    /**
     * Busca um endereço específico por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Buscar endereço por ID", description = "Retorna um endereço específico")
    public ResponseEntity<EnderecoResponseDTO> buscarPorId(
            @Parameter(description = "ID do endereço") @PathVariable UUID id) {
        
        log.info("GET /api/v1/enderecos/{}", id);
        EnderecoResponseDTO endereco = enderecoService.buscarPorId(id);
        return ResponseEntity.ok(endereco);
    }

    /**
     * Atualiza um endereço existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Atualizar endereço", description = "Atualiza os dados de um endereço")
    public ResponseEntity<EnderecoResponseDTO> atualizar(
            @Parameter(description = "ID do endereço") @PathVariable UUID id,
            @Valid @RequestBody EnderecoRequestDTO requestDTO) {
        
        log.info("PUT /api/v1/enderecos/{}", id);
        EnderecoResponseDTO endereco = enderecoService.atualizarEndereco(id, requestDTO);
        return ResponseEntity.ok(endereco);
    }

    /**
     * Define um endereço como principal
     */
    @PatchMapping("/{id}/principal")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Definir como principal", description = "Define um endereço como principal")
    public ResponseEntity<EnderecoResponseDTO> definirComoPrincipal(
            @Parameter(description = "ID do endereço") @PathVariable UUID id) {
        
        log.info("PATCH /api/v1/enderecos/{}/principal", id);
        EnderecoResponseDTO endereco = enderecoService.definirComoPrincipal(id);
        return ResponseEntity.ok(endereco);
    }

    /**
     * Remove um endereço (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remover endereço", description = "Remove um endereço de entrega")
    public ResponseEntity<Void> remover(
            @Parameter(description = "ID do endereço") @PathVariable UUID id) {
        
        log.info("DELETE /api/v1/enderecos/{}", id);
        enderecoService.deletarEndereco(id);
        return ResponseEntity.noContent().build();
    }
}
