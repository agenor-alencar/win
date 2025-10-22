package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record VariacaoProdutoResponseDTO(
    UUID id,
    UUID produtoId,
    String sku,
    BigDecimal preco,
    Integer estoque,
    Map<String, Object> atributos
) {}
