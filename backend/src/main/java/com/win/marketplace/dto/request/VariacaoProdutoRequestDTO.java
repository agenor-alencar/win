package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record VariacaoProdutoRequestDTO(
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    @NotBlank(message = "Nome da variação é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,

    @NotBlank(message = "Valor da variação é obrigatório")
    @Size(min = 1, max = 100, message = "Valor deve ter entre 1 e 100 caracteres")
    String valor,

    @DecimalMin(value = "0.00", message = "Preço adicional não pode ser negativo")
    BigDecimal precoAdicional,

    @Min(value = 0, message = "Estoque não pode ser negativo")
    Integer estoque,

    @Size(max = 100, message = "SKU deve ter no máximo 100 caracteres")
    String sku,

    Boolean ativo
) {}
