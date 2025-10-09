package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record AvaliacaoRequestDTO(
    @NotNull(message = "ID do produto/lojista é obrigatório")
    UUID avaliadoId,

    @NotNull(message = "Tipo de avaliado é obrigatório")
    String avaliadoTipo, // "PRODUTO", "LOJISTA"

    @NotNull(message = "ID do pedido é obrigatório")
    UUID pedidoId,

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 1, message = "Nota deve ser entre 1 e 5")
    @Max(value = 5, message = "Nota deve ser entre 1 e 5")
    Integer nota,

    @Size(max = 500, message = "Comentário deve ter no máximo 500 caracteres")
    String comentario
) {}
