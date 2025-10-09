package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CategoriaResponseDTO(
    UUID id,
    String nome,
    String descricao,
    UUID categoriaPaiId,
    String categoriaPaiNome,
    List<CategoriaResponseDTO> subcategorias,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
