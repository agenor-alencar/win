package com.win.marketplace.dto.response;

import java.math.BigDecimal;

/**
 * DTO para estatísticas do dashboard do lojista
 */
public record LojistaEstatisticasDTO(
    Long vendasHoje,
    Long vendasOntem,
    BigDecimal receitaHoje,
    BigDecimal receitaOntem,
    Long totalPedidosPendentes,
    Long totalProdutosAtivos,
    Long totalProdutosInativos,
    Double percentualVariacaoVendas,
    Double percentualVariacaoReceita
) {
    
    public static LojistaEstatisticasDTO criar(
        Long vendasHoje, 
        Long vendasOntem,
        BigDecimal receitaHoje,
        BigDecimal receitaOntem,
        Long totalPedidosPendentes,
        Long totalProdutosAtivos,
        Long totalProdutosInativos
    ) {
        // Calcular variação percentual de vendas
        Double percentualVariacaoVendas = calcularVariacaoPercentual(
            vendasHoje != null ? vendasHoje.doubleValue() : 0.0,
            vendasOntem != null ? vendasOntem.doubleValue() : 0.0
        );
        
        // Calcular variação percentual de receita
        Double percentualVariacaoReceita = calcularVariacaoPercentual(
            receitaHoje != null ? receitaHoje.doubleValue() : 0.0,
            receitaOntem != null ? receitaOntem.doubleValue() : 0.0
        );
        
        return new LojistaEstatisticasDTO(
            vendasHoje != null ? vendasHoje : 0L,
            vendasOntem != null ? vendasOntem : 0L,
            receitaHoje != null ? receitaHoje : BigDecimal.ZERO,
            receitaOntem != null ? receitaOntem : BigDecimal.ZERO,
            totalPedidosPendentes != null ? totalPedidosPendentes : 0L,
            totalProdutosAtivos != null ? totalProdutosAtivos : 0L,
            totalProdutosInativos != null ? totalProdutosInativos : 0L,
            percentualVariacaoVendas,
            percentualVariacaoReceita
        );
    }
    
    private static Double calcularVariacaoPercentual(Double valorAtual, Double valorAnterior) {
        if (valorAnterior == null || valorAnterior == 0.0) {
            return valorAtual > 0 ? 100.0 : 0.0;
        }
        return ((valorAtual - valorAnterior) / valorAnterior) * 100.0;
    }
}
