package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record MotoristaCreateRequestDTO(
        @NotNull(message = "ID do usuário não pode ser nulo")
        UUID usuarioId,

        @NotBlank(message = "CNH não pode estar em branco")
        @Size(min = 11, max = 11, message = "CNH deve ter 11 caracteres")
        @Pattern(regexp = "\\d{11}", message = "CNH deve conter apenas números")
        String cnh,

        @NotBlank(message = "Categoria da CNH não pode estar em branco")
        @Pattern(regexp = "^(A|B|C|D|E|AB|AC|AD|AE)$", message = "Categoria da CNH inválida")
        String categoriaCnh,

        @NotBlank(message = "Tipo do veículo não pode estar em branco")
        @Size(max = 50, message = "Tipo do veículo deve ter no máximo 50 caracteres")
        String tipoVeiculo,

        @NotBlank(message = "Placa do veículo não pode estar em branco")
        @Pattern(regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$", message = "Placa do veículo inválida (formato: AAA0A00 ou AAA0000)")
        String placaVeiculo,

        @NotBlank(message = "Modelo do veículo não pode estar em branco")
        @Size(max = 100, message = "Modelo do veículo deve ter no máximo 100 caracteres")
        String modeloVeiculo,

        @Size(max = 30, message = "Cor do veículo deve ter no máximo 30 caracteres")
        String corVeiculo
) {
}
