package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record AvaliacaoRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    UUID pedidoId,

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    Integer nota,

    @Size(max = 1000, message = "Comentário deve ter no máximo 1000 caracteres")
    String comentario
) {}
