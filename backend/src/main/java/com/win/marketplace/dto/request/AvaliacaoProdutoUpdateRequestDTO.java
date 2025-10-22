package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record AvaliacaoProdutoUpdateRequestDTO(
    
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    Integer nota,
    
    @Size(max = 1000, message = "Comentário deve ter no máximo 1000 caracteres")
    String comentario
) {}
