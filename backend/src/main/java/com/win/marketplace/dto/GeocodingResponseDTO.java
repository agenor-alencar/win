package com.win.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para resposta de geocoding
 * Retorna as coordenadas (latitude e longitude) de um endereço
 */
public record GeocodingResponseDTO(
    @JsonProperty("latitude")
    Double latitude,
    
    @JsonProperty("longitude")
    Double longitude,
    
    @JsonProperty("endereco_formatado")
    String enderecoFormatado,
    
    @JsonProperty("precisao")
    String precisao,
    
    @JsonProperty("tipo_localizacao")
    String tipoLocalizacao
) {}
