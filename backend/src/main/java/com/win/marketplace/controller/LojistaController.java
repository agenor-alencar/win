package com.win.marketplace.controller;

import com.win.marketplace.dto.request.LojistaCreateRequestDTO;
import com.win.marketplace.dto.response.LojistaResponseDTO;
import com.win.marketplace.service.LojistaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lojista")
public class LojistaController {

    private final LojistaService lojistaService;

    public LojistaController(LojistaService lojistaService) {
        this.lojistaService = lojistaService;
    }

    @PostMapping("/create")
    public ResponseEntity<LojistaResponseDTO> criarLojista(@RequestBody LojistaCreateRequestDTO requestDTO) {
        LojistaResponseDTO response = lojistaService.criarLojista(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<LojistaResponseDTO>> listarLojistas() {
        List<LojistaResponseDTO> lojistas = lojistaService.listarLojistas();
        return ResponseEntity.ok(lojistas);
    }

    @GetMapping("/list/ativos")
    public ResponseEntity<List<LojistaResponseDTO>> listarLojistasAtivos() {
        List<LojistaResponseDTO> lojistas = lojistaService.listarLojistasAtivos();
        return ResponseEntity.ok(lojistas);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<LojistaResponseDTO> buscarPorId(@PathVariable UUID id) {
        LojistaResponseDTO lojista = lojistaService.buscarPorId(id);
        return ResponseEntity.ok(lojista);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<LojistaResponseDTO> buscarPorUsuarioId(@PathVariable UUID usuarioId) {
        LojistaResponseDTO lojista = lojistaService.buscarPorUsuarioId(usuarioId);
        return ResponseEntity.ok(lojista);
    }

    @GetMapping("/list/cnpj/{cnpj}")
    public ResponseEntity<LojistaResponseDTO> buscarPorCnpj(@PathVariable String cnpj) {
        LojistaResponseDTO lojista = lojistaService.buscarPorCnpj(cnpj);
        return ResponseEntity.ok(lojista);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<LojistaResponseDTO> atualizarLojista(@PathVariable UUID id, @RequestBody LojistaCreateRequestDTO requestDTO) {
        LojistaResponseDTO lojista = lojistaService.atualizarLojista(id, requestDTO);
        return ResponseEntity.ok(lojista);
    }

    @PatchMapping("/avaliacao/{lojistaId}")
    public ResponseEntity<Void> atualizarAvaliacaoMedia(@PathVariable UUID lojistaId) {
        lojistaService.atualizarAvaliacaoMedia(lojistaId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> desativarLojista(@PathVariable UUID id) {
        lojistaService.desativarLojista(id);
        return ResponseEntity.noContent().build();
    }
}
