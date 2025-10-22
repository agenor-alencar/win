package com.win.marketplace.dto.response;

import com.win.marketplace.model.Endereco;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.model.NotaFiscal;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PedidoResponseDTO(
    UUID id,
    String numeroPedido,
    UUID usuarioId,
    String usuarioNome,
    UUID motoristaId,
    String motoristaNome,
    String status,
    BigDecimal subtotal,
    BigDecimal desconto,
    BigDecimal frete,
    BigDecimal total,
    Endereco enderecoEntrega,
    Pagamento pagamento,
    NotaFiscal notaFiscal,
    String codigoEntrega,
    BigDecimal pesoTotalKg,
    BigDecimal volumeTotalM3,
    BigDecimal maiorDimensaoCm,
    OffsetDateTime criadoEm,
    OffsetDateTime confirmadoEm,
    OffsetDateTime entregueEm,
    List<ItemPedidoResponseDTO> itens
) {}
