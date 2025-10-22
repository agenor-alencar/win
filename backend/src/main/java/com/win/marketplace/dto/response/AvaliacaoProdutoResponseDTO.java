package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvaliacaoProdutoResponseDTO(
    UUID id,
    
    ProdutoBasicInfoDTO produto,
    
    UsuarioBasicInfoDTO usuario,
    
    Integer nota,
    
    String comentario,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime criadoEm,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime atualizadoEm
) {
    public record ProdutoBasicInfoDTO(
        UUID id,
        String nome
    ) {}
    
    public record UsuarioBasicInfoDTO(
        UUID id,
        String nome,
        String email
    ) {}
}
