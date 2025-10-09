package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ItemPedidoResponseDTO(
    UUID id,
    UUID pedidoId,
    UUID produtoId,
    String produtoNome,
    UUID variacaoProdutoId,
    String variacaoProdutoNome,
    Integer quantidade,
    BigDecimal precoUnitario,
    BigDecimal subtotal,
    String observacoes
) {}
