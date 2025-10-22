package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvaliacaoResponseDTO(
    UUID id,
    UUID usuarioId,
    String usuarioNome,
    UUID produtoId,
    String produtoNome,
    UUID pedidoId,
    Integer nota,
    String comentario,
    OffsetDateTime criadoEm
) {}
