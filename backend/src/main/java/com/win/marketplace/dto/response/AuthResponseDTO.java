package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de resposta para autenticação
 * Contém o token JWT e os dados do usuário
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    
    /**
     * Token JWT de acesso
     */
    private String access_token;
    
    /**
     * Dados do usuário autenticado
     */
    private UsuarioResponseDTO usuario;
    
    /**
     * Tipo do token (sempre "Bearer")
     */
    @Builder.Default
    private String token_type = "Bearer";
    
    /**
     * Tempo de expiração do token em segundos (24 horas = 86400 segundos)
     */
    @Builder.Default
    private Long expires_in = 86400L;
}
