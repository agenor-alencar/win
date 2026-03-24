package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para resposta de cotação de frete via Uber Direct
 * 
 * Resposta de: POST /v1/customers/{customer_id}/delivery_quotes
 * 
 * Exemplo:
 * {
 *   "quote_id": "fba8597b-b3ad-4b10-a17b-f8b9b80e3e71",
 *   "pickup_location": { "latitude": -23.5505, "longitude": -46.6333 },
 *   "dropoff_location": { "latitude": -23.5505, "longitude": -46.6333 },
 *   "fare": 45.00,
 *   "currency_code": "BRL",
 *   "pickup_estimate": 300,
 *   "dropoff_estimate": 1800
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberQuoteResponseDTO {
    
    /**
     * ID único da cotação
     * Usado para confirmar a entrega
     */
    @JsonProperty("quote_id")
    private String quoteId;
    
    /**
     * Localização de coleta
     */
    @JsonProperty("pickup_location")
    private LocalizacaoDTO localizacaoColeta;
    
    /**
     * Localização de entrega
     */
    @JsonProperty("dropoff_location")
    private LocalizacaoDTO localizacaoEntrega;
    
    /**
     * Valor da corrida (em reais)
     */
    @JsonProperty("fare")
    private BigDecimal valor;
    
    /**
     * Moeda do valor
     */
    @JsonProperty("currency_code")
    private String moeda;
    
    /**
     * Tempo estimado de chegada ao ponto de coleta (em segundos)
     * Ex: 300 = 5 minutos
     */
    @JsonProperty("pickup_estimate")
    private Long tempoEstimadoColeta;
    
    /**
     * Tempo estimado de entrega (em segundos)
     * Ex: 1800 = 30 minutos
     */
    @JsonProperty("dropoff_estimate")
    private Long tempoEstimadoEntrega;
    
    /**
     * Tipo de veículo
     */
    @JsonProperty("delivery_vehicle_class")
    private String tipoVeiculo;
    
    /**
     * Duração total da entrega em segundos
     * (diferença entre tempoEntrega e tempoColeta)
     */
    @JsonProperty("duration")
    private Long duracao;
    
    /**
     * DTO interno para localização
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocalizacaoDTO {
        
        @JsonProperty("latitude")
        private Double latitude;
        
        @JsonProperty("longitude")
        private Double longitude;
    }
}
