package com.win.marketplace.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.win.marketplace.model.enums.TipoVeiculoUber;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para requisição de cotação de frete via Uber Direct
 * 
 * Enviado para: POST /v1/customers/{customer_id}/delivery_quotes
 * 
 * Exemplo:
 * {
 *   "external_id": "pedido-12345",
 *   "pickup_location": { "latitude": -23.5505, "longitude": -46.6333 },
 *   "dropoff_location": { "latitude": -23.5505, "longitude": -46.6333 },
 *   "pickup_address": "Rua A, 123",
 *   "dropoff_address": "Rua B, 456"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberQuoteRequestDTO {
    
    /**
     * ID externo do pedido (para rastreamento)
     * Máx 100 caracteres
     */
    @NotNull(message = "External ID do pedido é obrigatório")
    @JsonProperty("external_id")
    private String externalId;
    
    /**
     * Localização de coleta (lojista)
     */
    @NotNull(message = "Localização de coleta é obrigatória")
    @JsonProperty("pickup_location")
    private LocalizacaoDTO localizacaoColeta;
    
    /**
     * Localização de entrega (cliente)
     */
    @NotNull(message = "Localização de entrega é obrigatória")
    @JsonProperty("dropoff_location")
    private LocalizacaoDTO localizacaoEntrega;
    
    /**
     * Endereço de coleta (texto)
     * Máx 500 caracteres
     */
    @JsonProperty("pickup_address")
    private String enderecoColeta;
    
    /**
     * Endereço de entrega (texto)
     * Máx 500 caracteres
     */
    @JsonProperty("dropoff_address")
    private String enderecoEntrega;
    
    /**
     * Tipo de veículo desejado (opcional)
     * Se não passar, Uber fornecerá opções disponíveis
     */
    @JsonProperty("delivery_vehicle_class")
    private String tipoVeiculo;
    
    /**
     * DTO interno para localização (lat/long)
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
