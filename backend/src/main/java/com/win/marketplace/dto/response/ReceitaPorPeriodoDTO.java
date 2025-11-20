package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para receita por período (dia/mês)
 */
public record ReceitaPorPeriodoDTO(
    LocalDate periodo,
    BigDecimal receita,
    Integer quantidadePedidos
) {}
