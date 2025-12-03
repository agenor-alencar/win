package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estatísticas de usuários do dashboard administrativo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsuarioStatsDTO {

    private Long clientes;
    private Long lojistas;
    private Long motoristas;
    private Long bloqueados;

    public static AdminUsuarioStatsDTO criar(
            Long clientes,
            Long lojistas,
            Long motoristas,
            Long bloqueados) {
        return AdminUsuarioStatsDTO.builder()
                .clientes(clientes)
                .lojistas(lojistas)
                .motoristas(motoristas)
                .bloqueados(bloqueados)
                .build();
    }
}
