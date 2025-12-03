package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para atualização de status pelo admin
 */
public record AdminUpdateStatusDTO(
        @NotBlank(message = "Novo status é obrigatório")
        String status
) {
}
