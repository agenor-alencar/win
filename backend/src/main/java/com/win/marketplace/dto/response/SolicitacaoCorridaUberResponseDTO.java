package com.win.marketplace.dto.response;

import com.win.marketplace.model.enums.StatusEntrega;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO de resposta da solicitação de corrida Uber Flash.
 * Contém dados do motorista e códigos de confirmação.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoCorridaUberResponseDTO {

    /**
     * Indica se a solicitação foi bem-sucedida.
     */
    private Boolean sucesso;
    
    /**
     * Mensagem de erro caso a solicitação falhe.
     */
    private String erro;
    
    /**
     * ID único da corrida retornado pela Uber.
     */
    private String idCorridaUber;
    
    /**
     * Status atual da entrega.
     */
    private StatusEntrega statusEntrega;
    
    // Dados do motorista
    private String nomeMotorista;
    private String placaVeiculo;
    private String contatoMotorista;
    
    // Códigos de confirmação
    private String codigoRetirada; // Para o lojista
    private String codigoEntrega;  // Para o cliente
    
    // Rastreamento
    private String urlRastreamento;
    
    // Timestamps
    private OffsetDateTime dataHoraSolicitacao;
    private Integer tempoEstimadoRetiradaMinutos;
    
    /**
     * Mensagem para exibição ao usuário.
     */
    private String mensagem;
}
