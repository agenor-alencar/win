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

    @Email(message = "E-mail inválido")
    @Size(max = 255, message = "E-mail deve ter no máximo 255 caracteres")
    String email,

    @Size(max = 255, message = "Site deve ter no máximo 255 caracteres")
    String site,

    @Size(max = 20, message = "Inscrição estadual deve ter no máximo 20 caracteres")
    String inscricaoEstadual,

    @Size(max = 500, message = "URL do logo deve ter no máximo 500 caracteres")
    String logoUrl,

    @Size(max = 255, message = "Logradouro deve ter no máximo 255 caracteres")
    String logradouro,

    @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
    String numero,

    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    String complemento,

    @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
    String bairro,

    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
    String cidade,

    @Size(max = 2, message = "UF deve ter 2 caracteres")
    String uf,

    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
    String cep,

    Double latitude,

    Double longitude,

    Boolean ativo
) {}
