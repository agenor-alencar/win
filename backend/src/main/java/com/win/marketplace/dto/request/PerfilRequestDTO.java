package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilRequestDTO(
    
    @NotBlank(message = "Nome do perfil é obrigatório")
    @Size(max = 50, message = "Nome do perfil deve ter no máximo 50 caracteres")
    String nome,
    
    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao,
    
    Boolean ativo
) {}
