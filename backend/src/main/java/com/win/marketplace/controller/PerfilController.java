package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.service.PerfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @PostMapping("/create")
    public ResponseEntity<PerfilResponseDTO> criar(@RequestBody PerfilRequestDTO requestDTO) {
        PerfilResponseDTO response = perfilService.criar(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<PerfilResponseDTO>> listarTodos() {
        List<PerfilResponseDTO> perfis = perfilService.listarTodos();
        return ResponseEntity.ok(perfis);
    }

    @GetMapping("/list/ativos")
    public ResponseEntity<List<PerfilResponseDTO>> listarAtivos() {
        List<PerfilResponseDTO> perfis = perfilService.listarAtivos();
        return ResponseEntity.ok(perfis);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<PerfilResponseDTO> buscarPorId(@PathVariable UUID id) {
        PerfilResponseDTO perfil = perfilService.buscarPorId(id);
        return ResponseEntity.ok(perfil);
    }

    @GetMapping("/list/tipo/{tipo}")
    public ResponseEntity<PerfilResponseDTO> buscarPorTipo(@PathVariable String tipo) {
        Perfil.TipoPerfil tipoEnum = Perfil.TipoPerfil.valueOf(tipo.toUpperCase());
        PerfilResponseDTO perfil = perfilService.buscarPorTipo(tipoEnum);
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PerfilResponseDTO> atualizar(@PathVariable UUID id, @RequestBody PerfilRequestDTO requestDTO) {
        PerfilResponseDTO perfil = perfilService.atualizar(id, requestDTO);
        return ResponseEntity.ok(perfil);
    }

    @PatchMapping("/ativar/{id}")
    public ResponseEntity<PerfilResponseDTO> ativar(@PathVariable UUID id) {
        PerfilResponseDTO perfil = perfilService.ativar(id);
        return ResponseEntity.ok(perfil);
    }

    @PatchMapping("/desativar/{id}")
    public ResponseEntity<PerfilResponseDTO> desativar(@PathVariable UUID id) {
        PerfilResponseDTO perfil = perfilService.desativar(id);
        return ResponseEntity.ok(perfil);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        perfilService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
