package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record CategoriaCreateRequestDTO(
    @NotBlank(message = "Nome da categoria é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao
) {}
