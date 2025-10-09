package com.win.marketplace.controller;

import com.win.marketplace.dto.request.CupomRequestDTO;
import com.win.marketplace.dto.response.CupomResponseDTO;
import com.win.marketplace.service.CupomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cupom")
public class CupomController {

    private final CupomService cupomService;

    public CupomController(CupomService cupomService) {
        this.cupomService = cupomService;
    }

    @PostMapping("/create")
    public ResponseEntity<CupomResponseDTO> criarCupom(@RequestBody CupomRequestDTO requestDTO) {
        CupomResponseDTO response = cupomService.criarCupom(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/all")
    public ResponseEntity<List<CupomResponseDTO>> listarCupons() {
        List<CupomResponseDTO> cupons = cupomService.listarCupons();
        return ResponseEntity.ok(cupons);
    }

    @GetMapping("/list/id/{id}")
    public ResponseEntity<CupomResponseDTO> buscarPorId(@PathVariable UUID id) {
        CupomResponseDTO cupom = cupomService.buscarPorId(id);
        return ResponseEntity.ok(cupom);
    }

    @GetMapping("/list/codigo/{codigo}")
    public ResponseEntity<CupomResponseDTO> buscarPorCodigo(@PathVariable String codigo) {
        CupomResponseDTO cupom = cupomService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(cupom);
    }

    @GetMapping("/validar/{codigo}")
    public ResponseEntity<CupomResponseDTO> validarCupom(@PathVariable String codigo) {
        CupomResponseDTO cupom = cupomService.validarCupom(codigo);
        return ResponseEntity.ok(cupom);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CupomResponseDTO> atualizarCupom(@PathVariable UUID id, @RequestBody CupomRequestDTO requestDTO) {
        CupomResponseDTO cupom = cupomService.atualizarCupom(id, requestDTO);
        return ResponseEntity.ok(cupom);
    }

    @PatchMapping("/incrementar-uso/{cupomId}")
    public ResponseEntity<Void> incrementarUso(@PathVariable UUID cupomId) {
        cupomService.incrementarUso(cupomId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletarCupom(@PathVariable UUID id) {
        cupomService.deletarCupom(id);
        return ResponseEntity.noContent().build();
    }
}
