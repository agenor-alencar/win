package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record VariacaoProdutoRequestDTO(
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    @NotBlank(message = "SKU é obrigatório")
    String sku,

    @NotNull(message = "Preço é obrigatório")
    BigDecimal preco,

    Integer estoque,

    Map<String, Object> atributos
) {}
