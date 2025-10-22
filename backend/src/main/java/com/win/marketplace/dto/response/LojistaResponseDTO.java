package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record LojistaResponseDTO(
    UUID id,
    UUID usuarioId,
    String usuarioNome,
    String usuarioEmail,
    String cnpj,
    String nomeFantasia,
    String razaoSocial,
    String descricao,
    String telefone,
    Boolean ativo,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
