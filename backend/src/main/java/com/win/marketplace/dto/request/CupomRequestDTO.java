package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CupomRequestDTO(
    @NotBlank(message = "Código do cupom é obrigatório")
    @Size(max = 50, message = "Código deve ter no máximo 50 caracteres")
    String codigo,

    @Size(max = 200, message = "Descrição deve ter no máximo 200 caracteres")
    String descricao,

    @NotBlank(message = "Tipo de desconto é obrigatório")
    @Pattern(regexp = "PERCENTUAL|VALOR_FIXO", message = "Tipo de desconto deve ser PERCENTUAL ou VALOR_FIXO")
    String tipoDesconto,

    @NotNull(message = "Valor do desconto é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor do desconto deve ser maior que zero")
    BigDecimal valorDesconto,

    @DecimalMin(value = "0.00", message = "Valor mínimo do pedido não pode ser negativo")
    BigDecimal valorMinimoPedido,

    @NotNull(message = "Data de início é obrigatória")
    OffsetDateTime dataInicio,

    @NotNull(message = "Data de fim é obrigatória")
    OffsetDateTime dataFim,

    @Min(value = 1, message = "Limite de uso deve ser no mínimo 1")
    Integer limiteUso,

    Boolean ativo
) {}
