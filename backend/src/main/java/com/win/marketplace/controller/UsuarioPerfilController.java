package com.win.marketplace.controller;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.service.UsuarioPerfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuario-perfil")
public class UsuarioPerfilController {

    private final UsuarioPerfilService usuarioPerfilService;

    public UsuarioPerfilController(UsuarioPerfilService usuarioPerfilService) {
        this.usuarioPerfilService = usuarioPerfilService;
    }

    @PostMapping("/atribuir")
    public ResponseEntity<UsuarioPerfilResponseDTO> atribuirPerfil(@RequestBody UsuarioPerfilRequestDTO requestDTO) {
        UsuarioPerfilResponseDTO response = usuarioPerfilService.atribuirPerfil(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> listarTodos() {
        List<UsuarioPerfilResponseDTO> associacoes = usuarioPerfilService.listarTodos();
        return ResponseEntity.ok(associacoes);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorUsuario(@PathVariable UUID usuarioId) {
        List<UsuarioPerfilResponseDTO> perfis = usuarioPerfilService.buscarPorUsuario(usuarioId);
        return ResponseEntity.ok(perfis);
    }

    @GetMapping("/list/perfil/{perfilId}")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorPerfil(@PathVariable UUID perfilId) {
        List<UsuarioPerfilResponseDTO> usuarios = usuarioPerfilService.buscarPorPerfil(perfilId);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/list/usuario/{usuarioId}/tipo/{tipoPerfil}")
    public ResponseEntity<List<UsuarioPerfilResponseDTO>> buscarPorUsuarioETipo(@PathVariable UUID usuarioId, @PathVariable String tipoPerfil) {
        Perfil.TipoPerfil tipoEnum = Perfil.TipoPerfil.valueOf(tipoPerfil.toUpperCase());
        List<UsuarioPerfilResponseDTO> perfis = usuarioPerfilService.buscarPorUsuarioETipo(usuarioId, tipoEnum);
        return ResponseEntity.ok(perfis);
    }

    @GetMapping("/possui-perfil/usuario/{usuarioId}/tipo/{tipoPerfil}")
    public ResponseEntity<Boolean> usuarioPossuiPerfil(@PathVariable UUID usuarioId, @PathVariable String tipoPerfil) {
        Perfil.TipoPerfil tipoEnum = Perfil.TipoPerfil.valueOf(tipoPerfil.toUpperCase());
        boolean possuiPerfil = usuarioPerfilService.usuarioPossuiPerfil(usuarioId, tipoEnum);
        return ResponseEntity.ok(possuiPerfil);
    }

    @DeleteMapping("/remover/usuario/{usuarioId}/perfil/{perfilId}")
    public ResponseEntity<Void> removerPerfil(@PathVariable UUID usuarioId, @PathVariable UUID perfilId) {
        usuarioPerfilService.removerPerfil(usuarioId, perfilId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/remover/todos-perfis/usuario/{usuarioId}")
    public ResponseEntity<Void> removerTodosPerfisUsuario(@PathVariable UUID usuarioId) {
        usuarioPerfilService.removerTodosPerfisUsuario(usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/remover/todos-usuarios/perfil/{perfilId}")
    public ResponseEntity<Void> removerTodosUsuariosPerfil(@PathVariable UUID perfilId) {
        usuarioPerfilService.removerTodosUsuariosPerfil(perfilId);
        return ResponseEntity.noContent().build();
    }
}
