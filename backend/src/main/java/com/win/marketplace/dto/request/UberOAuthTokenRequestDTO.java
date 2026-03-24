package com.win.marketplace.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para requisição de token OAuth da Uber
 * 
 * Enviado para: POST https://auth.uber.com/oauth/v2/token
 * 
 * Esse DTO será serializado em x-www-form-urlencoded
 */
public record UberOAuthTokenRequestDTO(
    @JsonProperty("grant_type")
    String grantType,  // Sempre "client_credentials"
    
    @JsonProperty("client_id")
    String clientId,   // Seu Client ID
    
    @JsonProperty("client_secret")
    String clientSecret,  // Seu Client Secret
    
    @JsonProperty("scope")
    String scope  // "eats:write" para Uber Eats / "delivery:write" para Uber Direct
) {}
