package com.win.marketplace.service;

import com.win.marketplace.dto.response.AdminDashboardStatsDTO;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final LojistaRepository lojistaRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    /**
     * Busca estatísticas consolidadas do dashboard administrativo
     */
    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO buscarEstatisticasDashboard() {
        log.info("Buscando estatísticas do dashboard administrativo");
        
        try {
            // === TOTAIS GERAIS ===
            Long totalUsuarios = usuarioRepository.count();
            Long totalLojas = lojistaRepository.count();
            Long totalLojasAtivas = lojistaRepository.findByAtivoTrue().size() * 1L;
            Long totalPedidos = pedidoRepository.count();
            Long totalProdutos = produtoRepository.count();
            Long totalProdutosAtivos = produtoRepository.findByAtivoTrueOrderByCriadoEmDesc(
                org.springframework.data.domain.Pageable.unpaged()
            ).getTotalElements();
            
            // === MÉTRICAS DE HOJE ===
            LocalDateTime inicioHoje = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
            LocalDateTime fimHoje = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
            
            List<Pedido> pedidosHoje = pedidoRepository.findAll().stream()
                .filter(p -> p.getCriadoEm() != null 
                    && !p.getCriadoEm().isBefore(inicioHoje) 
                    && !p.getCriadoEm().isAfter(fimHoje))
                .toList();
            
            Long countPedidosHoje = (long) pedidosHoje.size();
            BigDecimal receitaHoje = pedidosHoje.stream()
                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // === MÉTRICAS DE ONTEM ===
            LocalDateTime inicioOntem = LocalDateTime.of(LocalDate.now().minusDays(1), LocalTime.MIN);
            LocalDateTime fimOntem = LocalDateTime.of(LocalDate.now().minusDays(1), LocalTime.MAX);
            
            List<Pedido> pedidosOntem = pedidoRepository.findAll().stream()
                .filter(p -> p.getCriadoEm() != null 
                    && !p.getCriadoEm().isBefore(inicioOntem) 
                    && !p.getCriadoEm().isAfter(fimOntem))
                .toList();
            
            Long countPedidosOntem = (long) pedidosOntem.size();
            BigDecimal receitaOntem = pedidosOntem.stream()
                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // === MÉTRICAS DO MÊS ATUAL ===
            YearMonth mesAtual = YearMonth.now();
            LocalDateTime inicioMesAtual = mesAtual.atDay(1).atStartOfDay();
            LocalDateTime fimMesAtual = mesAtual.atEndOfMonth().atTime(LocalTime.MAX);
            
            List<Pedido> pedidosMesAtual = pedidoRepository.findAll().stream()
                .filter(p -> p.getCriadoEm() != null 
                    && !p.getCriadoEm().isBefore(inicioMesAtual) 
                    && !p.getCriadoEm().isAfter(fimMesAtual))
                .toList();
            
            Long countPedidosMesAtual = (long) pedidosMesAtual.size();
            BigDecimal receitaMesAtual = pedidosMesAtual.stream()
                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // === MÉTRICAS DO MÊS ANTERIOR ===
            YearMonth mesAnterior = mesAtual.minusMonths(1);
            LocalDateTime inicioMesAnterior = mesAnterior.atDay(1).atStartOfDay();
            LocalDateTime fimMesAnterior = mesAnterior.atEndOfMonth().atTime(LocalTime.MAX);
            
            List<Pedido> pedidosMesAnterior = pedidoRepository.findAll().stream()
                .filter(p -> p.getCriadoEm() != null 
                    && !p.getCriadoEm().isBefore(inicioMesAnterior) 
                    && !p.getCriadoEm().isAfter(fimMesAnterior))
                .toList();
            
            Long countPedidosMesAnterior = (long) pedidosMesAnterior.size();
            BigDecimal receitaMesAnterior = pedidosMesAnterior.stream()
                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // === RECEITA TOTAL ===
            BigDecimal receitaTotal = pedidoRepository.findAll().stream()
                .filter(p -> p.getStatus() != Pedido.StatusPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Criar e retornar DTO com todas as estatísticas
            AdminDashboardStatsDTO stats = AdminDashboardStatsDTO.criar(
                totalUsuarios,
                totalLojas,
                totalLojasAtivas,
                totalPedidos,
                countPedidosHoje,
                countPedidosOntem,
                receitaHoje,
                receitaOntem,
                countPedidosMesAtual,
                countPedidosMesAnterior,
                receitaMesAtual,
                receitaMesAnterior,
                receitaTotal,
                totalProdutos,
                totalProdutosAtivos
            );
            
            log.info("Estatísticas do dashboard carregadas com sucesso: {} usuários, {} lojas, {} pedidos", 
                totalUsuarios, totalLojas, totalPedidos);
            
            return stats;
            
        } catch (Exception e) {
            log.error("Erro ao buscar estatísticas do dashboard", e);
            // Retornar estatísticas zeradas em caso de erro
            return AdminDashboardStatsDTO.criar(
                0L, 0L, 0L, 0L, 0L, 0L,
                BigDecimal.ZERO, BigDecimal.ZERO,
                0L, 0L,
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO,
                0L, 0L
            );
        }
    }
}
