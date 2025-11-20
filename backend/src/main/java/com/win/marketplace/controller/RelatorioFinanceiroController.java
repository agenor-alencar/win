package com.win.marketplace.controller;

import com.win.marketplace.dto.response.RelatorioFinanceiroLojistaDTO;
import com.win.marketplace.service.RelatorioFinanceiroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Controller de Relatórios Financeiros
 * 
 * Permissões:
 * - Relatórios do lojista: LOJISTA ou ADMIN
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/relatorios-financeiros")
@RequiredArgsConstructor
@Tag(name = "Relatórios Financeiros", description = "Endpoints para relatórios financeiros do lojista")
public class RelatorioFinanceiroController {

    private final RelatorioFinanceiroService relatorioFinanceiroService;

    /**
     * Gera relatório financeiro completo para um lojista
     */
    @GetMapping("/lojista/{lojistaId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Relatório financeiro do lojista", description = "Gera relatório financeiro completo para um lojista em um período")
    public ResponseEntity<RelatorioFinanceiroLojistaDTO> gerarRelatorioLojista(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId,
            @Parameter(description = "Data início (formato: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataInicio,
            @Parameter(description = "Data fim (formato: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataFim) {
        
        log.info("GET /api/v1/relatorios-financeiros/lojista/{} - Período: {} a {}", lojistaId, dataInicio, dataFim);
        RelatorioFinanceiroLojistaDTO relatorio = relatorioFinanceiroService.gerarRelatorioLojista(lojistaId, dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Gera relatório financeiro dos últimos 30 dias
     */
    @GetMapping("/lojista/{lojistaId}/ultimos-30-dias")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Relatório dos últimos 30 dias", description = "Gera relatório financeiro dos últimos 30 dias")
    public ResponseEntity<RelatorioFinanceiroLojistaDTO> gerarRelatorioUltimos30Dias(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId) {
        
        log.info("GET /api/v1/relatorios-financeiros/lojista/{}/ultimos-30-dias", lojistaId);
        OffsetDateTime dataFim = OffsetDateTime.now();
        OffsetDateTime dataInicio = dataFim.minusDays(30);
        RelatorioFinanceiroLojistaDTO relatorio = relatorioFinanceiroService.gerarRelatorioLojista(lojistaId, dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Gera relatório financeiro do mês atual
     */
    @GetMapping("/lojista/{lojistaId}/mes-atual")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Relatório do mês atual", description = "Gera relatório financeiro do mês atual")
    public ResponseEntity<RelatorioFinanceiroLojistaDTO> gerarRelatorioMesAtual(
            @Parameter(description = "ID do lojista") @PathVariable UUID lojistaId) {
        
        log.info("GET /api/v1/relatorios-financeiros/lojista/{}/mes-atual", lojistaId);
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime dataInicio = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime dataFim = now;
        RelatorioFinanceiroLojistaDTO relatorio = relatorioFinanceiroService.gerarRelatorioLojista(lojistaId, dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }
}
