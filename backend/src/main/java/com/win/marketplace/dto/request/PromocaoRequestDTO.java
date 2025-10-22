package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PromocaoRequestDTO(
    
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,
    
    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    String descricao,
    
    @DecimalMin(value = "0.01", message = "Percentual de desconto deve ser maior que zero")
    @DecimalMax(value = "100.00", message = "Percentual de desconto deve ser no máximo 100")
    BigDecimal percentualDesconto,
    
    @DecimalMin(value = "0.01", message = "Preço promocional deve ser maior que zero")
    BigDecimal precoPromocional,
    
    @NotNull(message = "Data de início é obrigatória")
    OffsetDateTime dataInicio,
    
    @NotNull(message = "Data de fim é obrigatória")
    OffsetDateTime dataFim,
    
    Boolean ativa
) {}
