package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PerfilResponseDTO(
    UUID id,
    String tipo, // ADMIN, CLIENTE, LOJISTA, ENTREGADOR
    String descricao,
    Boolean ativo,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
