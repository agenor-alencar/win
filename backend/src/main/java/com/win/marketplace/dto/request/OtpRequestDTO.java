package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO para solicitar um código OTP via SMS
 * 
 * Endpoint: POST /api/v1/auth/request-code
 * 
 * Validações:
 * - telefone: obrigatório, deve estar no formato +55 (país) + 11 (DDD) + 9 dígitos
 * 
 * Exemplo de requisição:
 * {
 *   "telefone": "+5511987654321"
 * }
 */
public record OtpRequestDTO(
    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(
        regexp = "^\\+?55\\d{10,11}$",
        message = "Telefone deve ter formato válido (+55 + 11 dígitos ou +55 + 10 dígitos para celular com 8 dígitos). Ex: +5511987654321"
    )
    String telefone
) {}
