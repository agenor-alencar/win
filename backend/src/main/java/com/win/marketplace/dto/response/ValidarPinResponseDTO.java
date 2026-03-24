package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.TipoPinValidacao;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO para response de validação de PIN.
 * 
 * Retorna informações sobre o resultado da validação do PIN.
 */
public record ValidarPinResponseDTO(
    UUID pinId,
    UUID entregaId,
    TipoPinValidacao tipo,
    Boolean validado,
    String mensagem,
    Integer tentativasRestantes,
    Boolean bloqueado,
    OffsetDateTime bloqueadoAte,
    OffsetDateTime dataValidacao
) {
    /**
     * Factory method para sucesso na validação.
     */
    public static ValidarPinResponseDTO sucesso(
            UUID pinId,
            UUID entregaId,
            TipoPinValidacao tipo,
            OffsetDateTime dataValidacao) {
        return new ValidarPinResponseDTO(
                pinId,
                entregaId,
                tipo,
                true,
                "PIN validado com sucesso!",
                0,
                false,
                null,
                dataValidacao
        );
    }

    /**
     * Factory method para falha na validação.
     */
    public static ValidarPinResponseDTO falha(
            UUID pinId,
            UUID entregaId,
            TipoPinValidacao tipo,
            String mensagem,
            Integer tentativasRestantes,
            Boolean bloqueado,
            OffsetDateTime bloqueadoAte) {
        return new ValidarPinResponseDTO(
                pinId,
                entregaId,
                tipo,
                false,
                mensagem,
                tentativasRestantes,
                bloqueado,
                bloqueadoAte,
                null
        );
    }
}
