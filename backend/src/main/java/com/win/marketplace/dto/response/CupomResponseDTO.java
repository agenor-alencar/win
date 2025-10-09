package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CupomResponseDTO(
    UUID id,
    String codigo,
    String descricao,
    BigDecimal valorDesconto,
    String tipoDesconto, // PERCENTUAL, VALOR_FIXO
    BigDecimal valorMinimo,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Integer limiteUso,
    Integer vezesUsado,
    Boolean ativo,
    LocalDateTime dataCriacao,
    LocalDateTime dataAtualizacao
) {}
