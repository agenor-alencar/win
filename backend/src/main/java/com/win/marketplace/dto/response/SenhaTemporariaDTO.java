package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para retornar senha temporária após reset
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SenhaTemporariaDTO {
    private String senhaTemporaria;
    private String mensagem;

    public static SenhaTemporariaDTO criar(String senha) {
        return SenhaTemporariaDTO.builder()
                .senhaTemporaria(senha)
                .mensagem("Senha resetada com sucesso. Informe ao usuário para alterar no primeiro acesso.")
                .build();
    }
}
