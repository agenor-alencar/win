package com.win.marketplace.dto.request;

import com.win.marketplace.model.enums.TipoVeiculoUber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para solicitar uma corrida Uber Flash.
 * Usado após o pedido ser marcado como "Pronto para Retirada".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoCorridaUberRequestDTO {

    @NotNull(message = "ID do pedido é obrigatório")
    private UUID pedidoId;

    @NotNull(message = "Tipo de veículo é obrigatório")
    private TipoVeiculoUber tipoVeiculo;

    // Dados de origem (lojista)
    @NotBlank(message = "Endereço de origem é obrigatório")
    private String enderecoOrigemCompleto;

    @NotBlank(message = "Nome do lojista é obrigatório")
    private String nomeLojista;

    @NotBlank(message = "Telefone do lojista é obrigatório")
    private String telefoneLojista;

    // Dados de destino (cliente)
    @NotBlank(message = "Endereço de destino é obrigatório")
    private String enderecoDestinoCompleto;

    @NotBlank(message = "Nome do cliente é obrigatório")
    private String nomeCliente;

    @NotBlank(message = "Telefone do cliente é obrigatório")
    private String telefoneCliente;

    // Valores
    @NotNull(message = "Valor da corrida Uber é obrigatório")
    private BigDecimal valorCorridaUber;

    // Informações adicionais
    private String observacoes;
}
