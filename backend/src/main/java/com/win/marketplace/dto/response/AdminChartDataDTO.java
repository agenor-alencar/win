package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para dados de gráficos do dashboard administrativo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminChartDataDTO {

    private List<VendaMensal> vendas;
    private List<ReceitaMensal> receitas;
    private List<ProdutoPorCategoria> categorias;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendaMensal {
        private String mes;
        private Long quantidade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceitaMensal {
        private String mes;
        private BigDecimal valor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProdutoPorCategoria {
        private String nome;
        private Long quantidade;
    }
}
