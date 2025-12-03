package com.win.marketplace.controller;

import com.win.marketplace.dto.response.AdminDashboardStatsDTO;
import com.win.marketplace.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para operações administrativas do sistema
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /**
     * Busca estatísticas consolidadas para o dashboard administrativo
     * Requer perfil ADMIN
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminDashboardStatsDTO> buscarEstatisticasDashboard() {
        log.info("Requisição recebida para buscar estatísticas do dashboard");
        AdminDashboardStatsDTO stats = adminService.buscarEstatisticasDashboard();
        return ResponseEntity.ok(stats);
    }
}
