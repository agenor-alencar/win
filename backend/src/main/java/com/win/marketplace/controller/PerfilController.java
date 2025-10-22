package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/perfis")
@RequiredArgsConstructor
@Tag(name = "Perfis", description = "Endpoints para gerenciamento de perfis de usuário")
public class PerfilController {

    private final PerfilService perfilService;

    /**
     * Cria um novo perfil
     */
    @PostMapping
    @Operation(summary = "Criar perfil", description = "Cria um novo perfil no sistema")
    public ResponseEntity<PerfilResponseDTO> criar(
            @Valid @RequestBody PerfilRequestDTO requestDTO) {
        
        log.info("POST /api/v1/perfis - Criando perfil: {}", requestDTO.nome());
        PerfilResponseDTO response = perfilService.criar(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todos os perfis (ativos e inativos)
     */
    @GetMapping
    @Operation(summary = "Listar todos os perfis", description = "Retorna todos os perfis cadastrados")
    public ResponseEntity<List<PerfilResponseDTO>> listarTodos() {
        log.info("GET /api/v1/perfis - Listando todos os perfis");
        List<PerfilResponseDTO> perfis = perfilService.listarTodos();
        return ResponseEntity.ok(perfis);
    }

    /**
     * Lista apenas perfis ativos
     */
    @GetMapping("/ativos")
    @Operation(summary = "Listar perfis ativos", description = "Retorna apenas os perfis ativos")
    public ResponseEntity<List<PerfilResponseDTO>> listarAtivos() {
        log.info("GET /api/v1/perfis/ativos - Listando perfis ativos");
        List<PerfilResponseDTO> perfis = perfilService.listarAtivos();
        return ResponseEntity.ok(perfis);
    }

    /**
     * Busca perfil por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buscar perfil por ID", description = "Retorna um perfil específico pelo ID")
    public ResponseEntity<PerfilResponseDTO> buscarPorId(
            @Parameter(description = "ID do perfil") @PathVariable UUID id) {
        
        log.info("GET /api/v1/perfis/{}", id);
        PerfilResponseDTO perfil = perfilService.buscarPorId(id);
        return ResponseEntity.ok(perfil);
    }

    /**
     * Busca perfil por nome
     */
    @GetMapping("/nome/{nome}")
    @Operation(summary = "Buscar perfil por nome", description = "Retorna um perfil específico pelo nome")
    public ResponseEntity<PerfilResponseDTO> buscarPorNome(
            @Parameter(description = "Nome do perfil (ex: ADMIN, CLIENTE, LOJISTA, MOTORISTA)") 
            @PathVariable String nome) {
        
        log.info("GET /api/v1/perfis/nome/{}", nome);
        PerfilResponseDTO perfil = perfilService.buscarPorNome(nome);
        return ResponseEntity.ok(perfil);
    }

    /**
     * Atualiza um perfil existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar perfil", description = "Atualiza as informações de um perfil")
    public ResponseEntity<PerfilResponseDTO> atualizar(
            @Parameter(description = "ID do perfil") @PathVariable UUID id,
            @Valid @RequestBody PerfilRequestDTO requestDTO) {
        
        log.info("PUT /api/v1/perfis/{}", id);
        PerfilResponseDTO perfil = perfilService.atualizar(id, requestDTO);
        return ResponseEntity.ok(perfil);
    }

    /**
     * Ativa um perfil
     */
    @PatchMapping("/{id}/ativar")
    @Operation(summary = "Ativar perfil", description = "Ativa um perfil que estava inativo")
    public ResponseEntity<PerfilResponseDTO> ativar(
            @Parameter(description = "ID do perfil") @PathVariable UUID id) {
        
        log.info("PATCH /api/v1/perfis/{}/ativar", id);
        PerfilResponseDTO perfil = perfilService.ativar(id);
        return ResponseEntity.ok(perfil);
    }

    /**
     * Desativa um perfil
     */
    @PatchMapping("/{id}/desativar")
    @Operation(summary = "Desativar perfil", description = "Desativa um perfil")
    public ResponseEntity<PerfilResponseDTO> desativar(
            @Parameter(description = "ID do perfil") @PathVariable UUID id) {
        
        log.info("PATCH /api/v1/perfis/{}/desativar", id);
        PerfilResponseDTO perfil = perfilService.desativar(id);
        return ResponseEntity.ok(perfil);
    }

    /**
     * Deleta um perfil
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar perfil", description = "Remove um perfil do sistema (não pode ter usuários associados)")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do perfil") @PathVariable UUID id) {
        
        log.info("DELETE /api/v1/perfis/{}", id);
        perfilService.deletar(id); // ✅ CORRIGIDO: era "delelar"
        return ResponseEntity.noContent().build();
    }
}
