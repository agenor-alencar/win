package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record PasswordUpdateRequestDTO(
    @NotBlank(message = "Senha atual é obrigatória")
    String senhaAtual,

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "Nova senha deve ter no mínimo 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "Nova senha deve conter ao menos uma letra minúscula, uma maiúscula e um número")
    String novaSenha,

    @NotBlank(message = "Confirmação de senha é obrigatória")
    String confirmarSenha
) {}
