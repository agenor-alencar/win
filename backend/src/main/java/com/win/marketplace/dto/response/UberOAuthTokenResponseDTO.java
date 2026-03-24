package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resposta de token OAuth da Uber
 * 
 * Resposta do servidor: https://auth.uber.com/oauth/v2/token
 * 
 * Exemplo:
 * {
 *   "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "expires_in": 3600,
 *   "token_type": "Bearer",
 *   "scope": "delivery:write"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberOAuthTokenResponseDTO {
    
    /**
     * Token de acesso para usar nas chamadas à API da Uber
     */
    @JsonProperty("access_token")
    private String accessToken;
    
    /**
     * Tempo em segundos até o token expirar
     * Default: 3600 (1 hora)
     */
    @JsonProperty("expires_in")
    private Long expiresIn;
    
    /**
     * Tipo de token (sempre "Bearer")
     */
    @JsonProperty("token_type")
    private String tokenType;
    
    /**
     * Escopo do token (ex: "delivery:write")
     */
    @JsonProperty("scope")
    private String scope;
}
