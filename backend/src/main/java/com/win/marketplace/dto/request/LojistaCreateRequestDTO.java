package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record LojistaCreateRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "CNPJ deve estar no formato 00.000.000/0000-00")
    String cnpj,

    @NotBlank(message = "Razão social é obrigatória")
    @Size(min = 2, max = 200, message = "Razão social deve ter entre 2 e 200 caracteres")
    String razaoSocial,

    @NotBlank(message = "Nome fantasia é obrigatório")
    @Size(min = 2, max = 200, message = "Nome fantasia deve ter entre 2 e 200 caracteres")
    String nomeFantasia,

    @Size(max = 20, message = "Inscrição estadual deve ter no máximo 20 caracteres")
    String inscricaoEstadual,

    @Size(max = 20, message = "Inscrição municipal deve ter no máximo 20 caracteres")
    String inscricaoMunicipal,

    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(regexp = "\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}", message = "Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000")
    String telefone,

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao
) {}
