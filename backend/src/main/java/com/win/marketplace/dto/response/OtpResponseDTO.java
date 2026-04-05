package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO de resposta para solicitação de código OTP
 * 
 * Endpoint: POST /api/v1/auth/request-code
 * 
 * Resposta de sucesso (HTTP 200):
 * {
 *   "telefone": "+5511987654321",
 *   "mensagem": "Código de verificação enviado com sucesso via SMS",
 *   "tempo_expiracao_segundos": 300
 * }
 * 
 * Resposta de erro - Rate Limit (HTTP 429):
 * {
 *   "status": 429,
 *   "error": "Too Many Requests",
 *   "message": "Muitos codigos solicitados. Tente novamente em 60 segundos"
 * }
 * 
 * Resposta de erro - Twilio indisponível (HTTP 503):
 * {
 *   "status": 503,
 *   "error": "Service Unavailable",
 *   "message": "Falha ao enviar SMS. Tente novamente em alguns minutos"
 * }
 */
public record OtpResponseDTO(
    String telefone,
    String mensagem,
    
    @JsonProperty("tempo_expiracao_segundos")
    Integer tempoExpiracaoSegundos
) {
    /**
     * Factory method para criar resposta de sucesso
     * 
     * @param telefone Número de telefone
     * @param tempoExpiracaoSegundos Tempo até expiração do código (padrão: 300 segundos = 5 minutos)
     * @return DTO de resposta
     */
    public static OtpResponseDTO sucesso(String telefone, Integer tempoExpiracaoSegundos) {
        return new OtpResponseDTO(
            telefone,
            "Código de verificação enviado com sucesso via SMS",
            tempoExpiracaoSegundos
        );
    }

    /**
     * Factory method contempo expiração padrão (5 minutos)
     * 
     * @param telefone Número de telefone
     * @return DTO de resposta
     */
    public static OtpResponseDTO sucesso(String telefone) {
        return sucesso(telefone, 300); // 5 minutos
    }
}
