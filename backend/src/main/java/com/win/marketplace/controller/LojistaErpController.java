package com.win.marketplace.controller;

import com.win.marketplace.dto.request.ErpConfigDTO;
import com.win.marketplace.dto.response.ErpConfigResponseDTO;
import com.win.marketplace.model.enums.ErpType;
import com.win.marketplace.service.LojistaErpConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller para gerenciar integrações ERP dos lojistas
 */
@RestController
@RequestMapping("/api/v1/lojista/erp")
@RequiredArgsConstructor
@Slf4j
public class LojistaErpController {
    
    private final LojistaErpConfigService erpConfigService;
    
    /**
     * Lista tipos de ERP disponíveis
     */
    @GetMapping("/tipos")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<List<Map<String, String>>> listarTiposErp() {
        log.info("Listando tipos de ERP disponíveis");
        
        List<Map<String, String>> tipos = Arrays.stream(ErpType.values())
            .map(type -> Map.of(
                "value", type.name(),
                "label", type.getDisplayName(),
                "defaultApiUrl", type.getDefaultApiUrl() != null ? type.getDefaultApiUrl() : "",
                "requiresApiKey", String.valueOf(type.requiresApiKey())
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(tipos);
    }
    
    /**
     * Configura ou atualiza integração ERP
     */
    @PostMapping("/configurar")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<ErpConfigResponseDTO> configurarErp(
            @RequestParam UUID lojistaId,
            @Valid @RequestBody ErpConfigDTO dto) {
        
        log.info("Configurando ERP para lojista: {} - Tipo: {}", lojistaId, dto.erpType());
        
        // TODO: Validar se o usuário autenticado é dono do lojista
        ErpConfigResponseDTO response = erpConfigService.configurarErp(lojistaId, dto);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Busca configuração ERP do lojista
     */
    @GetMapping("/config")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<ErpConfigResponseDTO> buscarConfiguracao(@RequestParam UUID lojistaId) {
        log.info("Buscando configuração ERP do lojista: {}", lojistaId);
        
        // TODO: Validar se o usuário autenticado é dono do lojista
        ErpConfigResponseDTO config = erpConfigService.buscarConfiguracao(lojistaId);
        
        if (config == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(config);
    }
    
    /**
     * Desvincula ERP do lojista
     */
    @DeleteMapping("/desvincular")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<Void> desvincularErp(@RequestParam UUID lojistaId) {
        log.info("Desvinculando ERP do lojista: {}", lojistaId);
        
        // TODO: Validar se o usuário autenticado é dono do lojista
        erpConfigService.desvincularErp(lojistaId);
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * Alterna sincronização automática
     */
    @PutMapping("/toggle-sync")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<Void> toggleSincronizacao(
            @RequestParam UUID lojistaId,
            @RequestParam boolean ativar) {
        
        log.info("Alterando sincronização ERP do lojista: {} - Ativar: {}", lojistaId, ativar);
        
        // TODO: Implementar método no service para alterar apenas syncEnabled
        // Por ora, o lojista pode fazer isso via reconfiguração completa
        
        return ResponseEntity.ok().build();
    }
}
