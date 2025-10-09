package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record VariacaoProdutoResponseDTO(
    UUID id,
    UUID produtoId,
    String nome,
    String valor,
    BigDecimal precoAdicional,
    Integer estoque,
    String sku,
    Boolean ativo,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
