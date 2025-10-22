package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record NotificacaoRequestDTO(
    
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,
    
    @NotBlank(message = "Tipo é obrigatório")
    @Size(max = 50, message = "Tipo deve ter no máximo 50 caracteres")
    String tipo, // "INFO", "AVISO", "ERRO", "SUCESSO"
    
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    String titulo,
    
    @NotBlank(message = "Mensagem é obrigatória")
    String mensagem,
    
    @NotBlank(message = "Canal é obrigatório")
    @Size(max = 50, message = "Canal deve ter no máximo 50 caracteres")
    String canal // "SISTEMA", "EMAIL", "SMS", "PUSH"
) {}
