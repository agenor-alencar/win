package com.win.marketplace.dto.response;

import java.math.BigDecimal;

/**
 * DTO para pagamentos agrupados por método
 */
public record PagamentoPorMetodoDTO(
    String metodoPagamento,
    Integer quantidadePagamentos,
    BigDecimal valorTotal,
    BigDecimal percentual
) {}
