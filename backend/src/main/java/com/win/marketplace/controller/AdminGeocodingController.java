package com.win.marketplace.controller;

import com.win.marketplace.service.AdminGeocodingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller Admin para Geocodificação em massa de lojistas
 * 
 * Responsável por:
 * - Geocodificar todos os lojistas em background
 * - Geocodificar lojista específico sob demanda
 * - Atualizar banco de dados com coordenadas obtidas
 * 
 * Requer permissão: ADMIN
 */
@Slf4j
@RestController(value = "adminGeocodingController")
@RequestMapping("/api/v1/admin/geocoding")
@RequiredArgsConstructor
@Tag(name = "Admin - Geocodificação", description = "Endpoints para geocodificação de lojistas")
public class AdminGeocodingController {

    private final AdminGeocodingService adminGeocodingService;

    /**
     * Geocodificar TODOS os lojistas sem coordenadas
     * 
     * @return Relatório resumido da operação
     */
    @PostMapping("/lojistas/geocodificar-todos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Geocodificar todos os lojistas", 
               description = "Executa geocodificação em massa para todos os lojistas sem coordenadas. Pode levar vários minutos.")
    public ResponseEntity<?> geocodificarTodos() {
        log.info("🚀 [ADMIN] Requisição: Geocodificar todos os lojistas");
        
        try {
            Map<String, Object> resultado = adminGeocodingService.geocodificarTodosLojistas();
            log.info("✅ Geocodificação em massa finalizada: {}", resultado);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("❌ Erro ao iniciar geocodificação em massa: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "erro", "Falha ao iniciar geocodificação",
                        "mensagem", e.getMessage()
                    ));
        }
    }

    /**
     * Geocodificar um lojista específico
     * 
     * @param lojistaId UUID do lojista
     * @return Coordenadas atualizadas
     */
    @PostMapping("/lojistas/{lojistaId}/geocodificar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Geocodificar lojista específico",
               description = "Geocodifica um lojista individual e atualiza suas coordenadas")
    public ResponseEntity<?> geocodificarLojista(
            @PathVariable @NotBlank String lojistaId) {
        
        log.info("🔍 [ADMIN] Requisição: Geocodificar lojista {}", lojistaId);
        
        try {
            Map<String, Object> resultado = adminGeocodingService.geocodificarLojista(lojistaId);
            
            String status = (String) resultado.get("status");
            if ("erro".equals(status)) {
                return ResponseEntity.badRequest().body(resultado);
            }
            
            log.info("✅ Geocodificação do lojista concluída: {}", resultado);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Validação falhou: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "erro", "Validação falhou",
                        "mensagem", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            log.error("❌ Erro ao geocodificar lojista: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "erro", "Lojista não encontrado",
                        "mensagem", e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("❌ Erro inesperado ao geocodificar: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "erro", "Erro interno",
                        "mensagem", e.getMessage()
                    ));
        }
    }
}
