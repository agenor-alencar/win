package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PromocaoResponseDTO(
    UUID id,
    UUID produtoId,
    String produtoNome,
    String nome,
    String descricao,
    String tipoDesconto, // PERCENTUAL, VALOR_FIXO
    BigDecimal valorDesconto,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Boolean ativa,
    LocalDateTime dataCriacao,
    LocalDateTime dataAtualizacao
) {}
