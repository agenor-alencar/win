package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.TipoVeiculoUber;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO de resposta para cálculo de frete dinâmico.
 * 
 * Retornado pelo endpoint POST /api/v1/fretes/calcular
 * com valores reais da cotação Uber Direct.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreteResponseDTO {

    /**
     * Indica se o cálculo foi bem-sucedido.
     */
    private Boolean sucesso;

    /**
     * ID da cotação Uber (necessário para criar entrega com preço garantido).
     */
    private String quoteId;

    /**
     * Valor total do frete (já com taxa Win inclusa).
     */
    private BigDecimal valorFreteTotal;

    /**
     * Valor cobrado pela Uber (sem taxa Win).
     */
    private BigDecimal valorCorridaUber;

    /**
     * Taxa Win (10% sobre valor Uber).
     */
    private BigDecimal taxaWin;

    /**
     * Distância estimada em km.
     */
    private Double distanciaKm;

    /**
     * Tempo estimado de entrega em minutos.
     */
    private Integer tempoEstimadoMinutos;

    /**
     * Tipo de veículo selecionado (MOTO_PEQUENO, MOTO_GRANDE, CARRO).
     */
    private TipoVeiculoUber tipoVeiculo;

    /**
     * Mensagem descritiva para o usuário.
     */
    private String mensagem;

    /**
     * Mensagem de erro (se sucesso=false).
     */
    private String erro;

    /**
     * Indica se está usando API real ou mock.
     */
    private Boolean modoProducao;
}
