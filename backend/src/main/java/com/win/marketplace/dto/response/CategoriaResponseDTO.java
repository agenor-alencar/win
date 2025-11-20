package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CategoriaResponseDTO(
    UUID id,
    String nome,
    String descricao,
    String icone,
    UUID categoriaPaiId,
    String categoriaPaiNome,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
