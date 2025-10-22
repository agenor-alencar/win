package com.win.marketplace.controller;

import com.win.marketplace.dto.request.MotoristaCreateRequestDTO;
import com.win.marketplace.dto.response.MotoristaResponseDTO;
import com.win.marketplace.service.MotoristaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/motorista")
public class MotoristaController {

    private final MotoristaService motoristaService;

    public MotoristaController(MotoristaService motoristaService) {
        this.motoristaService = motoristaService;
    }

    @PostMapping("/create")
    public ResponseEntity<MotoristaResponseDTO> criarMotorista(@RequestBody @Valid MotoristaCreateRequestDTO requestDTO) {
        MotoristaResponseDTO response = motoristaService.criarMotorista(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<MotoristaResponseDTO>> listarMotoristas() {
        List<MotoristaResponseDTO> motoristas = motoristaService.listarMotoristas();
        return ResponseEntity.ok(motoristas);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<MotoristaResponseDTO> buscarPorId(@PathVariable UUID id) {
        MotoristaResponseDTO motorista = motoristaService.buscarPorId(id);
        return ResponseEntity.ok(motorista);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<MotoristaResponseDTO> buscarPorUsuarioId(@PathVariable UUID usuarioId) {
        MotoristaResponseDTO motorista = motoristaService.buscarPorUsuarioId(usuarioId);
        return ResponseEntity.ok(motorista);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MotoristaResponseDTO> atualizarMotorista(@PathVariable UUID id, @RequestBody @Valid MotoristaCreateRequestDTO requestDTO) {
        MotoristaResponseDTO motorista = motoristaService.atualizarMotorista(id, requestDTO);
        return ResponseEntity.ok(motorista);
    }

    @PatchMapping("/disponibilidade/{id}")
    public ResponseEntity<MotoristaResponseDTO> alterarDisponibilidade(@PathVariable UUID id, @RequestParam boolean disponivel) {
        MotoristaResponseDTO motorista = motoristaService.alterarDisponibilidade(id, disponivel);
        return ResponseEntity.ok(motorista);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> desativarMotorista(@PathVariable UUID id) {
        motoristaService.desativarMotorista(id);
        return ResponseEntity.noContent().build();
    }
}
