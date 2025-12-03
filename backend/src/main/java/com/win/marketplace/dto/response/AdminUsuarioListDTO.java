package com.win.marketplace.dto.response;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record AdminUsuarioListDTO(
        UUID id,
        String nome,
        String email,
        String telefone,
        String cpf,
        Boolean ativo,
        OffsetDateTime criadoEm,
        List<String> perfis
) {
    public static AdminUsuarioListDTO criar(
            UUID id,
            String nome,
            String email,
            String telefone,
            String cpf,
            Boolean ativo,
            OffsetDateTime criadoEm,
            List<String> perfis
    ) {
        return AdminUsuarioListDTO.builder()
                .id(id)
                .nome(nome)
                .email(email)
                .telefone(telefone)
                .cpf(cpf)
                .ativo(ativo)
                .criadoEm(criadoEm)
                .perfis(perfis)
                .build();
    }
}
