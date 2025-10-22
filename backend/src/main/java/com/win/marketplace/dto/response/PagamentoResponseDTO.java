package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PagamentoResponseDTO(
    UUID id,
    UUID pedidoId,
    String numeroPedido,
    String metodoPagamento, // CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, DINHEIRO
    BigDecimal valor,
    Integer parcelas,
    String status, // PENDENTE, PROCESSANDO, APROVADO, REJEITADO, CANCELADO
    String transacaoId,
    String informacoesCartao,
    String observacoes,
    OffsetDateTime criadoEm
) {}
