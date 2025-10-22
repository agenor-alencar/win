package com.win.marketplace.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PedidoCreateRequestDTO(
    @NotNull(message = "ID do usuário é obrigatório")
    UUID usuarioId,

    @NotNull(message = "Endereço de entrega é obrigatório")
    Map<String, Object> enderecoEntrega,

    Map<String, Object> pagamento,

    @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
    BigDecimal desconto,

    @DecimalMin(value = "0.00", message = "Frete não pode ser negativo")
    BigDecimal frete,

    @Size(max = 500, message = "Observações devem ter no máximo 500 caracteres")
    String observacoes,

    @NotEmpty(message = "Pedido deve conter pelo menos um item")
    @Valid
    List<ItemPedidoRequestDTO> itens
) {}
