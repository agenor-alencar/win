package com.win.marketplace.controller;

import com.win.marketplace.dto.request.AdminCancelPedidoDTO;
import com.win.marketplace.dto.request.AdminUpdateStatusDTO;
import com.win.marketplace.dto.response.AdminChartDataDTO;
import com.win.marketplace.dto.response.AdminDashboardStatsDTO;
import com.win.marketplace.dto.response.AdminEntregaListDTO;
import com.win.marketplace.dto.response.AdminEntregaStatsDTO;
import com.win.marketplace.dto.response.AdminUsuarioListDTO;
import com.win.marketplace.dto.response.AdminUsuarioStatsDTO;
import com.win.marketplace.dto.response.SenhaTemporariaDTO;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.service.AdminActionService;
import com.win.marketplace.service.AdminChartService;
import com.win.marketplace.service.AdminEntregaService;
import com.win.marketplace.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller para operações administrativas do sistema
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final AdminEntregaService adminEntregaService;
    private final AdminChartService adminChartService;
    private final AdminActionService adminActionService;

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

    /**
     * Busca dados de gráficos para o dashboard administrativo
     * Requer perfil ADMIN
     */
    @GetMapping("/dashboard/chart-data")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminChartDataDTO> buscarDadosGraficos() {
        log.info("Requisição recebida para buscar dados de gráficos");
        AdminChartDataDTO chartData = adminChartService.buscarDadosGraficos();
        return ResponseEntity.ok(chartData);
    }

    /**
     * Busca estatísticas de usuários por tipo
     * Requer perfil ADMIN
     */
    @GetMapping("/usuarios/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminUsuarioStatsDTO> buscarEstatisticasUsuarios() {
        log.info("Requisição recebida para buscar estatísticas de usuários");
        AdminUsuarioStatsDTO stats = adminService.buscarEstatisticasUsuarios();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lista todos os usuários (formatados para admin)
     * Requer perfil ADMIN
     */
    @GetMapping("/usuarios/list")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminUsuarioListDTO>> listarTodosUsuarios() {
        log.info("Requisição recebida para listar todos os usuários");
        List<AdminUsuarioListDTO> usuarios = adminService.listarTodosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Busca estatísticas de entregas
     */
    @GetMapping("/entregas/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminEntregaStatsDTO> buscarEstatisticasEntregas() {
        log.info("Requisição recebida para buscar estatísticas de entregas");
        AdminEntregaStatsDTO stats = adminEntregaService.buscarEstatisticasEntregas();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lista todas as entregas
     */
    @GetMapping("/entregas/list")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminEntregaListDTO>> listarTodasEntregas() {
        log.info("Requisição recebida para listar todas as entregas");
        List<AdminEntregaListDTO> entregas = adminEntregaService.listarTodasEntregas();
        return ResponseEntity.ok(entregas);
    }

    /**
     * Lista entregas por status
     */
    @GetMapping("/entregas/list/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminEntregaListDTO>> listarEntregasPorStatus(
            @PathVariable StatusEntrega status) {
        log.info("Requisição recebida para listar entregas com status: {}", status);
        List<AdminEntregaListDTO> entregas = adminEntregaService.listarEntregasPorStatus(status);
        return ResponseEntity.ok(entregas);
    }
    /**
     * Lista entregas com problemas
     */
    @GetMapping("/entregas/list/problemas")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminEntregaListDTO>> listarEntregasComProblemas() {
        log.info("Requisição recebida para listar entregas com problemas");
        List<AdminEntregaListDTO> entregas = adminEntregaService.listarEntregasComProblemas();
        return ResponseEntity.ok(entregas);
    }

    // ===== AÇÕES ADMINISTRATIVAS =====

    /**
     * Atualiza status de um pedido
     */
    @PutMapping("/pedidos/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> atualizarStatusPedido(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateStatusDTO dto) {
        log.info("Admin atualizando status do pedido {} para {}", id, dto.status());
        adminActionService.atualizarStatusPedido(id, dto.status());
        return ResponseEntity.ok().build();
    }

    /**
     * Cancela um pedido (ação forçada)
     */
    @PutMapping("/pedidos/{id}/cancel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> cancelarPedido(
            @PathVariable UUID id,
            @Valid @RequestBody AdminCancelPedidoDTO dto) {
        log.info("Admin cancelando pedido {}", id);
        adminActionService.cancelarPedido(id, dto.motivo());
        return ResponseEntity.ok().build();
    }

    /**
     * Ativa ou desativa uma loja
     */
    @PutMapping("/lojistas/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleStatusLojista(
            @PathVariable UUID id,
            @RequestParam boolean ativar) {
        log.info("Admin {} lojista {}", ativar ? "ativando" : "desativando", id);
        adminActionService.toggleStatusLojista(id, ativar);
        return ResponseEntity.ok().build();
    }

    /**
     * Ativa ou desativa um produto
     */
    @PutMapping("/produtos/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleStatusProduto(
            @PathVariable UUID id,
            @RequestParam boolean ativar) {
        log.info("Admin {} produto {}", ativar ? "ativando" : "desativando", id);
        adminActionService.toggleStatusProduto(id, ativar);
        return ResponseEntity.ok().build();
    }

    /**
     * Reseta senha de um usuário
     */
    @PutMapping("/usuarios/{id}/reset-password")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SenhaTemporariaDTO> resetarSenhaUsuario(@PathVariable UUID id) {
        log.info("Admin resetando senha do usuário {}", id);
        String senhaTemporaria = adminActionService.resetarSenhaUsuario(id);
        return ResponseEntity.ok(SenhaTemporariaDTO.criar(senhaTemporaria));
    }

    /**
     * Ativa ou bloqueia um usuário
     */
    @PutMapping("/usuarios/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> toggleStatusUsuario(
            @PathVariable UUID id,
            @RequestParam boolean ativar) {
        log.info("Admin {} usuário {}", ativar ? "ativando" : "bloqueando", id);
        adminActionService.toggleStatusUsuario(id, ativar);
        return ResponseEntity.ok().build();
    }
}
