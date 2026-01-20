package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para estimativa rápida de frete (apenas CEP).
 * 
 * Usado para calcular frete antecipadamente na home/produto
 * antes do usuário preencher todos os dados no checkout.
 * 
 * Endpoint: GET /api/v1/fretes/estimar?cepDestino=70000000&lojistaId=uuid
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreteEstimativaRequestDTO {

    /**
     * CEP de destino (cliente).
     * Apenas 8 dígitos, sem formatação.
     */
    @NotBlank(message = "CEP de destino é obrigatório")
    private String cepDestino;

    /**
     * ID do lojista (origem).
     * Usado para calcular distância até o cliente.
     */
    @NotNull(message = "ID do lojista é obrigatório")
    private UUID lojistaId;

    /**
     * Peso estimado (kg). Se não informado, usa 1kg como padrão.
     */
    private Double pesoKg;
}
