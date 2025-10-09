package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record UsuarioCreateRequestDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
    String email,

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "CPF deve estar no formato 000.000.000-00")
    String cpf,

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número")
    String senha,

    @Pattern(regexp = "\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}", message = "Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000")
    String telefone,

    @Past(message = "Data de nascimento deve estar no passado")
    java.time.LocalDate dataNascimento,

    @NotNull(message = "Tipo de perfil é obrigatório")
    String tipoPerfil // CLIENTE, LOJISTA, ENTREGADOR, ADMIN
) {}
