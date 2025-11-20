package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para estatísticas de vendas por produto
 */
public record ProdutoVendasDTO(
    UUID produtoId,
    String produtoNome,
    Integer quantidadeVendida,
    BigDecimal receitaTotal,
    BigDecimal precoMedio
) {}
