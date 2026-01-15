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
 * DTO para solicitar simulação de frete via Uber Flash.
 * Usado na página de checkout antes do pagamento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulacaoFreteRequestDTO {

    @NotNull(message = "ID do lojista é obrigatório")
    private UUID lojistaId;

    @NotBlank(message = "CEP de origem é obrigatório")
    private String cepOrigem;

    @NotBlank(message = "Endereço completo de origem é obrigatório")
    private String enderecoOrigemCompleto;

    @NotBlank(message = "CEP de destino é obrigatório")
    private String cepDestino;

    @NotBlank(message = "Endereço completo de destino é obrigatório")
    private String enderecoDestinoCompleto;

    @NotNull(message = "Peso total é obrigatório")
    private Double pesoTotalKg;

    /**
     * Coordenadas opcionais de origem (serão geocodificadas se não informadas)
     */
    private Double origemLatitude;
    private Double origemLongitude;

    /**
     * Coordenadas opcionais de destino (serão geocodificadas se não informadas)
     */
    private Double destinoLatitude;
    private Double destinoLongitude;

    /**
     * Tipo de veículo pode ser informado ou calculado automaticamente
     * baseado no peso.
     */
    private TipoVeiculoUber tipoVeiculo;

    /**
     * Obtém o tipo de veículo, calculando automaticamente se não informado.
     */
    public TipoVeiculoUber getTipoVeiculoCalculado() {
        if (tipoVeiculo != null) {
            return tipoVeiculo;
        }
        return TipoVeiculoUber.determinarPorPeso(pesoTotalKg);
    }
}
