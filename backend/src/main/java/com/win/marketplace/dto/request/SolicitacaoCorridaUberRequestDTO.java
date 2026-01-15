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
 * DTO para solicitar uma corrida Uber Direct.
 * Usado após o pedido ser marcado como "Pronto para Retirada".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoCorridaUberRequestDTO {

    @NotNull(message = "ID do pedido é obrigatório")
    private UUID pedidoId;

    /**
     * Quote ID retornado pela cotação.
     * IMPORTANTE: Garante o preço cotado mesmo que API Uber tenha variação.
     */
    private String quoteId;

    @NotNull(message = "Tipo de veículo é obrigatório")
    private TipoVeiculoUber tipoVeiculo;

    // Dados de origem (lojista)
    @NotBlank(message = "Endereço de origem é obrigatório")
    private String enderecoOrigemCompleto;

    @NotBlank(message = "Nome do lojista é obrigatório")
    private String nomeLojista;

    @NotBlank(message = "Telefone do lojista é obrigatório")
    private String telefoneLojista;
    
    // Geolocalização origem (opcional mas recomendado)
    private Double origemLatitude;
    private Double origemLongitude;

    // Dados de destino (cliente)
    @NotBlank(message = "Endereço de destino é obrigatório")
    private String enderecoDestinoCompleto;

    @NotBlank(message = "Nome do cliente é obrigatório")
    private String nomeCliente;

    @NotBlank(message = "Telefone do cliente é obrigatório")
    private String telefoneCliente;
    
    // Geolocalização destino (opcional mas recomendado)
    private Double destinoLatitude;
    private Double destinoLongitude;

    // Valores
    @NotNull(message = "Valor da corrida Uber é obrigatório")
    private BigDecimal valorCorridaUber;

    // Informações adicionais
    private String observacoes;
}
