package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CupomResponseDTO(
    UUID id,
    String codigo,
    String descricao,
    String tipoDesconto,
    BigDecimal valorDesconto,
    BigDecimal valorMinimoPedido,
    OffsetDateTime dataInicio,
    OffsetDateTime dataFim,
    Integer limiteUso,
    Integer vezesUsado,
    Boolean ativo,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
