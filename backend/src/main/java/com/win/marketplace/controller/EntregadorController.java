package com.win.marketplace.controller;

import com.win.marketplace.dto.request.EntregadorCreateRequestDTO;
import com.win.marketplace.dto.response.EntregadorResponseDTO;
import com.win.marketplace.service.EntregadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/entregador")
public class EntregadorController {

    private final EntregadorService entregadorService;

    public EntregadorController(EntregadorService entregadorService) {
        this.entregadorService = entregadorService;
    }

    @PostMapping("/create")
    public ResponseEntity<EntregadorResponseDTO> criarEntregador(@RequestBody EntregadorCreateRequestDTO requestDTO) {
        EntregadorResponseDTO response = entregadorService.criarEntregador(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<EntregadorResponseDTO>> listarEntregadores() {
        List<EntregadorResponseDTO> entregadores = entregadorService.listarEntregadores();
        return ResponseEntity.ok(entregadores);
    }

    @GetMapping("/list/disponiveis")
    public ResponseEntity<List<EntregadorResponseDTO>> listarEntregadoresDisponiveis() {
        List<EntregadorResponseDTO> entregadores = entregadorService.listarEntregadoresDisponiveis();
        return ResponseEntity.ok(entregadores);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<EntregadorResponseDTO> buscarPorId(@PathVariable UUID id) {
        EntregadorResponseDTO entregador = entregadorService.buscarPorId(id);
        return ResponseEntity.ok(entregador);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<EntregadorResponseDTO> buscarPorUsuarioId(@PathVariable UUID usuarioId) {
        EntregadorResponseDTO entregador = entregadorService.buscarPorUsuarioId(usuarioId);
        return ResponseEntity.ok(entregador);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<EntregadorResponseDTO> atualizarEntregador(@PathVariable UUID id, @RequestBody EntregadorCreateRequestDTO requestDTO) {
        EntregadorResponseDTO entregador = entregadorService.atualizarEntregador(id, requestDTO);
        return ResponseEntity.ok(entregador);
    }

    @PatchMapping("/disponibilidade/{id}")
    public ResponseEntity<EntregadorResponseDTO> alterarDisponibilidade(@PathVariable UUID id, @RequestParam boolean disponivel) {
        EntregadorResponseDTO entregador = entregadorService.alterarDisponibilidade(id, disponivel);
        return ResponseEntity.ok(entregador);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> desativarEntregador(@PathVariable UUID id) {
        entregadorService.desativarEntregador(id);
        return ResponseEntity.noContent().build();
    }
}
