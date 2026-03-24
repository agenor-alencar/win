package com.win.marketplace.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para requisição de geocoding
 * Recebe um endereço em string e retorna as coordenadas
 */
public record GeocodingRequestDTO(
    @NotBlank(message = "Endereço não pode estar vazio")
    String endereco,
    
    String cidade,
    String estado,
    String pais
) {}
