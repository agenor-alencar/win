package com.win.marketplace.controller;

import com.win.marketplace.dto.request.LojistaCreateRequestDTO;
import com.win.marketplace.dto.response.LojistaResponseDTO;
import com.win.marketplace.service.LojistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lojistas")
@RequiredArgsConstructor
public class LojistaController {

    private final LojistaService lojistaService;

    @PostMapping
    public ResponseEntity<LojistaResponseDTO> criarLojista(
            @Valid @RequestBody LojistaCreateRequestDTO requestDTO) {
        LojistaResponseDTO response = lojistaService.criarLojista(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LojistaResponseDTO>> listarLojistas() {
        List<LojistaResponseDTO> lojistas = lojistaService.listarLojistas();
        return ResponseEntity.ok(lojistas);
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<LojistaResponseDTO>> listarLojistasAtivos() {
        List<LojistaResponseDTO> lojistas = lojistaService.listarLojistasAtivos();
        return ResponseEntity.ok(lojistas);
    }

    @GetMapping("/me")
    public ResponseEntity<LojistaResponseDTO> buscarLojistaLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        LojistaResponseDTO lojista = lojistaService.buscarPorEmail(email);
        return ResponseEntity.ok(lojista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LojistaResponseDTO> buscarPorId(@PathVariable UUID id) {
        LojistaResponseDTO lojista = lojistaService.buscarPorId(id);
        return ResponseEntity.ok(lojista);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<LojistaResponseDTO> buscarPorUsuarioId(@PathVariable UUID usuarioId) {
        LojistaResponseDTO lojista = lojistaService.buscarPorUsuarioId(usuarioId);
        return ResponseEntity.ok(lojista);
    }

    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<LojistaResponseDTO> buscarPorCnpj(@PathVariable String cnpj) {
        LojistaResponseDTO lojista = lojistaService.buscarPorCnpj(cnpj);
        return ResponseEntity.ok(lojista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LojistaResponseDTO> atualizarLojista(
            @PathVariable UUID id,
            @Valid @RequestBody LojistaCreateRequestDTO requestDTO) {
        LojistaResponseDTO lojista = lojistaService.atualizarLojista(id, requestDTO);
        return ResponseEntity.ok(lojista);
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<LojistaResponseDTO> ativarLojista(@PathVariable UUID id) {
        LojistaResponseDTO lojista = lojistaService.ativarLojista(id);
        return ResponseEntity.ok(lojista);
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<LojistaResponseDTO> desativarLojista(@PathVariable UUID id) {
        LojistaResponseDTO lojista = lojistaService.desativarLojista(id);
        return ResponseEntity.ok(lojista);
    }
}
