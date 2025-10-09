package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record ImagemProdutoRequestDTO(
    @NotNull(message = "ID do produto é obrigatório")
    UUID produtoId,

    @NotBlank(message = "URL da imagem é obrigatória")
    @Size(max = 500, message = "URL deve ter no máximo 500 caracteres")
    String url,

    @Size(max = 200, message = "Texto alternativo deve ter no máximo 200 caracteres")
    String textoAlternativo,

    @Min(value = 0, message = "Ordem de exibição não pode ser negativa")
    Integer ordemExibicao
) {}
