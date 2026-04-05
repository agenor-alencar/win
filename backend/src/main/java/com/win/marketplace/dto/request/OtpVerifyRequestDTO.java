package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO para validar um código OTP
 * 
 * Endpoint: POST /api/v1/auth/verify-code
 * 
 * Validações:
 * - telefone: obrigatório, formato brasileiro +55 + DDD + número
 * - codigo: obrigatório, exatamente 6 dígitos numéricos
 * 
 * Exemplo de requisição:
 * {
 *   "telefone": "+5511987654321",
 *   "codigo": "123456"
 * }
 * 
 * Resposta de sucesso (HTTP 200):
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "usuario": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "nome": "João Silva",
 *     "email": "joao@example.com",
 *     "telefone": "+5511987654321"
 *   }
 * }
 * 
 * Resposta de erro (HTTP 401):
 * {
 *   "status": 401,
 *   "error": "Unauthorized",
 *   "message": "Código inválido ou expirado"
 * }
 */
public record OtpVerifyRequestDTO(
    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(
        regexp = "^\\+?55\\d{10,11}$",
        message = "Telefone deve ter formato válido. Ex: +5511987654321"
    )
    String telefone,

    @NotBlank(message = "Código é obrigatório")
    @Pattern(
        regexp = "^\\d{6}$",
        message = "Código deve ser exatamente 6 dígitos numéricos"
    )
    String codigo
) {}
