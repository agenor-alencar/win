package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UsuarioPerfilResponseDTO(
    UUID usuarioId,
    String nomeUsuario,
    String emailUsuario,
    
    UUID perfilId,
    String nomePerfil,
    String descricaoPerfil,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime dataAtribuicao // ✅ ADICIONAR
) {}
