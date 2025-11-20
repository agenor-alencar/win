package com.win.marketplace.dto.response;

import com.win.marketplace.model.Devolucao;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de resposta para devolução
 */
public record DevolucaoResponseDTO(
    UUID id,
    String numeroDevolucao,
    UUID pedidoId,
    String numeroPedido,
    UUID itemPedidoId,
    UUID produtoId,
    String produtoNome,
    UUID usuarioId,
    String usuarioNome,
    String usuarioEmail,
    UUID lojistaId,
    String lojistaNome,
    Devolucao.MotivoDevolucao motivoDevolucao,
    String descricao,
    Integer quantidadeDevolvida,
    BigDecimal valorDevolucao,
    Devolucao.StatusDevolucao status,
    String justificativaLojista,
    OffsetDateTime dataAprovacao,
    OffsetDateTime dataRecusa,
    OffsetDateTime dataReembolso,
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {}
