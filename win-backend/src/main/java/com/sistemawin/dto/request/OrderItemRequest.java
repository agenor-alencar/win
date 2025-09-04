package com.sistemawin.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {
    @NotNull(message = "ID do produto é obrigatório")
    private Long productId;

    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    @NotNull(message = "Quantidade é obrigatória")
    private Integer quantity;
}
