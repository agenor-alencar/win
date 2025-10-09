package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EntregadorResponseDTO(
    UUID id,
    UUID usuarioId,
    String usuarioNome,
    String usuarioEmail,
    String cnh,
    String categoriaCnh,
    String tipoVeiculo,
    String placaVeiculo,
    String modeloVeiculo,
    String corVeiculo,
    Boolean disponivel,
    Boolean ativo,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
