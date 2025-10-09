package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record ItemPedidoRequestDTO(
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    Integer quantidade,

    @NotNull(message = "Preço unitário é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    BigDecimal precoUnitario,

    UUID variacaoProdutoId,

    @Size(max = 200, message = "Observações devem ter no máximo 200 caracteres")
    String observacoes
) {}
