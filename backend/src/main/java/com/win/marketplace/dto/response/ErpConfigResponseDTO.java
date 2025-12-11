package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.ErpType;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * DTO de resposta com configuração ERP do lojista (sem expor API Key)
 */
@Builder
public record ErpConfigResponseDTO(
    String id,
    ErpType erpType,
    String erpName,
    String apiUrl,
    Boolean apiKeyConfigured,
    Integer syncFrequencyMinutes,
    Boolean syncEnabled,
    LocalDateTime lastSyncAt,
    String lastSyncStatus,
    Boolean ativo
) {
    public static ErpConfigResponseDTO fromEntity(com.win.marketplace.model.LojistaErpConfig config) {
        return ErpConfigResponseDTO.builder()
            .id(config.getId().toString())
            .erpType(config.getErpType())
            .erpName(config.getErpType().getDisplayName())
            .apiUrl(config.getApiUrl())
            .apiKeyConfigured(config.getApiKeyEncrypted() != null)
            .syncFrequencyMinutes(config.getSyncFrequencyMinutes())
            .syncEnabled(config.getSyncEnabled())
            .lastSyncAt(config.getLastSyncAt())
            .lastSyncStatus(config.getLastSyncStatus())
            .ativo(config.getAtivo())
            .build();
    }
}
