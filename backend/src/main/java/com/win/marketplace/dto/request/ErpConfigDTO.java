package com.win.marketplace.dto.request;

import com.win.marketplace.model.enums.ErpType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para configuração de ERP pelo lojista
 */
public record ErpConfigDTO(
    
    @NotNull(message = "Tipo de ERP é obrigatório")
    ErpType erpType,
    
    String apiUrl,
    
    String apiKey,
    
    @Min(value = 1, message = "Frequência de sincronização deve ser no mínimo 1 minuto")
    Integer syncFrequencyMinutes,
    
    Boolean syncEnabled
) {
    public ErpConfigDTO {
        // Valores padrão
        if (syncFrequencyMinutes == null) {
            syncFrequencyMinutes = 5;
        }
        if (syncEnabled == null) {
            syncEnabled = true;
        }
    }
}
