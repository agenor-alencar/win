package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.model.enums.TipoVeiculoUber;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de resposta com informações completas da entrega.
 * Usado para consultas e exibição de detalhes ao lojista/cliente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaResponseDTO {

    private UUID id;
    private UUID pedidoId;
    
    // Tipo e valores
    private TipoVeiculoUber tipoVeiculo;
    private BigDecimal valorCorridaUber;
    private BigDecimal valorFreteCliente;
    private BigDecimal taxaWinmarket;
    
    // Status
    private StatusEntrega statusEntrega;
    private String statusDescricao;
    
    // Dados do motorista
    private String nomeMotorista;
    private String placaVeiculo;
    private String contatoMotorista;
    
    // Códigos e rastreamento
    private String codigoRetirada;
    private String codigoEntrega;
    private String urlRastreamento;
    
    // Timestamps
    private OffsetDateTime dataHoraSolicitacao;
    private OffsetDateTime dataHoraRetirada;
    private OffsetDateTime dataHoraEntrega;
    
    // Dados de auditoria
    private String clienteNome;
    private String clienteTelefone;
    private String enderecoEntrega;
    
    // Observações
    private String observacoes;
    
    // Controle
    private OffsetDateTime criadoEm;
    private OffsetDateTime atualizadoEm;
}
