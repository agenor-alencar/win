package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ImagemProdutoResponseDTO(
    UUID id,
    UUID produtoId,
    String url,
    String textoAlternativo,
    Integer ordemExibicao,
    OffsetDateTime criadoEm
) {}
