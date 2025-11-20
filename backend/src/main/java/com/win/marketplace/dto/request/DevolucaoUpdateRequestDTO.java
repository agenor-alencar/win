package com.win.marketplace.dto.request;

import com.win.marketplace.model.Devolucao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para atualização de status de devolução pelo lojista
 */
public record DevolucaoUpdateRequestDTO(
    @NotNull(message = "Status é obrigatório")
    Devolucao.StatusDevolucao status,
    
    @Size(max = 1000, message = "Justificativa deve ter no máximo 1000 caracteres")
    String justificativaLojista
) {}
