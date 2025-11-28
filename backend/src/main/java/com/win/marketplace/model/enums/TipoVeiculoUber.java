package com.win.marketplace.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enum para os tipos de veículo disponíveis na integração Uber Flash.
 * O tipo é determinado automaticamente com base no peso e tamanho dos produtos.
 */
@Getter
@RequiredArgsConstructor
public enum TipoVeiculoUber {
    
    UBER_MOTO("Uber Moto", "Para entregas pequenas e leves (até 10kg)"),
    UBER_CARRO("Uber Carro", "Para entregas médias e pesadas (10kg+)");
    
    private final String descricao;
    private final String criterio;
    
    /**
     * Determina o tipo de veículo com base no peso total do pedido.
     * 
     * @param pesoTotalKg Peso total do pedido em quilogramas
     * @return TipoVeiculoUber apropriado
     */
    public static TipoVeiculoUber determinarPorPeso(Double pesoTotalKg) {
        if (pesoTotalKg == null || pesoTotalKg <= 0) {
            return UBER_MOTO; // Default para moto
        }
        return pesoTotalKg <= 10.0 ? UBER_MOTO : UBER_CARRO;
    }
}
