package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record NotificacaoRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotBlank(message = "Título é obrigatório")
    @Size(min = 2, max = 200, message = "Título deve ter entre 2 e 200 caracteres")
    String titulo,

    @NotBlank(message = "Mensagem é obrigatória")
    @Size(min = 2, max = 1000, message = "Mensagem deve ter entre 2 e 1000 caracteres")
    String mensagem,

    @NotNull(message = "Tipo de notificação é obrigatório")
    String tipo, // INFO, AVISO, ERRO, SUCESSO

    @NotNull(message = "Canal de notificação é obrigatório")
    String canal, // EMAIL, SMS, PUSH, SISTEMA

    UUID referencia,

    @Size(max = 50, message = "Tipo de referência deve ter no máximo 50 caracteres")
    String tipoReferencia // PEDIDO, PRODUTO, PAGAMENTO, etc.
) {}
