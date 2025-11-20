package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para mapear a resposta da API externa de consulta GTIN/EAN.
 * Contém dados logísticos do produto (peso e dimensões).
 */
public record GtinDataResponseDTO(
    @JsonProperty("gtin")
    String gtinEan,
    
    @JsonProperty("peso_bruto")
    Double pesoKg,
    
    @JsonProperty("largura")
    Double larguraCm,
    
    @JsonProperty("altura")
    Double alturaCm,
    
    @JsonProperty("comprimento")
    Double comprimentoCm,
    
    @JsonProperty("description")
    String descricao,
    
    @JsonProperty("brand")
    String marca,
    
    @JsonProperty("ncm")
    String ncm
) {
    /**
     * Valida se os dados logísticos estão presentes
     */
    public boolean hasDadosLogisticos() {
        return pesoKg != null || larguraCm != null || alturaCm != null || comprimentoCm != null;
    }
}
