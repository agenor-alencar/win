package com.win.marketplace.controller;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.service.UsuarioPerfilService;
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
@RequestMapping("/api/v1/usuario-perfil")
@RequiredArgsConstructor
@Tag(name = "Usuário-Perfil", description = "Endpoints para associação entre usuários e perfis")
public class UsuarioPerfilController {

    private final UsuarioPerfilService usuarioPerfilService;

    /**
     * Atribui um perfil a um usuário
     */
    @PostMapping
    @Operation(summary = "Atribuir perfil", description = "Atribui um perfil a um usuário")
    public ResponseEntity<UsuarioPerfilResponseDTO> atribuirPerfil(
            @Valid @RequestBody UsuarioPerfilRequestDTO requestDTO) {
        
        log.info("POST /api/v1/usuario-perfil - Atribuindo perfil");
        UsuarioPerfilResponseDTO response = usuarioPerfilService.atribuirPerfil(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todas as associações usuário-perfil
     */
    @GetMapping
    @Operation(summary = "Listar todas associações", description = "Lista todas as associações entre usuários e perfis")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> listarTodos() {
        log.info("GET /api/v1/usuario-perfil - Listando todas associações");
        List<UsuarioPerfilResponseDTO> associacoes = usuarioPerfilService.listarTodos();
        return ResponseEntity.ok(associacoes);
    }

    /**
     * Busca perfis de um usuário específico
     */
    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Perfis do usuário", description = "Lista todos os perfis de um usuário específico")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorUsuario(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}", usuarioId);
        List<UsuarioPerfilResponseDTO> perfis = usuarioPerfilService.buscarPorUsuario(usuarioId);
        return ResponseEntity.ok(perfis);
    }

    /**
     * Busca usuários com um perfil específico
     */
    @GetMapping("/perfil/{perfilId}")
    @Operation(summary = "Usuários do perfil", description = "Lista todos os usuários com um perfil específico")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorPerfil(
            @Parameter(description = "ID do perfil") @PathVariable UUID perfilId) {
        
        log.info("GET /api/v1/usuario-perfil/perfil/{}", perfilId);
        List<UsuarioPerfilResponseDTO> usuarios = usuarioPerfilService.buscarPorPerfil(perfilId);
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Busca perfis de um usuário por nome do perfil
     */
    @GetMapping("/usuario/{usuarioId}/perfil-nome/{nomePerfil}")
    @Operation(summary = "Perfis do usuário por nome", description = "Busca perfis de um usuário pelo nome (ex: ADMIN, CLIENTE)")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorUsuarioENomePerfil(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Parameter(description = "Nome do perfil (ADMIN, CLIENTE, LOJISTA, MOTORISTA)") @PathVariable String nomePerfil) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/perfil-nome/{}", usuarioId, nomePerfil);
        List<UsuarioPerfilResponseDTO> perfis = usuarioPerfilService.buscarPorUsuarioENomePerfil(usuarioId, nomePerfil);
        return ResponseEntity.ok(perfis);
    }

    /**
     * Verifica se usuário possui um perfil específico
     */
    @GetMapping("/usuario/{usuarioId}/possui-perfil/{nomePerfil}")
    @Operation(summary = "Verificar se usuário tem perfil", description = "Verifica se um usuário possui um perfil específico")
    public ResponseEntity<Boolean> usuarioPossuiPerfil(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Parameter(description = "Nome do perfil (ADMIN, CLIENTE, LOJISTA, MOTORISTA)") @PathVariable String nomePerfil) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/possui-perfil/{}", usuarioId, nomePerfil);
        boolean possuiPerfil = usuarioPerfilService.usuarioPossuiPerfil(usuarioId, nomePerfil);
        return ResponseEntity.ok(possuiPerfil);
    }

    /**
     * Verifica se usuário é ADMIN
     */
    @GetMapping("/usuario/{usuarioId}/is-admin")
    @Operation(summary = "Verificar se é ADMIN", description = "Verifica se um usuário tem perfil de ADMIN")
    public ResponseEntity<Boolean> isUsuarioAdmin(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/is-admin", usuarioId);
        boolean isAdmin = usuarioPerfilService.isUsuarioAdmin(usuarioId);
        return ResponseEntity.ok(isAdmin);
    }

    /**
     * Verifica se usuário é LOJISTA
     */
    @GetMapping("/usuario/{usuarioId}/is-lojista")
    @Operation(summary = "Verificar se é LOJISTA", description = "Verifica se um usuário tem perfil de LOJISTA")
    public ResponseEntity<Boolean> isUsuarioLojista(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/is-lojista", usuarioId);
        boolean isLojista = usuarioPerfilService.isUsuarioLojista(usuarioId);
        return ResponseEntity.ok(isLojista);
    }

    /**
     * Verifica se usuário é MOTORISTA
     */
    @GetMapping("/usuario/{usuarioId}/is-motorista")
    @Operation(summary = "Verificar se é MOTORISTA", description = "Verifica se um usuário tem perfil de MOTORISTA")
    public ResponseEntity<Boolean> isUsuarioMotorista(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/is-motorista", usuarioId);
        boolean isMotorista = usuarioPerfilService.isUsuarioMotorista(usuarioId);
        return ResponseEntity.ok(isMotorista);
    }

    /**
     * Verifica se usuário é CLIENTE
     */
    @GetMapping("/usuario/{usuarioId}/is-cliente")
    @Operation(summary = "Verificar se é CLIENTE", description = "Verifica se um usuário tem perfil de CLIENTE")
    public ResponseEntity<Boolean> isUsuarioCliente(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("GET /api/v1/usuario-perfil/usuario/{}/is-cliente", usuarioId);
        boolean isCliente = usuarioPerfilService.isUsuarioCliente(usuarioId);
        return ResponseEntity.ok(isCliente);
    }

    /**
     * Remove um perfil específico de um usuário
     */
    @DeleteMapping("/usuario/{usuarioId}/perfil/{perfilId}")
    @Operation(summary = "Remover perfil do usuário", description = "Remove a associação entre um usuário e um perfil")
    public ResponseEntity<Void> removerPerfil(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId,
            @Parameter(description = "ID do perfil") @PathVariable UUID perfilId) {
        
        log.info("DELETE /api/v1/usuario-perfil/usuario/{}/perfil/{}", usuarioId, perfilId);
        usuarioPerfilService.removerPerfil(usuarioId, perfilId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Remove todos os perfis de um usuário
     */
    @DeleteMapping("/usuario/{usuarioId}/perfis")
    @Operation(summary = "Remover todos perfis do usuário", description = "Remove todos os perfis de um usuário")
    public ResponseEntity<Void> removerTodosPerfisUsuario(
            @Parameter(description = "ID do usuário") @PathVariable UUID usuarioId) {
        
        log.info("DELETE /api/v1/usuario-perfil/usuario/{}/perfis", usuarioId);
        usuarioPerfilService.removerTodosPerfisUsuario(usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Remove todos os usuários de um perfil
     */
    @DeleteMapping("/perfil/{perfilId}/usuarios")
    @Operation(summary = "Remover todos usuários do perfil", description = "Remove todos os usuários de um perfil específico")
    public ResponseEntity<Void> removerTodosUsuariosPerfil(
            @Parameter(description = "ID do perfil") @PathVariable UUID perfilId) {
        
        log.info("DELETE /api/v1/usuario-perfil/perfil/{}/usuarios", perfilId);
        usuarioPerfilService.removerTodosUsuariosPerfil(perfilId);
        return ResponseEntity.noContent().build();
    }
}
