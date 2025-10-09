package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoCreateRequestDTO(
    @NotBlank(message = "Nome do produto é obrigatório")
    @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
    String nome,

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    String descricao,

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    BigDecimal preco,

    @NotNull(message = "Categoria é obrigatória")
    UUID categoriaId,

    @NotNull(message = "Estoque é obrigatório")
    @Min(value = 0, message = "Estoque não pode ser negativo")
    Integer estoque,

    @Size(max = 100, message = "SKU deve ter no máximo 100 caracteres")
    String sku,

    @DecimalMin(value = "0.001", message = "Peso deve ser maior que zero")
    BigDecimal peso,

    @Size(max = 50, message = "Unidade de medida deve ter no máximo 50 caracteres")
    String unidadeMedida,

    @Size(max = 200, message = "Marca deve ter no máximo 200 caracteres")
    String marca,

    @Size(max = 200, message = "Modelo deve ter no máximo 200 caracteres")
    String modelo,

    @Size(max = 500, message = "Características devem ter no máximo 500 caracteres")
    String caracteristicas
) {}
