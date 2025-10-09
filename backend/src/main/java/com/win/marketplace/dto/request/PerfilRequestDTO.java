package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record PerfilRequestDTO(
    @NotNull(message = "Tipo do perfil é obrigatório")
    String tipo, // ADMIN, CLIENTE, LOJISTA, ENTREGADOR

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao,

    Boolean ativo
) {}
