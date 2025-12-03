package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para cancelamento de pedido pelo admin
 */
public record AdminCancelPedidoDTO(
        @NotBlank(message = "Motivo do cancelamento é obrigatório")
        String motivo
) {
}
