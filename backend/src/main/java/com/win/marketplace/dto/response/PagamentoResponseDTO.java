package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PagamentoResponseDTO(
    UUID id,
    UUID pedidoId,
    String metodoPagamento, // CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, DINHEIRO
    BigDecimal valor,
    String status, // PENDENTE, PROCESSANDO, APROVADO, REJEITADO, CANCELADO
    Integer parcelas,
    String informacoesCartao,
    String codigoTransacao,
    String urlComprovante,
    String observacoes,
    OffsetDateTime dataProcessamento,
    OffsetDateTime dataCriacao
) {}
