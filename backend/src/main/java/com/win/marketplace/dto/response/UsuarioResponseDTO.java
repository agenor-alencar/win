package com.win.marketplace.dto.response;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UsuarioResponseDTO(
    UUID id,
    String nome,
    String email,
    String cpf,
    String telefone,
    LocalDate dataNascimento,
    Boolean ativo,
    List<String> perfis,
    OffsetDateTime ultimoAcesso,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
