package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PromocaoRequestDTO(
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    @NotBlank(message = "Nome da promoção é obrigatório")
    @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
    String nome,

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao,

    @NotNull(message = "Tipo de desconto é obrigatório")
    String tipoDesconto, // PERCENTUAL, VALOR_FIXO

    @NotNull(message = "Valor do desconto é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor do desconto deve ser maior que zero")
    BigDecimal valorDesconto,

    @NotNull(message = "Data de início é obrigatória")
    LocalDateTime dataInicio,

    @NotNull(message = "Data de fim é obrigatória")
    LocalDateTime dataFim,

    Boolean ativa
) {}
