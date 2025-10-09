package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EnderecoResponseDTO(
    UUID id,
    UUID usuarioId,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado,
    String cep,
    String tipoEndereco, // RESIDENCIAL, COMERCIAL, COBRANÇA, ENTREGA
    Boolean principal,
    Boolean ativo,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
