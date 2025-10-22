package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record CategoriaCreateRequestDTO(
    @NotBlank(message = "Nome da categoria é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,

    @Size(max = 5000, message = "Descrição deve ter no máximo 5000 caracteres")
    String descricao
) {}
