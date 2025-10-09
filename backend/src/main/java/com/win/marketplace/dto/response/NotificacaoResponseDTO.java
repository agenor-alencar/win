package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificacaoResponseDTO(
    UUID id,
    UUID usuarioId,
    String titulo,
    String mensagem,
    String tipo, // INFO, AVISO, ERRO, SUCESSO
    String canal, // EMAIL, SMS, PUSH, SISTEMA
    UUID referencia,
    String tipoReferencia, // PEDIDO, PRODUTO, PAGAMENTO, etc.
    Boolean lida,
    OffsetDateTime dataLeitura,
    OffsetDateTime dataCriacao
) {}
