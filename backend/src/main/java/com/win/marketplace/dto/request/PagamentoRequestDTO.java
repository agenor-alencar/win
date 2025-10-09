package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record PagamentoRequestDTO(
    @NotNull(message = "ID do pedido é obrigatório")
    UUID pedidoId,

    @NotNull(message = "Método de pagamento é obrigatório")
    String metodoPagamento, // CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, DINHEIRO

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    BigDecimal valor,

    @Min(value = 1, message = "Parcelas deve ser maior que zero")
    @Max(value = 12, message = "Máximo de 12 parcelas")
    Integer parcelas,

    @Size(max = 100, message = "Informações do cartão devem ter no máximo 100 caracteres")
    String informacoesCartao,

    @Size(max = 200, message = "Observações devem ter no máximo 200 caracteres")
    String observacoes
) {}
