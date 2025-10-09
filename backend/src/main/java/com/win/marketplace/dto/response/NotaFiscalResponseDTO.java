package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotaFiscalResponseDTO(
    UUID id,
    UUID pedidoId,
    UUID lojistaId,
    String lojistaRazaoSocial,
    String numero,
    String serie,
    String chave,
    BigDecimal valorTotal,
    BigDecimal valorImposto,
    String observacoes,
    OffsetDateTime dataEmissao,
    OffsetDateTime dataCriacao
) {}
