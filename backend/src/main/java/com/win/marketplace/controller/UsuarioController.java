package com.win.marketplace.controller;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.PasswordUpdateRequestDTO;
import com.win.marketplace.dto.request.LojistaRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller para gerenciamento de usuários
 * 
 * Permissões:
 * - Listar todos/buscar: apenas ADMIN
 * - Criar/Atualizar/Deletar: apenas ADMIN
 * - Usuário pode atualizar sua própria senha
 */
@RestController
@RequestMapping("/api/v1/usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Criar novo usuário - Apenas ADMIN
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(@RequestBody RegisterRequestDTO requestDTO) {
        UsuarioResponseDTO response = usuarioService.criarUsuario(requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar todos os usuários - Apenas ADMIN
     */
    @GetMapping("/list/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Listar usuários ativos - Apenas ADMIN
     */
    @GetMapping("/list/ativos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuariosAtivos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarUsuariosAtivos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Buscar usuário por ID - Apenas ADMIN
     */
    @GetMapping("/list/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Buscar usuário por email - Apenas ADMIN
     */
    @GetMapping("/list/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> buscarPorEmail(@PathVariable String email) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Buscar usuário por CPF - Apenas ADMIN
     */
    @GetMapping("/list/cpf/{cpf}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorCpf(cpf);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Atualizar usuário - Apenas ADMIN
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(@PathVariable UUID id, @RequestBody RegisterRequestDTO requestDTO) {
        UsuarioResponseDTO usuario = usuarioService.atualizarUsuario(id, requestDTO);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Atualizar senha - Apenas ADMIN
     */
    @PatchMapping("/senha/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> atualizarSenha(@PathVariable UUID id, @RequestBody PasswordUpdateRequestDTO dto) {
        UsuarioResponseDTO usuario = usuarioService.atualizarSenha(id, dto);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Atualizar último acesso - Sistema interno (chamado pelo AuthController)
     * Mantém sem proteção específica por ser chamada interna
     */
    @PatchMapping("/ultimo-acesso/{email}")
    public ResponseEntity<Void> atualizarUltimoAcesso(@PathVariable String email) {
        usuarioService.atualizarUltimoAcesso(email);
        return ResponseEntity.ok().build();
    }

    /**
     * Ativar usuário - Apenas ADMIN
     */
    @PatchMapping("/ativar/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> ativarUsuario(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.ativarUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Desativar usuário - Apenas ADMIN
     */
    @PatchMapping("/desativar/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> desativarUsuario(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.desativarUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * Deletar usuário - Apenas ADMIN
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarUsuario(@PathVariable UUID id) {
        usuarioService.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Promover usuário autenticado para LOJISTA
     * 
     * Este endpoint é chamado quando um usuário comum (USER) clica no botão
     * "Venda no WIN" e preenche o formulário de cadastro de loja.
     * 
     * Permissões:
     * - Apenas usuários autenticados com perfil USER
     * - Usuário não pode já ter perfil LOJISTA
     * 
     * @param lojistaData Dados da loja (nome, CNPJ, descrição, etc)
     * @param userDetails Dados do usuário autenticado (injetado automaticamente)
     * @return UsuarioResponseDTO com perfis atualizados (agora incluindo LOJISTA)
     */
    @PostMapping("/tornar-lojista")
    @PreAuthorize("hasRole('USER') and isAuthenticated()")
    public ResponseEntity<UsuarioResponseDTO> tornarLojista(
            @Valid @RequestBody LojistaRequestDTO lojistaData,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Extrair email do usuário autenticado
        String email = userDetails.getUsername();
        
        // Promover usuário para lojista
        UsuarioResponseDTO response = usuarioService.promoverParaLojista(email, lojistaData);
        
        return ResponseEntity.ok(response);
    }
}
