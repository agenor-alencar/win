package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PedidoResponseDTO(
    UUID id,
    UUID clienteId,
    String clienteNome,
    String status, // PENDENTE, CONFIRMADO, PREPARANDO, ENVIADO, ENTREGUE, CANCELADO
    BigDecimal valorTotal,
    BigDecimal valorDesconto,
    BigDecimal taxaEntrega,
    BigDecimal valorFinal,
    String observacoes,
    EnderecoResponseDTO enderecoEntrega,
    List<ItemPedidoResponseDTO> itens,
    PagamentoResponseDTO pagamento,
    OffsetDateTime dataPedido,
    OffsetDateTime dataConfirmacao,
    OffsetDateTime dataEntrega
) {}
