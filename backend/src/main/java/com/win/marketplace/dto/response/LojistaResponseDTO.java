package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record LojistaResponseDTO(
    UUID id,
    UUID usuarioId,
    String usuarioNome,
    String usuarioEmail,
    String cnpj,
    String razaoSocial,
    String nomeFantasia,
    String inscricaoEstadual,
    String inscricaoMunicipal,
    String telefone,
    String descricao,
    BigDecimal avaliacaoMedia,
    Integer totalAvaliacoes,
    Boolean ativo,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
