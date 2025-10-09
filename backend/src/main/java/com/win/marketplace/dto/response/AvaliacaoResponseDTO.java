package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvaliacaoResponseDTO(
    UUID id,
    UUID clienteId,
    String clienteNome,
    UUID avaliadoId,  // Pode ser produtoId, lojistaId
    String avaliadoNome,
    String avaliadoTipo, // "PRODUTO", "LOJISTA"
    UUID pedidoId,
    Integer nota,
    String comentario,
    OffsetDateTime dataAvaliacao
) {}
