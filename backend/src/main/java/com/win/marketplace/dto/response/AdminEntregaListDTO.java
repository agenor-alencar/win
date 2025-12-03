package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.model.enums.TipoVeiculoUber;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO simplificado para listagem administrativa de entregas
 */
@Builder
public record AdminEntregaListDTO(
    UUID id,
    UUID pedidoId,
    String numeroPedido,
    String nomeMotorista,
    String placaVeiculo,
    String contatoMotorista,
    String clienteNome,
    String clienteTelefone,
    String lojistaFantasia,
    String enderecoEntrega,
    StatusEntrega status,
    String statusDescricao,
    TipoVeiculoUber tipoVeiculo,
    BigDecimal valorFreteCliente,
    String tempoEstimado,
    String distanciaEstimada,
    OffsetDateTime dataHoraSolicitacao,
    OffsetDateTime dataHoraRetirada,
    OffsetDateTime dataHoraEntrega,
    String urlRastreamento,
    String codigoRetirada,
    String codigoEntrega,
    String observacoes
) {}
