package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PedidoCreateRequestDTO(
    @NotNull(message = "ID do endereço de entrega é obrigatório")
    UUID enderecoEntregaId,

    @NotEmpty(message = "Lista de itens não pode estar vazia")
    List<ItemPedidoRequestDTO> itens,

    @Size(max = 500, message = "Observações devem ter no máximo 500 caracteres")
    String observacoes,

    UUID cupomId,

    @DecimalMin(value = "0.00", message = "Taxa de entrega não pode ser negativa")
    BigDecimal taxaEntrega,

    @NotNull(message = "Método de pagamento é obrigatório")
    String metodoPagamento // CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, DINHEIRO
) {}
