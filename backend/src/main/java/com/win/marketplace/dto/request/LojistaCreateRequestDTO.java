package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record LojistaCreateRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 dígitos")
    String cnpj,

    @NotBlank(message = "Nome fantasia é obrigatório")
    @Size(max = 200, message = "Nome fantasia deve ter no máximo 200 caracteres")
    String nomeFantasia,

    @NotBlank(message = "Razão social é obrigatória")
    @Size(max = 200, message = "Razão social deve ter no máximo 200 caracteres")
    String razaoSocial,

    @Size(max = 5000, message = "Descrição deve ter no máximo 5000 caracteres")
    String descricao,

    @Pattern(regexp = "\\d{10,11}", message = "Telefone deve conter 10 ou 11 dígitos")
    String telefone,

    Boolean ativo
) {}
