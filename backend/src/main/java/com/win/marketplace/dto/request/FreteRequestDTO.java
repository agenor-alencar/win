package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para requisição de cálculo de frete dinâmico.
 * 
 * Usado pelo endpoint POST /api/v1/fretes/calcular
 * durante o checkout para obter valor real do frete Uber Direct.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreteRequestDTO {

    /**
     * ID do lojista (origem da entrega).
     * Sistema usa coordenadas geocodificadas do lojista.
     */
    @NotNull(message = "ID do lojista é obrigatório")
    private UUID lojistaId;

    /**
     * ID do endereço de entrega (destino).
     * Sistema usa coordenadas geocodificadas do endereço.
     */
    @NotNull(message = "ID do endereço de entrega é obrigatório")
    private UUID enderecoEntregaId;

    /**
     * Peso total estimado da encomenda (em kg).
     * Influencia o tipo de veículo (moto/carro).
     */
    private Double pesoTotalKg;

    /**
     * CEP de origem (opcional - usado como fallback se lojista não geocodificado).
     */
    private String cepOrigem;

    /**
     * CEP de destino (opcional - usado como fallback se endereço não geocodificado).
     */
    private String cepDestino;
}
