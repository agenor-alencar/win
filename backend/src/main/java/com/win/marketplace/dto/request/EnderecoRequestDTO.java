package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record EnderecoRequestDTO(
    @NotBlank(message = "Logradouro é obrigatório")
    @Size(max = 200, message = "Logradouro deve ter no máximo 200 caracteres")
    String logradouro,

    @NotBlank(message = "Número é obrigatório")
    @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
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
    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    String estado,

    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve estar no formato 00000-000")
    String cep,

    @Size(max = 50, message = "Tipo de endereço deve ter no máximo 50 caracteres")
    String tipoEndereco, // RESIDENCIAL, COMERCIAL, COBRANÇA, ENTREGA

    Boolean principal
) {}
