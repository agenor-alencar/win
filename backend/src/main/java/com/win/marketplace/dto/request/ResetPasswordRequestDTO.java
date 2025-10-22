package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

public record ResetPasswordRequestDTO(
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    String email,

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número")
    String novaSenha
) {}
