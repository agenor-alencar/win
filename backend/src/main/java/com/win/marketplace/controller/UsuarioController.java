package com.win.marketplace.controller;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.PasswordUpdateRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/create")
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(@RequestBody RegisterRequestDTO requestDTO) {
        UsuarioResponseDTO response = usuarioService.criarUsuario(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/list/ativos")
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuariosAtivos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarUsuariosAtivos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/list/email/{email}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorEmail(@PathVariable String email) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/list/cpf/{cpf}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        UsuarioResponseDTO usuario = usuarioService.buscarPorCpf(cpf);
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(@PathVariable UUID id, @RequestBody RegisterRequestDTO requestDTO) {
        UsuarioResponseDTO usuario = usuarioService.atualizarUsuario(id, requestDTO);
        return ResponseEntity.ok(usuario);
    }

    @PatchMapping("/senha/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarSenha(@PathVariable UUID id, @RequestBody PasswordUpdateRequestDTO dto) {
        UsuarioResponseDTO usuario = usuarioService.atualizarSenha(id, dto);
        return ResponseEntity.ok(usuario);
    }

    @PatchMapping("/ultimo-acesso/{email}")
    public ResponseEntity<Void> atualizarUltimoAcesso(@PathVariable String email) {
        usuarioService.atualizarUltimoAcesso(email);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/ativar/{id}")
    public ResponseEntity<UsuarioResponseDTO> ativarUsuario(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.ativarUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    @PatchMapping("/desativar/{id}")
    public ResponseEntity<UsuarioResponseDTO> desativarUsuario(@PathVariable UUID id) {
        UsuarioResponseDTO usuario = usuarioService.desativarUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable UUID id) {
        usuarioService.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
