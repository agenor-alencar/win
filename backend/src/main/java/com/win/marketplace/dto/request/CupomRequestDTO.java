package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CupomRequestDTO(
    @NotBlank(message = "Código do cupom é obrigatório")
    @Size(min = 3, max = 20, message = "Código deve ter entre 3 e 20 caracteres")
    String codigo,

    @Size(max = 200, message = "Descrição deve ter no máximo 200 caracteres")
    String descricao,

    @NotNull(message = "Valor do desconto é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor do desconto deve ser maior que zero")
    BigDecimal valorDesconto,

    @NotNull(message = "Tipo do desconto é obrigatório")
    String tipoDesconto, // PERCENTUAL, VALOR_FIXO

    @DecimalMin(value = "0.00", message = "Valor mínimo não pode ser negativo")
    BigDecimal valorMinimo,

    @NotNull(message = "Data de início é obrigatória")
    LocalDateTime dataInicio,

    @NotNull(message = "Data de fim é obrigatória")
    LocalDateTime dataFim,

    @Min(value = 1, message = "Limite de uso deve ser maior que zero")
    Integer limiteUso
) {}
