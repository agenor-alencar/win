package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EnderecoResponseDTO(
    UUID id,
    UUID usuarioId,
    String apelido,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    Boolean principal,
    Boolean ativo,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
