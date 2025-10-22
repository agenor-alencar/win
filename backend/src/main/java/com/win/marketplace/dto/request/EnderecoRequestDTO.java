package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record EnderecoRequestDTO(
    @Size(max = 100, message = "Apelido deve ter no máximo 100 caracteres")
    String apelido,

    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
    String cep,

    @NotBlank(message = "Logradouro é obrigatório")
    @Size(max = 200, message = "Logradouro deve ter no máximo 200 caracteres")
    String logradouro,

    @Size(max = 20, message = "Número deve ter no máximo 20 caracteres")
    String numero,

    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    String complemento,

    @NotBlank(message = "Bairro é obrigatório")
    @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
    String bairro,

    @NotBlank(message = "Cidade é obrigatória")
    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
    String cidade,

    @NotBlank(message = "Estado é obrigatório")
    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres (UF)")
    @Pattern(regexp = "[A-Z]{2}", message = "Estado deve ser uma UF válida em maiúsculas")
    String estado,

    Boolean principal
) {}
