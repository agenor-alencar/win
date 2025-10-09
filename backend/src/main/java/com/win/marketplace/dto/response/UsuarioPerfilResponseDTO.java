package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UsuarioPerfilResponseDTO(
    UUID usuarioId,
    String usuarioNome,
    String usuarioEmail,
    UUID perfilId,
    String perfilTipo,
    String perfilDescricao,
    OffsetDateTime dataAtribuicao
) {}
