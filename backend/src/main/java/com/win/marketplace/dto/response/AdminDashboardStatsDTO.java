package com.win.marketplace.dto.response;

import java.math.BigDecimal;

/**
 * DTO para estatísticas do dashboard administrativo
 */
public record AdminDashboardStatsDTO(
    // Totais gerais
    Long totalUsuarios,
    Long totalLojas,
    Long totalLojasAtivas,
    Long totalPedidos,
    
    // Métricas de hoje
    Long pedidosHoje,
    BigDecimal receitaHoje,
    
    // Métricas do mês
    Long pedidosMesAtual,
    BigDecimal receitaMesAtual,
    
    // Métricas totais
    BigDecimal receitaTotal,
    
    // Variações percentuais
    Double variacaoPedidosHoje,
    Double variacaoReceitaHoje,
    Double variacaoPedidosMes,
    Double variacaoReceitaMes,
    
    // Métricas adicionais
    Long totalProdutos,
    Long totalProdutosAtivos,
    BigDecimal ticketMedio,
    Double taxaConversao
) {
    
    public static AdminDashboardStatsDTO criar(
        Long totalUsuarios,
        Long totalLojas,
        Long totalLojasAtivas,
        Long totalPedidos,
        Long pedidosHoje,
        Long pedidosOntem,
        BigDecimal receitaHoje,
        BigDecimal receitaOntem,
        Long pedidosMesAtual,
        Long pedidosMesAnterior,
        BigDecimal receitaMesAtual,
        BigDecimal receitaMesAnterior,
        BigDecimal receitaTotal,
        Long totalProdutos,
        Long totalProdutosAtivos
    ) {
        // Calcular variação de pedidos hoje vs ontem
        Double variacaoPedidosHoje = calcularVariacaoPercentual(
            pedidosHoje != null ? pedidosHoje.doubleValue() : 0.0,
            pedidosOntem != null ? pedidosOntem.doubleValue() : 0.0
        );
        
        // Calcular variação de receita hoje vs ontem
        Double variacaoReceitaHoje = calcularVariacaoPercentual(
            receitaHoje != null ? receitaHoje.doubleValue() : 0.0,
            receitaOntem != null ? receitaOntem.doubleValue() : 0.0
        );
        
        // Calcular variação de pedidos mês atual vs mês anterior
        Double variacaoPedidosMes = calcularVariacaoPercentual(
            pedidosMesAtual != null ? pedidosMesAtual.doubleValue() : 0.0,
            pedidosMesAnterior != null ? pedidosMesAnterior.doubleValue() : 0.0
        );
        
        // Calcular variação de receita mês atual vs mês anterior
        Double variacaoReceitaMes = calcularVariacaoPercentual(
            receitaMesAtual != null ? receitaMesAtual.doubleValue() : 0.0,
            receitaMesAnterior != null ? receitaMesAnterior.doubleValue() : 0.0
        );
        
        // Calcular ticket médio
        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (totalPedidos != null && totalPedidos > 0 && receitaTotal != null) {
            ticketMedio = receitaTotal.divide(
                BigDecimal.valueOf(totalPedidos), 
                2, 
                java.math.RoundingMode.HALF_UP
            );
        }
        
        // Calcular taxa de conversão (pedidos / usuários)
        Double taxaConversao = 0.0;
        if (totalUsuarios != null && totalUsuarios > 0 && totalPedidos != null) {
            taxaConversao = (totalPedidos.doubleValue() / totalUsuarios.doubleValue()) * 100.0;
        }
        
        return new AdminDashboardStatsDTO(
            totalUsuarios != null ? totalUsuarios : 0L,
            totalLojas != null ? totalLojas : 0L,
            totalLojasAtivas != null ? totalLojasAtivas : 0L,
            totalPedidos != null ? totalPedidos : 0L,
            pedidosHoje != null ? pedidosHoje : 0L,
            receitaHoje != null ? receitaHoje : BigDecimal.ZERO,
            pedidosMesAtual != null ? pedidosMesAtual : 0L,
            receitaMesAtual != null ? receitaMesAtual : BigDecimal.ZERO,
            receitaTotal != null ? receitaTotal : BigDecimal.ZERO,
            variacaoPedidosHoje,
            variacaoReceitaHoje,
            variacaoPedidosMes,
            variacaoReceitaMes,
            totalProdutos != null ? totalProdutos : 0L,
            totalProdutosAtivos != null ? totalProdutosAtivos : 0L,
            ticketMedio,
            taxaConversao
        );
    }
    
    private static Double calcularVariacaoPercentual(Double valorAtual, Double valorAnterior) {
        if (valorAnterior == null || valorAnterior == 0.0) {
            return valorAtual > 0 ? 100.0 : 0.0;
        }
        return ((valorAtual - valorAnterior) / valorAnterior) * 100.0;
    }
}
