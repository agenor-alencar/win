package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificacaoResponseDTO(
    UUID id,
    UUID usuarioId,
    String nomeUsuario,
    String tipo,
    String titulo,
    String mensagem,
    String canal,
    Boolean lida,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime dataLeitura,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime criadoEm
) {}
