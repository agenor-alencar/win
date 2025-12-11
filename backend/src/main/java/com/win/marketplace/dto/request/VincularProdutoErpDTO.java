package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * DTO para vincular produto do Win a produto do ERP
 */
public record VincularProdutoErpDTO(
    
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,
    
    @NotBlank(message = "SKU do ERP é obrigatório")
    String erpSku,
    
    Boolean importarDados
) {
    public VincularProdutoErpDTO {
        // Se importarDados não for especificado, assume true
        if (importarDados == null) {
            importarDados = true;
        }
    }
}
