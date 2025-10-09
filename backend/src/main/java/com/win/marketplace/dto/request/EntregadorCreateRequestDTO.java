package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record EntregadorCreateRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotBlank(message = "CNH é obrigatória")
    @Size(min = 11, max = 11, message = "CNH deve ter 11 dígitos")
    String cnh,

    @NotBlank(message = "Categoria da CNH é obrigatória")
    @Size(max = 5, message = "Categoria deve ter no máximo 5 caracteres")
    String categoriaCnh,

    @NotBlank(message = "Tipo de veículo é obrigatório")
    @Size(max = 50, message = "Tipo de veículo deve ter no máximo 50 caracteres")
    String tipoVeiculo,

    @NotBlank(message = "Placa do veículo é obrigatória")
    @Pattern(regexp = "[A-Z]{3}[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-[0-9]{4}", message = "Placa deve estar no formato ABC1234 ou ABC-1234")
    String placaVeiculo,

    @Size(max = 100, message = "Modelo do veículo deve ter no máximo 100 caracteres")
    String modeloVeiculo,

    @Size(max = 50, message = "Cor do veículo deve ter no máximo 50 caracteres")
    String corVeiculo
) {}
