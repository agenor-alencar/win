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
    String email,
    String site,
    String inscricaoEstadual,
    String logoUrl,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String uf,
    String cep,
    String status,
    String statusAprovacao,
    Boolean ativo,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
