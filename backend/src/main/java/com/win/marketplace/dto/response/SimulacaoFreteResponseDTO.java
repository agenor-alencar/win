package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.TipoVeiculoUber;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO de resposta da simulação de frete Uber Flash.
 * Retorna valores calculados para exibição ao cliente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulacaoFreteResponseDTO {

    private TipoVeiculoUber tipoVeiculo;
    
    /**
     * Valor bruto da corrida cobrado pela Uber (sem margem).
     */
    private BigDecimal valorCorridaUber;
    
    /**
     * Margem de lucro do Win (10% do valor Uber).
     */
    private BigDecimal taxaWinmarket;
    
    /**
     * Valor total a ser cobrado do cliente (valor Uber + taxa).
     */
    private BigDecimal valorFreteTotal;
    
    /**
     * Tempo estimado de entrega em minutos.
     */
    private Integer tempoEstimadoMinutos;
    
    /**
     * Distância estimada em quilômetros.
     */
    private Double distanciaKm;
    
    /**
     * Mensagem adicional (ex: "Entrega expressa em até 45 minutos").
     */
    private String mensagem;
    
    /**
     * Indica se a simulação foi bem-sucedida.
     */
    private Boolean sucesso;
    
    /**
     * Mensagem de erro caso a simulação falhe.
     */
    private String erro;
}
