package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record UsuarioPerfilRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotNull(message = "ID do perfil é obrigatório")
    UUID perfilId
) {}
