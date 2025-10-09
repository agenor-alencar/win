package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PedidoCupomResponseDTO(
    UUID pedidoId,
    UUID cupomId,
    String cupomCodigo,
    BigDecimal valorDesconto,
    String tipoDesconto // PERCENTUAL, VALOR_FIXO
) {}
