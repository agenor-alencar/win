package com.win.marketplace.dto.request;

import com.win.marketplace.model.enums.TipoPinValidacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * DTO para request de validação de PIN.
 * 
 * Enviado pelo cliente (motorista ou cliente final) para validar um PIN code.
 */
public record ValidarPinRequestDTO(
    @NotNull(message = "ID da entrega é obrigatório")
    UUID entregaId,

    @NotBlank(message = "PIN code é obrigatório")
    @Size(min = 4, max = 6, message = "PIN deve ter entre 4 e 6 dígitos")
    String pin,

    @NotNull(message = "Tipo de PIN é obrigatório")
    TipoPinValidacao tipo
) {}
