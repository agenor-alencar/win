package com.win.marketplace.controller;

import com.win.marketplace.dto.request.ConfiguracaoRequestDTO;
import com.win.marketplace.dto.response.ConfiguracaoResponseDTO;
import com.win.marketplace.service.ConfiguracaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para gerenciar configurações do sistema
 * Apenas administradores podem acessar
 */
@RestController
@RequestMapping("/api/v1/admin/configuracoes")
@RequiredArgsConstructor
@Slf4j
public class ConfiguracaoController {

    private final ConfiguracaoService configuracaoService;

    /**
     * Busca configurações ativas do sistema
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoResponseDTO> buscarConfigAtiva() {
        log.info("Requisição para buscar configurações ativas");
        ConfiguracaoResponseDTO config = configuracaoService.buscarConfigAtiva();
        return ResponseEntity.ok(config);
    }

    /**
     * Atualiza configurações do sistema
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoResponseDTO> atualizarConfig(
            @Valid @RequestBody ConfiguracaoRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Requisição para atualizar configurações por: {}", userDetails.getUsername());
        ConfiguracaoResponseDTO config = configuracaoService.atualizarConfig(dto, userDetails.getUsername());
        return ResponseEntity.ok(config);
    }

    /**
     * Restaura configurações para valores padrão
     */
    @PostMapping("/restaurar-padrao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoResponseDTO> restaurarPadrao(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Requisição para restaurar configurações padrão por: {}", userDetails.getUsername());
        ConfiguracaoResponseDTO config = configuracaoService.restaurarPadrao(userDetails.getUsername());
        return ResponseEntity.ok(config);
    }
}
